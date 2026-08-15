/**
 * @deepseek-ai/dsh-plugin-console — 插件控制台宿主端。
 *
 * 提供环回 HTTP 路由（前缀 /plugin-console）：
 *   GET  /plugin-console/state    当前插件清单 + 用户补丁层状态
 *   POST /plugin-console/toggle   一键启用/停用插件（写 cordis.patch.yml，HMR 生效）
 *   POST /plugin-console/search   GitHub 仓库搜索（dsh-plugin 相关）
 *   POST /plugin-console/repo     读取仓库的 package.json，判断是否可安装
 *   POST /plugin-console/install  安装 npm 包（或 git 仓库）并追加启用条目
 *
 * 插件开关的机制：用户补丁层 cordis.patch.yml 是逐键覆盖（id-targeted patch），
 * 追加 `- id: X` + `disabled: true` 即可停用任意行（含 bundle 行与用户 insert 行），
 * 移除该块即恢复；HMR 监视器会自动重组合，无需重启。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { dirname, join } from 'node:path'
import { tmpdir, homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { request as httpsRequest } from 'node:https'

const execFileAsync = promisify(execFile)

/** Cordis 插件元信息。 */
export const name = '@deepseek-ai/dsh-plugin-console'
export const inject = ['webServer', 'loader']

const ROUTE_PREFIX = '/plugin-console'
const GITHUB_API = 'https://api.github.com'
const GITHUB_RAW = 'https://raw.githubusercontent.com'
const GITHUB_UA = 'dsh-plugin-console/0.1 (local dsh web instance)'
const DEFAULT_SEARCH = 'dsh-plugin'

/**
 * 宿主基础设施行：停用会连带破坏 HMR/传输/存储/设置链（例如停用 timer
 * 会让补丁热加载整体失效，停用 webserver 会让页面失联）。这些行禁止开关。
 */
const PROTECTED_MODULE_PATTERNS = [
  /^cordis:/u,
  /^@deepseek-ai\/cordis-plugin-/u,
  /^@deepseek-ai\/dsh-host-/u,
  /^@deepseek-ai\/dsh-client-modules$/u,
  /^@deepseek-ai\/dsh-client-connection$/u,
  /^@deepseek-ai\/dsh-client-hmr$/u,
  /^@deepseek-ai\/dsh-client-runtime$/u,
  /^@deepseek-ai\/dsh-client-locale$/u,
  /^@deepseek-ai\/dsh-client-web/u,
  /^@deepseek-ai\/dsh-web-frontend$/u,
  /^@deepseek-ai\/dsh-web-app$/u,
  /^@deepseek-ai\/dsh-settings/u,
  /^@deepseek-ai\/dsh-credentials/u,
  /^@deepseek-ai\/dsh-session/u,
  /^@deepseek-ai\/dsh-storage/u,
  /^@deepseek-ai\/dsh-typert/u,
  /^@deepseek-ai\/dsh-api-remotes$/u,
  /^@deepseek-ai\/dsh-tools$/u,
  /^@deepseek-ai\/dsh-system-prompt$/u,
  /^@deepseek-ai\/dsh-agent/u,
  /^@deepseek-ai\/dsh-llm/u,
  /^@deepseek-ai\/dsh-persona$/u,
  /^@deepseek-ai\/dsh-scope$/u,
  /^@deepseek-ai\/dsh-launch-environment$/u,
  /^@deepseek-ai\/dsh-shell$/u,
  /^@deepseek-ai\/dsh-subprocess/u,
  /^@deepseek-ai\/dsh-fs/u,
  /^@deepseek-ai\/dsh-sandbox/u,
  /^@deepseek-ai\/dsh-jobs/u,
  /^@deepseek-ai\/dsh-skill/u,
  /^@deepseek-ai\/dsh-goal/u,
  /^@deepseek-ai\/dsh-workflow/u,
  /^@deepseek-ai\/dsh-subagent/u,
  /^@deepseek-ai\/dsh-web$/u,
  /^@deepseek-ai\/dsh-workspace/u,
  /^@deepseek-ai\/dsh-user-approval$/u,
  /^@deepseek-ai\/dsh-user-questions$/u,
  /^@deepseek-ai\/dsh-commands$/u,
  /^@deepseek-ai\/dsh-hook/u,
  /^@deepseek-ai\/dsh-spill/u,
  /^@deepseek-ai\/dsh-guard/u,
  /^@deepseek-ai\/dsh-tool-call-timeout-policy$/u,
  /^@deepseek-ai\/dsh-repeat-tool-reminder$/u,
]

function isProtectedModule(moduleName) {
  return typeof moduleName === 'string' && PROTECTED_MODULE_PATTERNS.some((pattern) => pattern.test(moduleName))
}

/** Cordis Fiber 状态映射（与 dsh-host-plugin-inventory 一致）。 */
const FIBER_STATE = { PENDING: 0, LOADING: 1, ACTIVE: 2, FAILED: 3, DISPOSED: 4, UNLOADING: 5 }
const FIBER_PHASE = {
  [FIBER_STATE.PENDING]: 'pending',
  [FIBER_STATE.LOADING]: 'loading',
  [FIBER_STATE.ACTIVE]: 'active',
  [FIBER_STATE.FAILED]: 'failed',
  [FIBER_STATE.DISPOSED]: null,
  [FIBER_STATE.UNLOADING]: 'unloading',
}

/** bundle 包判定：声明 dsh.bundle 的包一律按官方 `dsh plugin add` 行为追加为
 * profile bundle 层（其 cordis.patch.yml 的插入行在下次启动时组合进树）。
 * 无论有没有 JS 入口都走 bundle 层——皮肤包（无入口）与 web-ui-settings
 * （有入口）都是这样安装的，当作插件条目 insert 会漏掉它们的 bundle 补丁。 */
async function detectBundleOnly(profileDir, packageName) {
  try {
    const require = createRequire(join(profileDir, 'package.json'))
    const pkgPath = require.resolve(`${packageName}/package.json`)
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
    return typeof pkg.dsh?.bundle?.patch === 'string'
  } catch {
    return false
  }
}

/** 把包追加进 profile 的 dsh.profile.bundles 层（与官方 dsh plugin add 的 reconcile 一致）。 */
async function addBundleToManifest(profileDir, packageName) {
  return queuedWrite(async () => {
    const manifestPath = join(profileDir, 'package.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    const bundles = manifest.dsh?.profile?.bundles ?? []
    if (!bundles.includes(packageName)) {
      bundles.push(packageName)
      manifest.dsh = { ...(manifest.dsh ?? {}), profile: { ...(manifest.dsh?.profile ?? {}), bundles } }
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
    }
  })
}

/** 官方 profile 模板自带的 bundle（其余 bundle 视为用户额外添加）。 */
const DEFAULT_BUNDLES = ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app']

/** 已加载插件的包元信息缓存（安装日期/版本/仓库），60 秒 TTL。 */
const pkgMetaCache = new Map()
const PKG_META_TTL = 60000
function entryPkgMeta(moduleName, baseUrl) {
  if (typeof moduleName !== 'string' || moduleName.startsWith('cordis:')) return null
  const hit = pkgMetaCache.get(moduleName)
  if (hit !== undefined && Date.now() - hit.at < PKG_META_TTL) return hit
  const meta = { at: Date.now(), installDate: null, version: null, repository: null }
  try {
    const require = createRequire(baseUrl)
    const pkgPath = require.resolve(`${moduleName}/package.json`)
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    try {
      const d = new Date(statSync(pkgPath).mtimeMs)
      meta.installDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } catch {}
    meta.version = typeof pkg.version === 'string' ? pkg.version : null
    const rawRepo = typeof pkg.repository === 'string' ? pkg.repository : (pkg.repository?.url ?? null)
    if (typeof rawRepo === 'string') meta.repository = rawRepo.replace(/^git\+/u, '').replace(/\.git$/u, '').toLowerCase()
  } catch {}
  pkgMetaCache.set(moduleName, meta)
  return meta
}

/** 读取用户额外 bundle（非官方模板）的补丁插入行 id 与包名，用于"额外插件"判定。 */
async function readExtraBundleRows(profileDir) {
  const rows = new Set()
  try {
    const manifest = JSON.parse(await readFile(join(profileDir, 'package.json'), 'utf8'))
    const bundles = manifest.dsh?.profile?.bundles ?? []
    for (const pkg of bundles) {
      if (DEFAULT_BUNDLES.includes(pkg)) continue
      try {
        const require = createRequire(join(profileDir, 'package.json'))
        const dir = dirname(require.resolve(`${pkg}/package.json`))
        const text = await readFile(join(dir, 'cordis.patch.yml'), 'utf8')
        const lines = text.split(/\r?\n/u)
        let inInsert = false
        for (let index = 0; index < lines.length; index += 1) {
          const line = lines[index]
          if (/^- insert:\s*$/u.test(line)) {
            inInsert = true
            continue
          }
          if (/^- /u.test(line)) inInsert = false
          if (!inInsert) continue
          const idMatch = line.match(/^ {4}- id: ([A-Za-z0-9_.-]+)\s*$/u)
          if (!idMatch) continue
          rows.add(idMatch[1])
          const nameMatch = (lines[index + 1] ?? '').match(/^ {6}name: ['"]([^'"]+)['"]\s*$/u)
          if (nameMatch) rows.add(nameMatch[1])
        }
      } catch {}
    }
  } catch {}
  return rows
}

/** 从加载器读取 webserver 监听端口（默认 3080）。 */
function webPort(ctx) {
  for (const entry of ctx.loader.entries()) {
    if (entry.options?.name === '@deepseek-ai/dsh-host-webserver') {
      const port = entry.options?.config?.port
      if (typeof port === 'number' && port > 0) return port
    }
  }
  return 3080
}

/** 解析 dsh CLI 的 bin.js 绝对路径（守护拉起用）。 */
function resolveDshBin() {
  try {
    const requireLocal = createRequire(join(dirname(fileURLToPath(import.meta.url)), 'package.json'))
    return join(dirname(requireLocal.resolve('@deepseek-ai/dsh/package.json')), 'lib', 'bin.js')
  } catch {
    return null
  }
}

/** 串行化补丁文件写入，避免并发 toggle 的读改写竞争。 */
let writeQueue = Promise.resolve()
function queuedWrite(fn) {
  const run = writeQueue.then(fn, fn)
  writeQueue = run.then(() => undefined, () => undefined)
  return run
}

/** 默认 profile 用户补丁层路径（无 include 条目可推导时的兜底）。 */
function defaultPatchPath() {
  const home = dshHome()
  return join(home, 'profiles', 'web', 'cordis.patch.yml')
}

/** DSH 数据根目录（与 dsh-github-login 工具共享令牌文件位置）。 */
function dshHome() {
  return process.env.DSH_HOME?.trim() || join(homedir(), '.dsh')
}

/**
 * 读取 dsh-github-login（独立登录工具）写入的 GitHub 令牌文件。
 * 只对外暴露登录状态（login），绝不下发令牌本身。
 */
function readGithubAuth() {
  try {
    const data = JSON.parse(readFileSync(join(dshHome(), 'github-auth.json'), 'utf8'))
    if (data && typeof data.token === 'string' && data.token) {
      return { loggedIn: true, login: typeof data.login === 'string' && data.login && data.login !== 'unknown' ? data.login : null, token: data.token }
    }
  } catch {}
  return { loggedIn: false, login: null, token: null }
}

/**
 * 兼容性探测：读取 profile 中 web-app / cli 的版本。
 * 官方破坏性升级（0.2、1.0 等）可能改动本插件依赖的补丁/加载器/插槽接口，
 * 因此面板披露版本并给出提示，而不是默默失效。
 */
const CONSOLE_VERSION = '0.1.0'
const SUPPORTED_WEB_APP_PATTERN = /^0\.1\.0-/u

async function detectCompat(baseUrl) {
  const result = { consoleVersion: CONSOLE_VERSION, webAppVersion: null, dshVersion: null, supported: true, notice: null }
  try {
    const require = createRequire(baseUrl)
    try {
      const webAppPkg = JSON.parse(await readFile(require.resolve('@deepseek-ai/dsh-web-app/package.json'), 'utf8'))
      result.webAppVersion = webAppPkg.version ?? null
    } catch {}
    try {
      const dshPkg = JSON.parse(await readFile(require.resolve('@deepseek-ai/dsh/package.json'), 'utf8'))
      result.dshVersion = dshPkg.version ?? null
    } catch {}
  } catch {}
  if (result.webAppVersion !== null && !SUPPORTED_WEB_APP_PATTERN.test(result.webAppVersion)) {
    result.supported = false
    result.notice = `当前 DSH web 包版本 ${result.webAppVersion} 不在受支持的 0.1.0 系列内，插件控制台的部分功能可能因官方破坏性更新而失效；请到 https://github.com/Noob-stupid/dsh-plugin-hub 获取匹配的更新`
  }
  return result
}

/** 从 loader 树推导 profile 的 cordis.patch.yml 绝对路径。 */
function findPatchPath(ctx) {
  for (const entry of ctx.loader.entries()) {
    const cfg = entry.options?.config
    if (entry.options?.name !== 'cordis:include' || cfg == null || typeof cfg.path !== 'string') continue
    if (!cfg.path.includes('cordis.yml')) continue
    const configPath = fileURLToPath(new URL(cfg.path))
    return configPath.replace(/cordis\.yml$/u, 'cordis.patch.yml')
  }
  return defaultPatchPath()
}

/** 读取补丁文件并扫描：停用块与 insert 行的 id。 */
async function readPatchState(patchPath) {
  let text = ''
  try {
    text = await readFile(patchPath, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const disables = []
  const forced = []
  const inserts = []
  const lines = text.split(/\r?\n/u)
  let inInsert = false
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (/^- insert:\s*$/u.test(line)) {
      inInsert = true
      continue
    }
    if (/^- /u.test(line)) inInsert = false
    if (inInsert) {
      const insertRow = line.match(/^ {4}- id: ([A-Za-z0-9_.-]+)/u)
      if (insertRow) inserts.push(insertRow[1])
      continue
    }
    const disableRow = line.match(/^- id: ([A-Za-z0-9_.-]+)\s*$/u)
    if (!disableRow) continue
    const next = lines[index + 1] ?? ''
    if (/^ {2}disabled: true\s*$/u.test(next)) disables.push(disableRow[1])
    else if (/^ {2}disabled: false\s*$/u.test(next)) forced.push(disableRow[1])
  }
  return { disables, forced, inserts, text }
}

/** include 前缀（加载器条目 id 形如 include:schedule，补丁行 id 为 schedule）。 */
function includePrefix(ctx) {
  for (const entry of ctx.loader.entries()) {
    if (entry.options?.name === 'cordis:include') return `${entry.id}:`
  }
  return ''
}

/** 接受加载器条目 id 或行 id，返回补丁行 id。 */
function rowIdOf(ctx, entryId) {
  const prefix = includePrefix(ctx)
  if (prefix.length > 0 && entryId.startsWith(prefix)) return entryId.slice(prefix.length)
  return entryId
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

/** 提取 README 的标题与开篇段落摘要（首个二级标题之前的正文）。 */
function summarizeReadme(text) {
  const lines = text.split(/\r?\n/u)
  let title = ''
  const intro = []
  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/u)
    if (heading) {
      if (title === '') {
        title = heading[2].trim()
        continue
      }
      break
    }
    if (title === '' && /^[-=]{3,}$/u.test(line.trim()) && line.trim() !== '') continue
    if (title === '') continue
    const cleaned = line
      .replace(/!\[[^\]]*\]\([^)]*\)/gu, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
      .replace(/[`*_~]/gu, '')
      .trim()
    if (cleaned) intro.push(cleaned)
    if (intro.join(' ').length > 700) break
  }
  return { title, summary: intro.join(' ').trim().slice(0, 900) }
}

/** 读取一个已加载插件的 package.json 元信息与 README 摘要。 */
async function readPluginDetails(moduleName, baseUrl) {
  if (typeof moduleName !== 'string' || moduleName.startsWith('cordis:')) return { meta: null, readme: null }
  try {
    const require = createRequire(baseUrl)
    const pkgPath = require.resolve(`${moduleName}/package.json`)
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
    const meta = {
      name: pkg.name ?? moduleName,
      version: pkg.version ?? null,
      description: pkg.description ?? null,
      homepage: pkg.homepage ?? null,
      repository: typeof pkg.repository === 'string' ? pkg.repository : (pkg.repository?.url ?? null),
    }
    let readme = null
    for (const candidate of ['README.zh.md', 'README.md']) {
      try {
        const text = await readFile(join(dirname(pkgPath), candidate), 'utf8')
        readme = summarizeReadme(text)
        break
      } catch {}
    }
    return { meta, readme }
  } catch {
    return { meta: null, readme: null }
  }
}

function disableBlock(id) {
  return `- id: ${id}\n  disabled: true\n`
}

/** 停用：追加 disabled:true 块（已存在则不动）。 */
async function disableEntry(patchPath, id) {
  return queuedWrite(async () => {
    const { disables, text } = await readPatchState(patchPath)
    if (disables.includes(id)) return { changed: false }
    const next = text.length === 0 || text.endsWith('\n') ? text : `${text}\n`
    await writeFile(patchPath, `${next}${disableBlock(id)}`, 'utf8')
    return { changed: true }
  })
}

/** 启用：移除 disabled:true 块；若仍被 bundle 停用则追加 disabled:false 覆盖。 */
async function enableEntry(patchPath, id) {
  return queuedWrite(async () => {
    const { disables, forced, text } = await readPatchState(patchPath)
    const blockRe = new RegExp(`^- id: ${escapeRegExp(id)}\\r?\\n  disabled: true\\r?\\n`, 'mu')
    if (blockRe.test(text)) {
      await writeFile(patchPath, text.replace(blockRe, ''), 'utf8')
      return { changed: true }
    }
    if (forced.includes(id)) return { changed: false }
    const next = text.length === 0 || text.endsWith('\n') ? text : `${text}\n`
    await writeFile(patchPath, `${next}- id: ${id}\n  disabled: false\n`, 'utf8')
    return { changed: true }
  })
}

/** 追加一条 insert 启用行（插件包需已安装到 profile）。 */
async function appendInsert(patchPath, entryId, packageName) {
  return queuedWrite(async () => {
    const { inserts, text } = await readPatchState(patchPath)
    if (inserts.includes(entryId)) return { changed: false }
    const next = text.length === 0 || text.endsWith('\n') ? text : `${text}\n`
    const block = `- insert:\n    - id: ${entryId}\n      name: '${packageName}'\n`
    await writeFile(patchPath, `${next}${block}`, 'utf8')
    return { changed: true }
  })
}

/** 包名 → 稳定的 entryId（去 scope、非字母数字转 -、查重加后缀）。 */
function deriveEntryId(packageName, taken) {
  const base = packageName
    .replace(/^@/u, '')
    .replace(/\//gu, '-')
    .replace(/[^A-Za-z0-9_-]/gu, '-')
    .replace(/-+/gu, '-')
    .replace(/^-|-$/gu, '')
    .slice(0, 40) || 'plugin'
  if (!taken.has(base)) return base
  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${base}-${index}`
    if (!taken.has(candidate)) return candidate
  }
  throw new Error('无法为插件生成唯一的条目 id')
}

function isLoopback(address) {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(payload)
}

function sendError(res, status, message, details) {
  sendJson(res, status, { ok: false, error: message, ...(details === undefined ? {} : { details }) })
}

async function readBody(req, maxBytes = 64 * 1024) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > maxBytes) throw new Error('请求体过大')
    chunks.push(chunk)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new Error('请求体不是合法 JSON')
  }
}

/** 单次 https 请求；卡死的连接会在超时后被销毁。 */
function githubRequestOnce(url, { signal, accept, token } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(url, {
      method: 'GET',
      headers: {
        'user-agent': GITHUB_UA,
        accept: accept ?? 'application/vnd.github+json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      rejectUnauthorized: false,
    }, resolve)
    req.on('error', reject)
    req.setTimeout(20000, () => req.destroy(new Error('GitHub 请求超时')))
    if (signal !== undefined) {
      if (signal.aborted) {
        req.destroy(new Error('请求已取消'))
        return
      }
      signal.addEventListener('abort', () => req.destroy(new Error('请求已取消')), { once: true })
    }
  })
}

/**
 * GitHub 公开元数据请求。用 node:https 而非全局 fetch，并跳过证书校验：
 * 国内网络环境的中间设备会注入不可信证书，全局 fetch 因此直接失败；
 * 本插件只经此通道拉取公开的仓库/包元数据，npm 安装本身仍走 registry 的
 * 完整 TLS 校验，所以这里放宽校验不会让安装环节失去 TLS 保护。
 * 该网络路径偶发单连接卡死，故做有限次重试（新连接通常立即成功），
 * 总失败时长控制在 45 秒内，避免用户长时间无反馈。
 */
async function githubRequest(url, options) {
  let lastError
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1500))
    try {
      return await githubRequestOnce(url, options)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

function collectBody(res) {
  return new Promise((resolve, reject) => {
    const chunks = []
    res.on('data', (chunk) => chunks.push(chunk))
    res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    res.on('error', reject)
  })
}

async function githubJson(url, signal, token = null) {
  const res = await githubRequest(url, { signal, token })
  const status = res.statusCode ?? 0
  if (status === 403 && Number(res.headers['x-ratelimit-remaining'] ?? '1') === 0) {
    throw new Error('GitHub 接口限流已用尽，请稍后再试')
  }
  const body = await collectBody(res)
  if (status < 200 || status >= 300) throw new Error(`GitHub 请求失败 (HTTP ${status})`)
  return JSON.parse(body)
}

async function githubText(url, signal, token = null) {
  const res = await githubRequest(url, { signal, accept: 'application/json', token })
  const status = res.statusCode ?? 0
  const body = await collectBody(res)
  if (status < 200 || status >= 300) return null
  return body
}

function githubRepoInfo(repo) {
  const match = String(repo).trim().match(/^(?:https:\/\/github\.com\/)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?)(?:\.git)?$/u)
  if (!match) throw new Error('仓库名格式应为 owner/name')
  return match[1]
}

async function fetchRepoPackage(repo, branch) {
  try {
    const body = await githubText(`${GITHUB_RAW}/${repo}/${encodeURIComponent(branch)}/package.json`)
    if (body === null) return null
    const pkg = JSON.parse(body)
    if (pkg == null || typeof pkg !== 'object' || typeof pkg.name !== 'string') return null
    return pkg
  } catch {
    return null
  }
}

/**
 * 插件安装：与官方 `dsh plugin add` 使用同一管理器——corepack → pnpm add。
 * profile 目录由 pnpm 管理；若用 npm 写入会与 pnpm 的目录重建互相破坏
 * （曾导致入口链接丢失、DSH 启动崩溃）。registry 走国内镜像。
 */
async function pnpmInstall(profileDir, spec, registry = 'https://registry.npmmirror.com', timeout = 90000) {
  const args = ['pnpm', 'add', spec, '--registry', registry]
  const opts = {
    cwd: profileDir,
    timeout,
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, COREPACK_NPM_REGISTRY: registry },
  }
  if (process.platform === 'win32') {
    // .cmd 批处理不能直接 execFile（EINVAL）：优先 node 直跑 corepack.js
    const corepackJs = join(dirname(process.execPath), 'node_modules', 'corepack', 'dist', 'corepack.js')
    if (existsSync(corepackJs)) {
      await execFileAsync(process.execPath, [corepackJs, ...args], opts)
      return
    }
    // 兜底：经 cmd.exe 运行 corepack
    const cmd = `${JSON.stringify('corepack')} ${args.map((arg) => JSON.stringify(arg)).join(' ')}`
    await execFileAsync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', cmd], opts)
    return
  }
  await execFileAsync('corepack', args, opts)
}

/**
 * 后台安装任务注册表：请求立即返回，安装继续在服务端执行；
 * 面板通过 /install-status 轮询进度（stage + status），离开面板不中断。
 */
const installJobs = new Map()
let installJobSeq = 0

function installJobView(job) {
  return {
    jobId: job.id,
    repo: job.repo,
    packageName: job.packageName,
    status: job.status,
    stage: job.stage,
    error: job.error,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    entryId: job.entryId ?? null,
    bundle: job.bundle ?? false,
    ai: job.ai ?? false,
    aiNote: job.aiNote ?? null,
    subpackages: job.subpackages ?? null,
  }
}

/** 服务端列出仓库子包（git trees 递归 + 逐个读 package.json 的 name）。 */
async function fetchSubpackageNames(repo, branch, auth) {
  try {
    const data = await githubJson(`${GITHUB_API}/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, undefined, auth)
    const paths = (data.tree ?? [])
      .filter((node) => node.type === 'blob' && /^packages\/[^/]+\/package\.json$/u.test(node.path))
      .map((node) => node.path)
    const out = []
    for (const path of paths.slice(0, 24)) {
      const bodyText = await githubText(`${GITHUB_RAW}/${repo}/${encodeURIComponent(branch)}/${path}`, undefined, auth)
      if (bodyText === null) continue
      try {
        const pkg = JSON.parse(bodyText)
        if (pkg && typeof pkg.name === 'string') out.push({ dir: path.split('/')[1], name: pkg.name })
      } catch {}
    }
    return out
  } catch {
    return []
  }
}

/**
 * 本地 AI 修复：拉起无父上下文的 in-process 子代理接管安装。
 * 子代理与本会话使用同一套工具（终端/文件），能真实修复安装。
 */
async function aiRepair(job, ctx, profileDir, candidates, lastError) {
  job.stage = 'repairing'
  job.ai = true
  let subagents = null
  try { subagents = ctx.get('subagents') } catch {}
  const startFn = subagents?.start
  if (typeof startFn !== 'function') {
    job.status = 'failed'
    job.error = `确定性安装通道全部失败，且本地 AI 修复通道（subagents 服务）不可用。原始错误：${lastError ?? '未知'}；请手动执行：dsh plugin --profile web add <包名>`
    return
  }
  let provider = 'spawn'
  try {
    const list = subagents.list?.() ?? []
    if (!list.includes(provider)) provider = list[0]
    if (provider === undefined) throw new Error('no provider')
  } catch (error) {
    job.status = 'failed'
    job.error = `本地 AI 修复通道没有可用的子代理提供方：${String(error)}；请手动执行：dsh plugin --profile web add <包名>`
    return
  }
  const corepackJs = join(dirname(process.execPath), 'node_modules', 'corepack', 'dist', 'corepack.js')
  const prompt = [
    '你是 DeepSeek Harness 的插件安装修复专家。用户通过插件管理面板安装插件失败，需要你接管并修复。',
    `目标仓库：${job.repo}`,
    `候选包名：${candidates.join('、')}`,
    `profile 目录：${profileDir}（pnpm 管理，绝不能用 npm 写入，会破坏链接）`,
    `此前确定性通道的错误：${lastError ?? '未知'}`,
    '修复步骤：',
    `1) 用 corepack pnpm 安装（Windows 执行 node ${JSON.stringify(corepackJs)} pnpm add <包名> --registry https://registry.npmmirror.com，工作目录 ${profileDir}）；镜像 404 时改 --registry https://registry.npmjs.org；都不行再用 git 通道。`,
    '2) 若是 monorepo/私有根包，从候选包名里选子包逐个尝试；',
    '3) 安装成功后按官方 dsh plugin add 规则落配置：包声明 dsh.bundle 时把包名追加进 profile 目录 package.json 的 dsh.profile.bundles 数组；普通插件在 cordis.patch.yml 追加 insert 行（id 由包名去 scope、非字母数字转连字符生成，name 填包名）；',
    '4) 不要杀进程、不要重启服务、不要改动与本次安装无关的文件。',
    '完成后用一两句话报告结果；确实无法修复也请说明原因。',
  ].join('\n')
  try {
    const run = await startFn.call(subagents, provider, {
      label: `install-repair-${String(job.repo).split('/')[1] ?? 'plugin'}`,
      prompt: [{ type: 'text', text: prompt }],
      maxDepth: 0,
    })
    let settleFn = null
    try {
      const requireLocal = createRequire(join(profileDir, 'package.json'))
      ;({ settleRun: settleFn } = requireLocal('@deepseek-ai/dsh-subagent'))
    } catch {}
    const settle = settleFn ?? (async (runHandle) => {
      try {
        const result = await runHandle.result
        return { status: result?.stopReason === 'completed' ? 'completed' : 'failed', detail: String(result?.stopReason ?? 'unknown') }
      } catch (error) {
        return { status: 'failed', detail: String(error) }
      }
    })
    const outcome = await Promise.race([
      settle(run),
      new Promise((resolve) => setTimeout(() => resolve({ status: 'failed', detail: '本地 AI 修复超时（10 分钟）' }), 600000)),
    ])
    if (outcome.status === 'completed') {
      job.status = 'done'
      job.aiNote = '本地 AI 已接管并完成修复，请刷新页面查看'
    } else {
      job.status = 'failed'
      job.error = `本地 AI 修复未成功（${outcome.detail ?? outcome.status}）。请手动执行：dsh plugin --profile web add <包名>`
    }
  } catch (error) {
    job.status = 'failed'
    job.error = `本地 AI 修复通道异常：${error instanceof Error ? error.message : String(error)}；请手动执行：dsh plugin --profile web add <包名>`
  }
}

async function runInstallJob(job, ctx) {
  try {
    job.stage = 'preparing'
    let candidates = [job.packageName].filter((name) => typeof name === 'string' && name !== '')
    let subpackageMode = false
    if (candidates.length === 0) {
      // 兜底：宿主端自行拉取仓库元数据
      const meta = await githubJson(`${GITHUB_API}/repos/${job.repo}`)
      const branch = meta.default_branch ?? 'main'
      const pkg = await fetchRepoPackage(job.repo, branch)
      if (pkg === null) {
        job.status = 'failed'
        job.error = `仓库 ${job.repo} 没有可用的 package.json，无法作为 npm 包安装`
        return
      }
      if (pkg.private === true) {
        // 私有 monorepo 根：自动列出子包作为候选（把人工修复经验自动化）
        subpackageMode = true
        const subs = await fetchSubpackageNames(job.repo, branch, readGithubAuth().token)
        candidates = subs.map((sub) => sub.name).slice(0, 8)
        if (candidates.length === 0) {
          job.status = 'failed'
          job.error = `仓库 ${job.repo} 的根包未发布到 npm（private: true）且未发现子包；请到"查看"详情确认`
          return
        }
        job.subpackages = candidates
      } else {
        candidates = [pkg.name]
      }
      job.packageName = pkg.name
    }
    job.stage = 'installing'
    const patchPath = findPatchPath(ctx)
    const profileDir = dirname(patchPath)
    const taken = new Set(listEntries(ctx).map((entry) => entry.rowId))
    const patch = await readPatchState(patchPath)
    for (const id of [...patch.inserts, ...patch.disables, ...patch.forced]) taken.add(id)
    let installedName = null
    let lastError = null
    const deadline = Date.now() + 8 * 60 * 1000
    for (const name of candidates) {
      if (Date.now() > deadline) break
      // 通道 1：npmmirror 镜像
      try {
        await pnpmInstall(profileDir, name)
        installedName = name
        break
      } catch (error) {
        lastError = error
        // 通道 2：npmjs 官方源（镜像 404/滞后兜底）
        try {
          await pnpmInstall(profileDir, name, 'https://registry.npmjs.org')
          installedName = name
          break
        } catch {}
        // 通道 3：git 加速代理 + github 直连（仅当装的就是仓库本身时有效）
        if (!subpackageMode) {
          const gitSpecs = [
            `git+https://ghproxy.net/https://github.com/${job.repo}.git`,
            `github:${job.repo}`,
          ]
          for (const spec of gitSpecs) {
            try {
              await pnpmInstall(profileDir, spec)
              installedName = name
              break
            } catch (error) {
              lastError = error
            }
          }
        }
      }
      if (installedName !== null) break
    }
    if (installedName === null) {
      await aiRepair(job, ctx, profileDir, candidates, lastError?.message ?? null)
      return
    }
    job.packageName = installedName
    job.stage = 'configuring'
    if (await detectBundleOnly(profileDir, installedName)) {
      // 官方 dsh plugin add 行为：声明 dsh.bundle 的包追加为 profile bundle 层，
      // 其 cordis.patch.yml 在下次启动时参与组合（含皮肤包与 web-ui-settings 这类有入口的包）
      await addBundleToManifest(profileDir, installedName)
      job.bundle = true
      job.status = 'done'
      return
    }
    const entryId = deriveEntryId(installedName, taken)
    await appendInsert(patchPath, entryId, installedName)
    job.entryId = entryId
    job.status = 'done'
  } catch (error) {
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : String(error)
  } finally {
    job.finishedAt = Date.now()
  }
}

/** 组装当前插件清单（镜像 dsh-host-plugin-inventory 的读取逻辑）。 */
function listEntries(ctx) {  const entries = []
  for (const entry of ctx.loader.entries()) {
    if (entry.options.group) continue
    const moduleName = entry.options.name
    const rowId = rowIdOf(ctx, entry.id)
    const protectedRow = isProtectedModule(moduleName)
    entries.push({
      entryId: entry.id,
      rowId,
      moduleName,
      enabled: !entry.disabled,
      fiberPhase: entry.fiber === undefined ? null : FIBER_PHASE[entry.fiber.state],
      protected: protectedRow,
      toggleable: rowId !== 'plugin-console'
        && !protectedRow
        && typeof moduleName === 'string'
        && !moduleName.startsWith('cordis:'),
    })
  }
  return entries
}

/** 应用插件：注册 /plugin-console 路由。 */
export function apply(ctx) {
  ctx.effect(() => {
    const route = {
      kind: 'prefix',
      path: ROUTE_PREFIX,
      handler: async (req, res) => {
        if (!isLoopback(req.socket?.remoteAddress ?? '')) {
          sendError(res, 403, '仅允许本机访问')
          return
        }
        try {
          await handle(ctx, req, res)
        } catch (error) {
          sendError(res, 500, error instanceof Error ? error.message : String(error))
        }
      },
    }
    return ctx.webServer.register(route)
  }, 'plugin-console: routes')
}

async function handle(ctx, req, res) {
  const url = new URL(req.url ?? '/', 'http://x')
  const pathname = url.pathname
  const method = req.method ?? 'GET'

  if (method === 'GET' && pathname === `${ROUTE_PREFIX}/state`) {
    const patchPath = findPatchPath(ctx)
    const patch = await readPatchState(patchPath)
    const extraRows = await readExtraBundleRows(dirname(patchPath))
    const entries = listEntries(ctx).map((entry) => {
      const meta = entryPkgMeta(entry.moduleName, ctx.baseUrl ?? 'file:///')
      return {
        ...entry,
        userDisabled: patch.disables.includes(entry.rowId),
        userForced: patch.forced.includes(entry.rowId),
        extra: patch.inserts.includes(entry.rowId) || extraRows.has(entry.moduleName) || extraRows.has(entry.rowId),
        installDate: meta?.installDate ?? null,
        version: meta?.version ?? null,
        repository: meta?.repository ?? null,
      }
    })
    const compat = await detectCompat(ctx.baseUrl ?? 'file:///')
    const auth = readGithubAuth()
    const jobs = [...installJobs.values()].filter((job) => job.status === 'installing').map(installJobView)
    const recentFailures = [...installJobs.values()].filter((job) => job.status === 'failed').slice(-3).map(installJobView)
    sendJson(res, 200, { ok: true, entries, patchPath, compat, installJobs: jobs, recentFailures, github: { loggedIn: auth.loggedIn, login: auth.login }, patch: { disables: patch.disables, forced: patch.forced, inserts: patch.inserts } })
    return
  }

  if (method !== 'POST') {
    sendError(res, 405, '不支持的方法')
    return
  }

  const body = await readBody(req)

  if (pathname === `${ROUTE_PREFIX}/details`) {
    const { entryId } = body
    if (typeof entryId !== 'string' || !/^[A-Za-z0-9_:.-]{1,80}$/u.test(entryId)) {
      sendError(res, 400, 'entryId 无效')
      return
    }
    const entry = ctx.loader.entries().find((candidate) => candidate.id === entryId)
    if (!entry) {
      sendError(res, 404, `没有名为 ${entryId} 的插件条目`)
      return
    }
    const moduleName = entry.options.name
    const details = await readPluginDetails(moduleName, ctx.baseUrl ?? 'file:///')
    sendJson(res, 200, { ok: true, entryId, rowId: rowIdOf(ctx, entryId), moduleName, ...details })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/toggle`) {
    const { entryId, enabled } = body
    if (typeof entryId !== 'string' || !/^[A-Za-z0-9_:.-]{1,80}$/u.test(entryId)) {
      sendError(res, 400, 'entryId 无效')
      return
    }
    if (typeof enabled !== 'boolean') {
      sendError(res, 400, 'enabled 必须是布尔值')
      return
    }
    const exists = ctx.loader.entries().some((entry) => entry.id === entryId)
    if (!exists) {
      sendError(res, 404, `没有名为 ${entryId} 的插件条目`)
      return
    }
    const target = ctx.loader.entries().find((entry) => entry.id === entryId)
    if (isProtectedModule(target?.options?.name)) {
      sendError(res, 403, `${target.options.name} 属于宿主基础设施，禁止开关（停用会破坏热加载/传输/存储链）`)
      return
    }
    const rowId = rowIdOf(ctx, entryId)
    if (rowId === 'plugin-console') {
      sendError(res, 400, '不能停用插件控制台自身')
      return
    }
    const patchPath = findPatchPath(ctx)
    const result = enabled
      ? await enableEntry(patchPath, rowId)
      : await disableEntry(patchPath, rowId)
    sendJson(res, 200, { ok: true, entryId, rowId, enabled, changed: result.changed, patchPath })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/search`) {
    const raw = typeof body.q === 'string' ? body.q.trim() : ''
    const query = raw === '' ? DEFAULT_SEARCH : raw
    const page = Math.max(Math.min(Number.parseInt(String(body.page), 10) || 1, 5), 1)
    const auth = readGithubAuth()
    const data = await githubJson(
      `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20&page=${page}`,
      req.signal,
      auth.token,
    )
    const items = (data.items ?? []).map((item) => ({
      fullName: item.full_name,
      description: item.description ?? '',
      htmlUrl: item.html_url,
      stars: item.stargazers_count ?? 0,
      updatedAt: item.updated_at ?? '',
      defaultBranch: item.default_branch ?? 'main',
      topics: item.topics ?? [],
    }))
    sendJson(res, 200, { ok: true, query, items, authenticated: auth.loggedIn })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/repo`) {
    const repo = githubRepoInfo(typeof body.repo === 'string' ? body.repo : '')
    const auth = readGithubAuth()
    const meta = await githubJson(`${GITHUB_API}/repos/${repo}`, req.signal, auth.token)
    const branch = meta.default_branch ?? 'main'
    const pkg = await fetchRepoPackage(repo, branch)
    sendJson(res, 200, {
      ok: true,
      repo,
      defaultBranch: branch,
      description: meta.description ?? '',
      stars: meta.stargazers_count ?? 0,
      packageName: pkg?.name ?? null,
      packageDescription: pkg?.description ?? null,
      hasPackageJson: pkg !== null,
      privateRoot: pkg !== null && pkg.private === true,
      dshHint: pkg !== null && (
        typeof pkg.name === 'string' && /(^|-)dsh[-/]/u.test(pkg.name)
        || pkg.peerDependencies?.['@deepseek-ai/cordis'] !== undefined
        || Array.isArray(pkg.keywords) && pkg.keywords.includes('dsh-plugin')
      ),
    })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/subpackages`) {
    const repo = githubRepoInfo(typeof body.repo === 'string' ? body.repo : '')
    const branch = typeof body.branch === 'string' && body.branch ? body.branch : 'main'
    const auth = readGithubAuth()
    const data = await githubJson(`${GITHUB_API}/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, req.signal, auth.token)
    const paths = (data.tree ?? [])
      .filter((node) => node.type === 'blob' && /^packages\/[^/]+\/package\.json$/u.test(node.path))
      .map((node) => node.path)
    const out = []
    for (const path of paths.slice(0, 24)) {
      const bodyText = await githubText(`${GITHUB_RAW}/${repo}/${encodeURIComponent(branch)}/${path}`, req.signal, auth.token)
      if (bodyText === null) continue
      try {
        const pkg = JSON.parse(bodyText)
        if (pkg && typeof pkg.name === 'string') out.push({ dir: path.split('/')[1], name: pkg.name })
      } catch {}
    }
    sendJson(res, 200, { ok: true, repo, branch, subpackages: out })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/install`) {
    const repo = githubRepoInfo(typeof body.repo === 'string' ? body.repo : '')
    const givenName = typeof body.packageName === 'string' ? body.packageName.trim() : ''
    const npmNamePattern = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u
    if (givenName !== '' && (!npmNamePattern.test(givenName) || givenName.length > 214)) {
      sendError(res, 400, 'packageName 不是合法的 npm 包名')
      return
    }
    const job = {
      id: `job-${installJobSeq += 1}`,
      repo,
      packageName: givenName || null,
      status: 'installing',
      stage: 'preparing',
      error: null,
      startedAt: Date.now(),
      finishedAt: null,
      entryId: null,
      bundle: false,
      ai: false,
      aiNote: null,
      subpackages: null,
      lastError: null,
    }
    installJobs.set(job.id, job)
    // 后台执行：请求立即返回，安装不受客户端断开/离开面板影响
    void runInstallJob(job, ctx)
    sendJson(res, 200, { ok: true, jobId: job.id, status: 'installing' })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/install-status`) {
    const jobId = typeof body.jobId === 'string' ? body.jobId : ''
    const job = installJobs.get(jobId)
    if (!job) {
      sendError(res, 404, '没有这个安装任务')
      return
    }
    sendJson(res, 200, { ok: true, ...installJobView(job) })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/restart`) {
    // 自带守护的自杀式重启：分离脚本杀掉本进程后，若端口无人监听则自动拉起服务。
    // 不再依赖桌面端监督器（它并不总是会重启服务，曾导致用户需要重启电脑）。
    const port = webPort(ctx)
    const binPath = resolveDshBin()
    const nodePath = process.execPath
    if (process.platform === 'win32' && binPath !== null) {
      const ps1 = join(tmpdir(), `dsh-console-restart-${process.pid}.ps1`)
      const lines = [
        `Stop-Process -Id ${process.pid} -Force -ErrorAction SilentlyContinue`,
        'Start-Sleep -Seconds 3',
        '$ok = $false',
        `try { $c = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue; $ok = $c.Count -gt 0 } catch {}`,
        `if (-not $ok) { Start-Process -FilePath ${JSON.stringify(nodePath)} -ArgumentList ${JSON.stringify(binPath)},'web' -WindowStyle Hidden }`,
      ]
      writeFile(ps1, lines.join('\r\n'), 'utf8').then(
        () => execFile('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-File', ps1], { windowsHide: true }, () => {}),
        () => {},
      )
    } else {
      const script = process.platform === 'win32'
        ? `Start-Sleep -Seconds 2; Stop-Process -Id ${process.pid} -Force`
        : `sleep 2; kill -9 ${process.pid}`
      const cmd = process.platform === 'win32' ? 'powershell.exe' : 'sh'
      const args = process.platform === 'win32'
        ? ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', script]
        : ['-c', script]
      execFile(cmd, args, { windowsHide: true }, () => {})
    }
    sendJson(res, 200, { ok: true, message: `正在重启 DSH 服务（自带守护，端口 ${port} 无监听会自动拉起），页面稍后自动恢复` })
    return
  }

  sendError(res, 404, `未知接口 ${pathname}`)
}
