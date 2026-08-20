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
import { readFileSync, writeFileSync, existsSync, statSync, rmSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { dirname, join, basename } from 'node:path'
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
/** Gitee OAuth 端点（第三方应用需在 gitee.com → 数据管理 → 第三方应用 创建）。 */
const GITEE_AUTH_URL = 'https://gitee.com/oauth/authorize'
const GITEE_TOKEN_URL = 'https://gitee.com/oauth/token'
const DEFAULT_SEARCH = 'dsh-plugin'
/** 技能市场收录的 topic（/search skills 分支三 topic 并行合并）。 */
const SKILL_TOPICS = ['agent-skills', 'claude-skills', 'dsh-skill']

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
    // 安装日期：优先 curl 通道写入的 .dsh-installed-at 标记（真实安装时刻）；
    // 否则用 package.json 的 mtime，但 npm tarball 会把文件时间固定为 1985-10-26
    // （可复现构建），此时回退到目录创建时间（birthtime，解压时刻，Windows 上可靠）。
    try {
      const marker = join(dirname(pkgPath), '.dsh-installed-at')
      if (existsSync(marker)) {
        const ts = Number(readFileSync(marker, 'utf8').trim())
        if (Number.isFinite(ts) && ts > 0) {
          const d = new Date(ts)
          meta.installDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        }
      }
      if (meta.installDate === null) {
        const st = statSync(pkgPath)
        const yearOk = (t) => t >= 946684800000 // 2000-01-01：早于它都是打包器固定时间戳等伪日期
        const candidates = [st.mtimeMs, st.birthtimeMs ?? NaN].filter((t) => Number.isFinite(t) && yearOk(t))
        if (candidates.length > 0) {
          const d = new Date(Math.min(...candidates))
          meta.installDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        }
      }
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

/** 简单 https POST 表单（Gitee token 交换用），返回 {status, body}。 */
function postJsonUrl(url, formBody) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(formBody).toString()
    const req = httpsRequest(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': GITHUB_UA,
        accept: 'application/json',
      },
      rejectUnauthorized: false,
      timeout: 20000,
    }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode ?? 0, body: JSON.parse(Buffer.concat(chunks).toString('utf8')) })
        } catch {
          resolve({ status: res.statusCode ?? 0, body: null })
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
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

/** 读取用户额外 bundle 的插入行归属表：行 id / 包名 → 所属 bundle 包名。 */
async function readExtraBundleOwners(profileDir) {
  const owners = new Map()
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
          owners.set(idMatch[1], pkg)
          const nameMatch = (lines[index + 1] ?? '').match(/^ {6}name: ['"]([^'"]+)['"]\s*$/u)
          if (nameMatch) owners.set(nameMatch[1], pkg)
        }
      } catch {}
    }
  } catch {}
  return owners
}

/** 从补丁文件移除某行的 insert 块与 disabled/forced 覆盖块。 */
async function removeInsertRow(patchPath, rowId) {
  return queuedWrite(async () => {
    const { text } = await readPatchState(patchPath)
    const blockRe = new RegExp(`^- insert:\\s*\\r?\\n {4}- id: ${escapeRegExp(rowId)}\\s*\\r?\\n( {6}name: [^\\r\\n]*\\r?\\n)?`, 'mu')
    let next = text.replace(blockRe, '')
    const overrideRe = new RegExp(`^- id: ${escapeRegExp(rowId)}\\s*\\r?\\n {2}disabled: (true|false)\\s*\\r?\\n`, 'mu')
    next = next.replace(overrideRe, '')
    if (next !== text) await writeFile(patchPath, next, 'utf8')
  })
}

/** 从 profile manifest 移除一个 bundle。 */
async function removeBundleFromManifest(profileDir, bundlePkg) {
  return queuedWrite(async () => {
    const manifestPath = join(profileDir, 'package.json')
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    const bundles = manifest.dsh?.profile?.bundles ?? []
    const next = bundles.filter((name) => name !== bundlePkg)
    if (next.length !== bundles.length) {
      manifest.dsh = { ...(manifest.dsh ?? {}), profile: { ...(manifest.dsh?.profile ?? {}), bundles: next } }
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
    }
  })
}

/** 用 corepack pnpm 移除包（与安装同一管理器与凭据抑制环境）。
 * 注意：pnpm remove 不支持 --registry 选项，去掉避免静默失败。 */
async function pnpmRemove(profileDir, packageName) {
  const args = ['pnpm', 'remove', packageName]
  const opts = {
    cwd: profileDir,
    timeout: 120000,
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, COREPACK_NPM_REGISTRY: 'https://registry.npmmirror.com', GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
  }
  if (process.platform === 'win32') {
    const corepackJs = join(dirname(process.execPath), 'node_modules', 'corepack', 'dist', 'corepack.js')
    if (existsSync(corepackJs)) {
      await execFileAsync(process.execPath, [corepackJs, ...args], opts)
      return
    }
    const cmd = `${JSON.stringify('corepack')} ${args.map((arg) => JSON.stringify(arg)).join(' ')}`
    await execFileAsync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', cmd], opts)
    return
  }
  await execFileAsync('corepack', args, opts)
}

/** 清理陈旧包目录与 pnpm _tmp_ 残留（Windows 原子替换 EPERM 的根因），返回清理数量。 */
function cleanupStalePackageDir(profileDir, packageName) {
  const segments = packageName.startsWith('@') ? packageName.split('/') : [packageName]
  const dir = join(profileDir, 'node_modules', ...segments)
  const base = basename(dir)
  const parent = dirname(dir)
  let removed = 0
  try {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true })
      removed += 1
    }
  } catch {}
  try {
    for (const entry of readdirSync(parent)) {
      if (entry.startsWith(`${base}_tmp_`)) {
        try {
          rmSync(join(parent, entry), { recursive: true, force: true })
          removed += 1
        } catch {}
      }
    }
  } catch {}
  return removed
}

/** 软件源配置文件（registry 列表，安装链按主→备依次尝试）。 */
const SOURCES_FILE = join(dshHome(), 'plugin-console-sources.json')
const DEFAULT_SOURCES = {
  registries: [
    { id: 'npmmirror', name: 'npmmirror（国内镜像）', url: 'https://registry.npmmirror.com', primary: true },
    { id: 'npmjs', name: 'npmjs（官方源）', url: 'https://registry.npmjs.org', primary: false },
  ],
  searchSources: [
    { id: 'github', name: 'GitHub', type: 'builtin' },
    { id: 'gitee', name: 'Gitee', type: 'builtin' },
  ],
  gitee: { clientId: '', clientSecret: '', token: '', login: '' },
}

/** 源地址校验（模块顶层，readSources 与 sources 路由共用）：https 任意；http 仅限私网/本机地址（内网 npm registry、内网搜索服务常用 http）。 */
function isAllowedSourceUrl(url) {
  if (/^https:\/\/\S+$/u.test(url)) return true
  if (!/^http:\/\/\S+$/u.test(url)) return false
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host === 'localhost' || host === '::1' || host === '[::1]') return true
    if (/^127\.\d+\.\d+\.\d+$/u.test(host)) return true
    if (/^10\.\d+\.\d+\.\d+$/u.test(host)) return true
    if (/^192\.168\.\d+\.\d+$/u.test(host)) return true
    if (/^169\.254\.\d+\.\d+$/u.test(host)) return true
    const m = host.match(/^172\.(\d+)\.\d+\.\d+$/u)
    if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true
    if (/^[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){2,7}$/iu.test(host)) return true
    return false
  } catch {
    return false
  }
}

/** 读取 Gitee OAuth 配置（clientId/clientSecret/token/login）。 */
function readGiteeConfig(data) {
  const gitee = data && typeof data === 'object' && data.gitee && typeof data.gitee === 'object' ? data.gitee : {}
  return {
    clientId: typeof gitee.clientId === 'string' ? gitee.clientId : '',
    clientSecret: typeof gitee.clientSecret === 'string' ? gitee.clientSecret : '',
    token: typeof gitee.token === 'string' ? gitee.token : '',
    login: typeof gitee.login === 'string' ? gitee.login : '',
  }
}

/** 读取软件源配置（损坏/缺失时回退默认）。 */
function readSources() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_SOURCES))
  try {
    const data = JSON.parse(readFileSync(SOURCES_FILE, 'utf8'))
    const registries = (Array.isArray(data.registries) ? data.registries : [])
      .filter((r) => r && typeof r.url === 'string' && isAllowedSourceUrl(r.url))
      .map((r) => ({
        id: String(r.id ?? '').slice(0, 40) || `src-${Math.random().toString(36).slice(2, 8)}`,
        name: String(r.name ?? r.url).slice(0, 60) || r.url,
        url: r.url,
        primary: r.primary === true,
      }))
    const searchSources = (Array.isArray(data.searchSources) ? data.searchSources : [])
      .map((s) => {
        if (s && (s.id === 'github' || s.id === 'gitee')) {
          return { id: String(s.id), name: String(s.name ?? s.id), type: 'builtin' }
        }
        if (s && typeof s.url === 'string' && s.url.includes('{q}')) {
          const headers = {}
          if (Array.isArray(s.headers)) {
            for (const h of s.headers) {
              if (h && typeof h.name === 'string' && h.name !== '' && typeof h.value === 'string') {
                headers[h.name] = h.value
              }
            }
          }
          return {
            id: String(s.id ?? `search-${Math.random().toString(36).slice(2, 8)}`).slice(0, 40),
            name: String(s.name ?? s.url).slice(0, 60),
            type: 'custom',
            url: s.url,
            headers,
          }
        }
        return null
      })
      .filter((s) => s !== null)
    if (registries.length > 0) {
      if (!registries.some((r) => r.primary)) registries[0].primary = true
      return { registries, searchSources, gitee: readGiteeConfig(data) }
    }
  } catch {}
  return defaults
}

async function writeSources(sources) {
  await writeFile(SOURCES_FILE, JSON.stringify(sources, null, 2) + '\n', 'utf8')
}

/** 按主→备顺序返回 registry URL 列表。 */
function orderedRegistries(sources) {
  const list = [...sources.registries]
  return [...list.filter((r) => r.primary), ...list.filter((r) => !r.primary)].map((r) => r.url)
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

const FRAMEWORK_STATE_FILE = () => join(dshHome(), 'plugin-console', 'framework-state.json')
const FRAMEWORK_BACKUP_ROOT = () => join(dshHome(), 'plugin-console', 'framework-backups')

/** 定位 @deepseek-ai/dsh-app-boot（与 @deepseek-ai/dsh 同级）。 */
function locateAppBootFile(baseUrl) {
  try {
    const require = createRequire(baseUrl)
    const dshPkg = require.resolve('@deepseek-ai/dsh/package.json')
    const candidate = join(dirname(dshPkg), 'dsh-app-boot', 'lib', 'index.js')
    if (existsSync(candidate)) return candidate
  } catch {}
  const cacheRoots = [
    process.env.NODE_CACHE || '',
    'D:\\node_cache\\_npx',
    join(homedir(), '.npm', '_npx'),
    join(process.env.LOCALAPPDATA || '', 'node_cache', '_npx'),
  ].filter(Boolean)
  for (const root of cacheRoots) {
    if (!existsSync(root)) continue
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const candidate = join(root, entry.name, 'node_modules', '@deepseek-ai', 'dsh-app-boot', 'lib', 'index.js')
      if (existsSync(candidate)) return candidate
    }
  }
  return null
}

/** 内联框架补丁（dsh-app-boot parsePatchList 容错，issue #5）——DSH 升级后框架文件被覆盖，需重打。 */
function applyFrameworkTolerancePatchOnce(baseUrl) {
  const target = locateAppBootFile(baseUrl)
  if (!target) return { applied: false, reason: 'dsh-app-boot 未找到' }
  let source = ''
  try { source = readFileSync(target, 'utf8') } catch (error) { return { applied: false, reason: `读取失败：${error.message}` } }
  if (source.includes('tryDropEmptyArrayPlaceholder')) return { applied: false, reason: '已打过补丁' }
  if (!source.includes('function parsePatchList')) return { applied: false, reason: 'parsePatchList 不存在（框架版本可能已变更）' }
  const OLD = 'function parsePatchList(binName, file, content, label) {\n\tlet parsed;\n\ttry {\n\t\tparsed = yaml.load(content, { schema: userPatchesSchema });\n\t} catch (error) {\n\t\tthrow new Error(`${binName}: failed to parse ${label} ${file}: ${String(error)}`);\n\t}'
  const NEW = 'function parsePatchList(binName, file, content, label) {\n\tlet parsed;\n\ttry {\n\t\tparsed = yaml.load(content, { schema: userPatchesSchema });\n\t} catch (error) {\n\t\tconst retried = tryDropEmptyArrayPlaceholder(content);\n\t\tif (retried !== null) {\n\t\t\ttry {\n\t\t\t\tparsed = yaml.load(retried, { schema: userPatchesSchema });\n\t\t\t} catch {\n\t\t\t\tthrow new Error(`${binName}: failed to parse ${label} ${file}: ${String(error)}`);\n\t\t\t}\n\t\t} else {\n\t\t\tthrow new Error(`${binName}: failed to parse ${label} ${file}: ${String(error)}`);\n\t\t}\n\t}'
  const HELPER = '\n/**\n * 容错辅助（issue #5）：若文件含顶格空数组占位行（`[]` / `[ ]`，可带行尾注释），视为 no-op 移除。\n */\nfunction tryDropEmptyArrayPlaceholder(content) {\n\tconst lines = String(content).split("\\n");\n\tconst kept = [];\n\tlet dropped = false;\n\tfor (const line of lines) {\n\t\tif (/^\\[\\s*\\]\\s*(?:#.*)?$/u.test(line)) {\n\t\t\tdropped = true;\n\t\t\tcontinue;\n\t\t}\n\t\tkept.push(line);\n\t}\n\tif (!dropped) return null;\n\treturn kept.join("\\n");\n}\n'
  try {
    copyFileSync(target, `${target}.bak-issue5`)
    const next = source.replace(OLD, NEW) + HELPER
    writeFileSync(target, next, 'utf8')
    return { applied: true, target }
  } catch (error) {
    return { applied: false, reason: `应用失败：${error.message}` }
  }
}

/** 备份当前 profile 配置快照（按版本目录；框架升级后旧版本目录即升级前配置）。 */
function backupProfileSnapshot(profileDir, version, ctx) {
  const dir = join(FRAMEWORK_BACKUP_ROOT(), version)
  mkdirSync(dir, { recursive: true })
  try { copyFileSync(join(profileDir, 'cordis.patch.yml'), join(dir, 'cordis.patch.yml')) } catch {}
  try { copyFileSync(join(profileDir, 'package.json'), join(dir, 'profile-package.json')) } catch {}
  try {
    const plugins = listEntries(ctx).map((e) => {
      const meta = entryPkgMeta(e.moduleName, ctx.baseUrl ?? 'file:///')
      return { rowId: e.rowId, moduleName: e.moduleName, enabled: e.enabled, version: meta?.version ?? null, installDate: meta?.installDate ?? null }
    })
    writeFileSync(join(dir, 'plugins.json'), JSON.stringify(plugins, null, 2), 'utf8')
  } catch {}
  return dir
}

/** 框架升级检测与适配：记录版本 → 每次启动备份配置快照 → 升级/首次时重打框架补丁。 */
function detectFrameworkUpgrade(ctx) {
  let current = null
  try {
    const require = createRequire(ctx.baseUrl ?? 'file:///')
    const dshPkg = JSON.parse(readFileSync(require.resolve('@deepseek-ai/dsh/package.json'), 'utf8'))
    current = dshPkg.version ?? null
  } catch {}
  const statePath = FRAMEWORK_STATE_FILE()
  let prev = null
  try { prev = JSON.parse(readFileSync(statePath, 'utf8')) } catch {}
  const upgraded = prev !== null && prev.lastVersion !== null && current !== null && prev.lastVersion !== current
  const result = { version: current, upgraded, from: prev?.lastVersion ?? null, backupDir: null, patchApplied: false, patchNote: null }
  try {
    mkdirSync(dirname(statePath), { recursive: true })
    const profileDir = dirname(findPatchPath(ctx))
    if (current !== null) result.backupDir = backupProfileSnapshot(profileDir, current, ctx)
    const patch = applyFrameworkTolerancePatchOnce(ctx.baseUrl ?? 'file:///')
    result.patchApplied = patch.applied
    result.patchNote = patch.reason ?? null
    writeFileSync(statePath, JSON.stringify({ lastVersion: current, backupAt: Date.now() }), 'utf8')
  } catch {}
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
function githubRequestOnce(url, { signal, accept, token, timeout = 20000 } = {}) {
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
    req.setTimeout(timeout, () => req.destroy(new Error('GitHub 请求超时')))
    if (signal !== undefined) {
      if (signal.aborted) {
        req.destroy(new Error('请求已取消'))
        return
      }
      signal.addEventListener('abort', () => req.destroy(new Error('请求已取消')), { once: true })
    }
  })
}

/** api.github.com 的镜像竞速前缀（主通道黑洞期可用的兜底）。 */
const API_MIRROR_PREFIXES = [
  'https://ghproxy.net/https://api.github.com',
  'https://ghfast.top/https://api.github.com',
]

/** raw.githubusercontent.com 的镜像竞速前缀（与浏览器端四通道一致）。 */
const RAW_MIRROR_PREFIXES = [
  'https://ghproxy.net/https://raw.githubusercontent.com',
  'https://ghfast.top/https://raw.githubusercontent.com',
  'https://mirror.ghproxy.com/https://raw.githubusercontent.com',
]

/** 并行竞速：任一分支拿到 2xx 即胜出；非 2xx 与错误都视为失败，全部失败则拒绝。 */
function raceFirst2xx(promises) {
  return new Promise((resolve, reject) => {
    let pending = promises.length
    let done = false
    for (const promise of promises) {
      promise.then(
        (res) => {
          if (done) return
          const ok = res.statusCode === undefined || (res.statusCode >= 200 && res.statusCode < 300)
          if (ok) {
            done = true
            resolve(res)
            return
          }
          if (--pending === 0) reject(new Error(`HTTP ${res.statusCode}`))
        },
        () => {
          if (done) return
          if (--pending === 0) reject(new Error('GitHub 请求失败'))
        },
      )
    }
  })
}

/**
 * GitHub 公开元数据请求。用 node:https 而非全局 fetch，并跳过证书校验：
 * 国内网络环境的中间设备会注入不可信证书，全局 fetch 因此直接失败；
 * 本插件只经此通道拉取公开的仓库/包元数据，npm 安装本身仍走 registry 的
 * 完整 TLS 校验，所以这里放宽校验不会让安装环节失去 TLS 保护。
 *
 * 原逻辑保持不动：官方通道两次尝试（每次 20 秒，间隔 1.5 秒）。
 * 在此基础上新增并行分支：镜像（api/raw 各自前缀）同时竞速，15 秒封顶，
 * 任一分支先拿到 2xx 即胜出；全部失败时回退官方通道的最终错误。
 */
async function githubRequest(url, options) {
  const isApi = url.startsWith(GITHUB_API)
  const isRaw = url.startsWith(GITHUB_RAW)
  // ── 原逻辑：官方通道两次尝试 ──
  const official = (async () => {
    let lastError
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1500))
      try {
        return await githubRequestOnce(url, options)
      } catch (error) {
        lastError = error
      }
    }
    throw lastError ?? new Error('GitHub 请求失败')
  })()
  // ── 新增并行分支：镜像竞速（15 秒封顶；非 2xx 视为失败）──
  const prefixes = isApi ? API_MIRROR_PREFIXES : isRaw ? RAW_MIRROR_PREFIXES : []
  const mirrors = prefixes.map((prefix) => (async () => {
    const res = await githubRequestOnce(`${prefix}${url.slice(isApi ? GITHUB_API.length : GITHUB_RAW.length)}`, { ...options, timeout: 15000 })
    if (res.statusCode !== undefined && (res.statusCode < 200 || res.statusCode >= 300)) throw new Error(`HTTP ${res.statusCode}`)
    return res
  })())
  try {
    return await raceFirst2xx([official, ...mirrors])
  } catch {
    // 全灭：回退官方通道的最终错误（保留原始报错语义）
    try {
      return await official
    } catch (error) {
      throw error
    }
  }
}

function collectBody(res) {
  return new Promise((resolve, reject) => {
    const chunks = []
    res.on('data', (chunk) => chunks.push(chunk))
    res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    res.on('error', reject)
  })
}

/** gh CLI 通道：api.github.com 黑洞期（node:https 全部超时）时的最后兜底。
 * 服务进程 PATH 可能不含 gh（桌面壳环境）：依次尝试 gh、常见安装路径。 */
const GH_BIN_CANDIDATES = [
  'gh',
  'C:\\Program Files\\GitHub CLI\\gh.exe',
  join(homedir(), 'AppData', 'Local', 'Microsoft', 'WinGet', 'Links', 'gh.exe'),
  join(homedir(), 'scoop', 'shims', 'gh.exe'),
]

function githubViaGh(apiPath) {
  return new Promise((resolve, reject) => {
    const attempt = (index) => {
      if (index >= GH_BIN_CANDIDATES.length) {
        reject(new Error('gh api 兜底失败：未找到 gh CLI'))
        return
      }
      execFile(GH_BIN_CANDIDATES[index], ['api', apiPath, '--jq', '.'], { windowsHide: true, timeout: 45000, maxBuffer: 8 * 1024 * 1024 }, (error, stdout) => {
        if (error) {
          // ENOENT = 该路径不存在，继续下一个候选；其他错误（网络/认证）直接失败
          if (error.code === 'ENOENT') {
            attempt(index + 1)
            return
          }
          reject(new Error(`gh api 兜底失败：${error.message}`))
          return
        }
        try {
          resolve(JSON.parse(stdout))
        } catch {
          reject(new Error('gh api 兜底返回的不是合法 JSON'))
        }
      })
    }
    attempt(0)
  })
}

async function githubJson(url, signal, token = null) {
  const apiPath = url.startsWith(GITHUB_API) ? url.slice(GITHUB_API.length) : null
  // https 主通道（官方重试+镜像并行）与 gh CLI **并行竞速**：黑洞期 gh 秒回，不再等 https 超时
  if (apiPath !== null) {
    const https = (async () => {
      const res = await githubRequest(url, { signal, token })
      const status = res.statusCode ?? 0
      if (status === 403 && Number(res.headers['x-ratelimit-remaining'] ?? '1') === 0) {
        throw new Error('GitHub 接口限流已用尽，请稍后再试')
      }
      const body = await collectBody(res)
      if (status < 200 || status >= 300) throw new Error(`GitHub 请求失败 (HTTP ${status})`)
      return JSON.parse(body)
    })()
    try {
      return await raceFirst2xx([https, githubViaGh(apiPath)])
    } catch (error) {
      try { return await https } catch (httpsError) { throw httpsError }
    }
  }
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

/** 用 curl 子进程请求 JSON（绕过本机中间设备对 node:https TLS 指纹的拦截；curl 走系统网络栈）。 */
async function curlJson(url, timeout = 15000, headers = {}) {
  const bin = process.platform === 'win32' ? 'curl.exe' : 'curl'
  const args = ['-s', '-m', String(Math.max(5, Math.ceil(timeout / 1000))), '--insecure', '-H', 'accept: application/json', '-w', '\n__HTTP__%{http_code}']
  for (const [key, value] of Object.entries(headers)) args.push('-H', `${key}: ${value}`)
  args.push(url)
  const { stdout } = await execFileAsync(bin, args, { timeout: timeout + 3000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 })
  const m = String(stdout).match(/\n__HTTP__(\d+)\s*$/u)
  const code = m ? Number(m[1]) : 0
  const body = m ? String(stdout).slice(0, m.index) : String(stdout)
  if (code !== 0 && (code < 200 || code >= 300)) throw new Error(`请求失败 (HTTP ${code})`)
  return JSON.parse(body)
}

/** 用 curl 拉取文本（raw 文件用：本机 curl 直连 raw.githubusercontent.com 秒回，绕开 node:https 黑洞）。 */
async function curlText(url, timeout = 10000) {
  const bin = process.platform === 'win32' ? 'curl.exe' : 'curl'
  const { stdout } = await execFileAsync(
    bin,
    ['-s', '-m', String(Math.max(3, Math.ceil(timeout / 1000))), '--insecure', '-H', 'accept: text/plain', '-w', '\n__HTTP__%{http_code}', url],
    { timeout: timeout + 3000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 },
  )
  const m = String(stdout).match(/\n__HTTP__(\d+)\s*$/u)
  const code = m ? Number(m[1]) : 0
  const body = m ? String(stdout).slice(0, m.index) : String(stdout)
  if (code !== 0 && (code < 200 || code >= 300)) throw new Error(`HTTP ${code}`)
  return body
}

/** 任意 https JSON 接口（Gitee/自定义源用）：curl 优先、node:https 兜底；4xx/5xx 确定性失败直接抛出。 */
async function fetchJsonUrl(url, timeout = 15000, headers = {}) {
  let lastError
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1000))
    try {
      return await curlJson(url, timeout, headers)
    } catch (error) {
      // HTTP 状态错误（4xx/5xx）是确定性失败：直接抛出，不重试、不走 node 兜底
      if (error instanceof Error && /^请求失败 \(HTTP \d+\)$/u.test(error.message)) throw error
      lastError = error
    }
    try {
      const res = await githubRequest(url, { headers })
      const status = res.statusCode ?? 0
      const body = await collectBody(res)
      if (status < 200 || status >= 300) throw new Error(`请求失败 (HTTP ${status})`)
      return JSON.parse(body)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError ?? new Error('请求失败')
}

/** 平台搜索返回归一化（数组或 {items} 均可；兼容 GitHub/Gitee/自定义源字段）。 */
function normalizePlatformItems(data, fallbackBranch = 'main') {
  const list = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : [])
  return list
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      fullName: String(item.full_name ?? item.path_with_namespace ?? item.name ?? '').trim(),
      description: item.description ?? '',
      htmlUrl: item.html_url ?? item.web_url ?? '',
      stars: item.stargazers_count ?? item.star_count ?? 0,
      updatedAt: item.updated_at ?? item.last_activity_at ?? '',
      defaultBranch: item.default_branch ?? fallbackBranch,
      topics: Array.isArray(item.topics) ? item.topics : [],
    }))
    .filter((item) => item.fullName !== '')
}

/** 探测仓库是否为技能仓库：根目录或第一层子目录存在 SKILL.md。
 * 返回 { hasSkill, skillDir }（skillDir 为相对仓库根的目录，'' 表示根）。
 * raw 双通道竞速，3 秒封顶，失败静默。 */
async function detectSkillRepo(repo, branch = 'main') {
  const branchEnc = encodeURIComponent(branch)
  try {
    const root = await Promise.any([
      curlText(`${GITHUB_RAW}/${repo}/${branchEnc}/SKILL.md`, 3000),
      curlText(`https://ghproxy.net/${GITHUB_RAW}/${repo}/${branchEnc}/SKILL.md`, 3000),
      curlText(`https://cdn.jsdelivr.net/gh/${repo}@${branchEnc}/SKILL.md`, 3000),
    ]).catch(() => null)
    if (root !== null) return { hasSkill: true, skillDir: '' }
    // 根没有时再查一层子目录（常用布局：skills/<name>/SKILL.md、<name>/SKILL.md）
    const tree = await curlJson(`https://api.github.com/repos/${repo}/git/trees/${branchEnc}?recursive=1`, 5000).catch(() => null)
    const skillPaths = (tree?.tree ?? [])
      .filter((n) => n.type === 'blob' && /(?:^|\/)SKILL\.md$/u.test(n.path))
      .map((n) => n.path)
    if (skillPaths.length > 0) {
      const dir = skillPaths[0].slice(0, -'SKILL.md'.length).replace(/\/$/u, '')
      return { hasSkill: true, skillDir: dir }
    }
  } catch {}
  return { hasSkill: false, skillDir: null }
}

/** 提取 SKILL.md frontmatter 摘要（name / description / whenToUse，与客户端 summarizeSkillFrontmatter 同规则）。 */
function summarizeSkillFrontmatter(text) {
  if (!text.startsWith('---')) return null
  const fmEnd = text.indexOf('\n---', 3)
  if (fmEnd === -1) return null
  const fm = text.slice(3, fmEnd)
  const pick = (key) => {
    const re = new RegExp(`^${key}:\\s*(.*)$`, 'mu')
    const m = fm.match(re)
    if (!m) return ''
    const first = m[1].trim()
    if (first.startsWith('|')) {
      const rest = fm.slice(m.index + m[0].length)
      const lines = []
      for (const line of rest.split('\n')) {
        if (/^[a-zA-Z][\w-]*\s*:/u.test(line)) break
        const v = line.trim()
        if (v) lines.push(v)
        if (lines.join(' ').length > 240) break
      }
      return lines.join(' ').slice(0, 500)
    }
    return first.slice(0, 200)
  }
  const name = pick('name')
  const description = pick('description')
  const whenToUse = pick('whenToUse')
  if (!name && !description && !whenToUse) return null
  return { name, description, whenToUse }
}

/** 读取仓库 SKILL.md 的 frontmatter 摘要（raw 双通道，失败静默返回 null）。 */
async function fetchSkillMeta(repo, branch, skillDir) {
  try {
    const path = skillDir ? `${skillDir}/SKILL.md` : 'SKILL.md'
    const body = await rawTextWithFallback(repo, branch, path)
    if (body === null) return null
    return summarizeSkillFrontmatter(body)
  } catch {
    return null
  }
}

/** 批量识别搜索结果类型（官方 bundle / 聚合仓库 / 普通项目 / 技能仓库）。
 * 全部条目并发 + raw 主站与镜像双通道竞速，单条 4 秒封顶。
 * 聚合仓库（根包 private+workspaces）额外检查子包是否有 dsh.bundle 清单：
 * 任一子包可 `dsh plugin add` 直装 → aggregateInstallable = true（★ 筛选会包含它）。 */
async function enrichItems(items) {
  return Promise.all(items.map(async (item) => {
    let official = null
    let aggregate = false
    let aggregateInstallable = false
    let hasSkill = false
    let hasSuite = false
    try {
      const branch = item.defaultBranch ?? 'main'
      const base = `https://raw.githubusercontent.com/${item.fullName}/${encodeURIComponent(branch)}/package.json`
      const [pkgResult, skillResult, suiteResult] = await Promise.allSettled([
        Promise.any([
          curlText(base, 4000),
          curlText(`https://ghproxy.net/${base}`, 4000),
        ]),
        detectSkillRepo(item.fullName, branch),
        rawTextWithFallback(item.fullName, branch, '.gitmodules'),
      ])
      if (suiteResult.status === 'fulfilled' && suiteResult.value !== null) {
        hasSuite = true
      }
      if (pkgResult.status === 'fulfilled') {
        const pkg = JSON.parse(pkgResult.value)
        if (typeof pkg.dsh?.bundle?.patch === 'string') {
          official = true
        } else if (pkg.private === true && (Array.isArray(pkg.workspaces) || /(^|-)dsh[-/]/u.test(String(pkg.name ?? '')))) {
          aggregate = true
          try {
            const tree = await curlJson(`https://api.github.com/repos/${item.fullName}/git/trees/${encodeURIComponent(branch)}?recursive=1`, 6000)
            const pkgPaths = (tree.tree ?? [])
              .filter((n) => n.type === 'blob' && /^packages\/[^/]+\/package\.json$/u.test(n.path))
              .map((n) => n.path)
              .slice(0, 12)
            if (pkgPaths.length > 0) {
              const subs = await Promise.all(pkgPaths.map((p) => curlText(`https://raw.githubusercontent.com/${item.fullName}/${encodeURIComponent(branch)}/${p}`, 4000)
                .then((t) => { try { return JSON.parse(t) } catch { return null } })
                .catch(() => null)))
              if (subs.some((sp) => sp && typeof sp.dsh?.bundle?.patch === 'string')) {
                aggregateInstallable = true
              }
            }
          } catch {}
        }
      }
      if (skillResult.status === 'fulfilled' && skillResult.value?.hasSkill === true) {
        hasSkill = true
      }
    } catch {}
    return { ...item, official, aggregate, aggregateInstallable, hasSkill, hasSuite }
  }))
}

function githubRepoInfo(repo) {
  const match = String(repo).trim().match(/^(?:https:\/\/github\.com\/|https:\/\/gitee\.com\/|git@github\.com:|git@gitee\.com:)?([^\s\/?#]+)\/([^\s\/?#]+?)(?:\.git)?$/u)
  if (!match) throw new Error('仓库名格式应为 owner/name（支持完整仓库 URL 与中文路径）')
  return `${match[1]}/${match[2]}`
}

/** raw 文件读取：https 主通道（含镜像）、gh CLI、curl 直连、curl jsDelivr CDN **四通道并行竞速**。
 * 黑洞期 https/ghproxy 全挂、gh 可能不在服务进程 PATH——jsDelivr CDN 走系统网络且国内可达，是最后兜底。 */
async function rawTextWithFallback(repo, branch, path) {
  const url = `${GITHUB_RAW}/${repo}/${encodeURIComponent(branch)}/${path}`
  const https = githubText(url)
    .then((body) => {
      if (body === null) throw new Error('HTTP 非 2xx')
      return body
    })
  const gh = githubViaGh(`repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`)
    .then((data) => {
      if (data && typeof data.content === 'string') return Buffer.from(data.content, 'base64').toString('utf8')
      throw new Error('contents 无内容')
    })
  const curl = curlText(url, 10000)
    .then((body) => {
      if (body === null) throw new Error('HTTP 非 2xx')
      return body
    })
  const cdn = curlText(`https://cdn.jsdelivr.net/gh/${repo}@${encodeURIComponent(branch)}/${path}`, 10000)
    .then((body) => {
      if (body === null) throw new Error('HTTP 非 2xx')
      return body
    })
  try {
    return await Promise.any([https, gh, curl, cdn])
  } catch {
    return null
  }
}

async function fetchRepoPackage(repo, branch) {
  try {
    const body = await rawTextWithFallback(repo, branch, 'package.json')
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
    env: {
      ...process.env,
      COREPACK_NPM_REGISTRY: registry,
      // git 通道禁止交互式凭据：避免 Git Credential Manager 弹登录窗（匿名失败即静默失败）
      GIT_TERMINAL_PROMPT: '0',
      GCM_INTERACTIVE: 'never',
    },
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
 * curl 手动安装通道：node 网络黑洞（pnpm 下载卡死：socket hang up / TIMEOUT / downloaded 0）时，
 * curl 与系统 tar 仍可用——用 curl 下载 registry tarball、解压到 profile 的 node_modules。
 * 零依赖包可完整安装；带依赖包记录未补齐列表（不阻塞，供面板提示）。
 * 返回 { version, missingDeps }；失败抛错由调用方落入 next 通道。
 */
async function curlManualInstall(profileDir, packageName, registries) {
  let meta = null
  let metaError = null
  for (const reg of registries) {
    try {
      const encoded = packageName.startsWith('@')
        ? `@${encodeURIComponent(packageName.slice(1).split('/')[0])}%2f${encodeURIComponent(packageName.split('/').slice(1).join('/'))}`
        : encodeURIComponent(packageName)
      meta = await fetchJsonUrl(`${reg}/${encoded}`)
      if (meta) break
    } catch (error) {
      metaError = error
    }
  }
  if (!meta || typeof meta !== 'object') throw new Error(`curl 通道：无法获取 registry 元数据（${metaError?.message ?? '未知'}）`)
  const version = meta['dist-tags']?.latest ?? null
  const tarball = version ? meta.versions?.[version]?.dist?.tarball ?? null : null
  if (!version || !tarball) throw new Error('curl 通道：registry 无 dist-tags.latest / tarball')
  const bin = process.platform === 'win32' ? 'curl.exe' : 'curl'
  const tmp = join(tmpdir(), `pc-curl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`)
  mkdirSync(tmp, { recursive: true })
  try {
    const tgz = join(tmp, 'pkg.tgz')
    await execFileAsync(bin, ['-s', '-L', '-m', '60', '-o', tgz, tarball], { timeout: 70000, windowsHide: true })
    await execFileAsync('tar', ['-xzf', tgz, '-C', tmp], { timeout: 30000, windowsHide: true })
    const pkgPath = join(tmp, 'package')
    const pkg = JSON.parse(readFileSync(join(pkgPath, 'package.json'), 'utf8'))
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.peerDependencies ?? {}) }
    const missingDeps = Object.keys(deps).filter((d) => !existsSync(join(profileDir, 'node_modules', d)))
    const target = join(profileDir, 'node_modules', packageName)
    if (existsSync(target)) rmSync(target, { recursive: true, force: true })
    mkdirSync(dirname(target), { recursive: true })
    copyTree(pkgPath, target)
    // 落真实安装时间标记：npm tarball 内文件 mtime 是固定时间戳（1985-10-26，可复现构建），
    // 解压后 package.json 的 mtime 不可靠，面板安装日期优先读此标记
    try {
      writeFileSync(join(target, '.dsh-installed-at'), String(Date.now()), 'utf8')
    } catch {}
    return { version, missingDeps }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

/**
 * 后台安装任务注册表：请求立即返回，安装继续在服务端执行；
 * 面板通过 /install-status 轮询进度（stage + status），离开面板不中断。
 */
const installJobs = new Map()
let installJobSeq = 0
/** 静态插件索引内存缓存（/market-index 用）。 */
let marketIndexCache = null

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
    source: job.source ?? 'github',
    curlNote: job.curlNote ?? null,
    kind: job.kind ?? 'plugin',
    skillName: job.skillName ?? null,
    skillDir: job.skillDir ?? null,
    skillNote: job.skillNote ?? null,
    suiteReport: job.suiteReport ?? null,
    suiteNote: job.suiteNote ?? null,
  }
}

/**
 * 递归复制目录树（绕开 fs.cpSync 在本环境的目录复制 EIO bug：
 * cpSync 复制含子目录的树必报 `EIO, Access is denied`，而逐文件 copyFileSync 正常）。
 * 跳过 .git（技能/包副本不需要版本库元数据）。
 */
function copyTree(src, dest) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.git') continue
    const from = join(src, entry.name)
    const to = join(dest, entry.name)
    if (entry.isDirectory()) {
      copyTree(from, to)
    } else if (entry.isFile()) {
      copyFileSync(from, to)
    }
  }
}

/** 解析 .gitmodules：返回 [{name, path, url}]（submodule 套装识别用）。 */
function readGitmodules(dir) {
  const file = join(dir, '.gitmodules')
  if (!existsSync(file)) return []
  const text = readFileSync(file, 'utf8')
  const subs = []
  let cur = null
  for (const line of text.split(/\r?\n/u)) {
    const m = line.match(/^\[submodule\s+"([^"]+)"\]/u)
    if (m) {
      cur = { name: m[1], path: '', url: '' }
      subs.push(cur)
      continue
    }
    if (!cur) continue
    const pm = line.match(/^\s*path\s*=\s*(.+)$/u)
    if (pm) { cur.path = pm[1].trim(); continue }
    const um = line.match(/^\s*url\s*=\s*(.+)$/u)
    if (um) cur.url = um[1].trim()
  }
  return subs.filter((s) => s.path !== '' && s.url !== '')
}

/** 递归找含 preset.yml + agent.cordis.yml 的 agent 预设目录（深度 ≤ maxDepth）。 */
function findPresetDirs(root, maxDepth = 2) {
  const out = []
  const walk = (dir, depth) => {
    if (depth > maxDepth) return
    let entries = []
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    if (existsSync(join(dir, 'preset.yml')) && existsSync(join(dir, 'agent.cordis.yml'))) {
      out.push(dir)
      return
    }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith('.')) continue
      walk(join(dir, e.name), depth + 1)
    }
  }
  walk(root, 0)
  return out
}

/** 包是否有构建产物（main/module/exports/bin 或 lib/index.js 任一存在）。
 * 排除类型声明（.d.ts）与 package.json 自身——exports 的 "./package.json" 是合法导出但不是运行时入口。 */
function packageEntryExists(dir, pkg) {
  const isEntry = (p) => typeof p === 'string' && p !== '' && !p.endsWith('.d.ts') && p !== './package.json' && p !== 'package.json'
  const candidates = []
  if (isEntry(pkg.main)) candidates.push(pkg.main)
  if (isEntry(pkg.module)) candidates.push(pkg.module)
  if (isEntry(pkg.bin)) candidates.push(pkg.bin)
  if (pkg.bin && typeof pkg.bin === 'object') Object.values(pkg.bin).forEach((v) => { if (isEntry(v)) candidates.push(v) })
  if (pkg.exports && typeof pkg.exports === 'object') {
    const collect = (v) => {
      if (typeof v === 'string') { if (isEntry(v)) candidates.push(v) }
      else if (v && typeof v === 'object') Object.values(v).forEach(collect)
    }
    collect(pkg.exports)
  }
  candidates.push('lib/index.js', 'dist/index.js')
  return candidates.some((c) => existsSync(join(dir, c)))
}

/** git clone（镜像→直连；gitee 直连），返回或抛错。 */
async function gitCloneRepo(repo, dest, source = 'github', timeout = 180000) {
  const urls = source === 'gitee'
    ? [`https://gitee.com/${repo}.git`]
    : [`https://ghproxy.net/https://github.com/${repo}.git`, `https://github.com/${repo}.git`]
  let lastError = null
  for (const url of urls) {
    try {
      await execFileAsync('git', ['clone', '--depth', '1', '--quiet', url, dest], {
        timeout,
        windowsHide: true,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      })
      return
    } catch (error) {
      lastError = error
    }
  }
  throw new Error(`git clone 失败：${lastError?.message ?? '未知'}`)
}

/** 从 GitHub Release 下载预构建 tgz 装配到 node_modules/<pkgName>（gh CLI 通道，含绝对路径候选）。 */
async function installBundleFromRelease(subRepo, pkgName, target) {
  const dlDir = join(tmpdir(), `dsh-rel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`)
  mkdirSync(dlDir, { recursive: true })
  try {
    const args = ['release', 'download', '-R', subRepo, '-p', '*.tgz', '-D', dlDir]
    let downloaded = false
    let lastError = null
    for (const bin of GH_BIN_CANDIDATES) {
      try {
        await execFileAsync(bin, args, { timeout: 180000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 })
        downloaded = true
        break
      } catch (error) {
        lastError = error
        if (error.code !== 'ENOENT') break
      }
    }
    if (!downloaded) throw new Error(lastError?.message ?? 'gh release download 失败')
    const tgz = readdirSync(dlDir).find((f) => f.endsWith('.tgz'))
    if (!tgz) throw new Error('Release 无 tgz 资产')
    const extractDir = join(dlDir, 'x')
    mkdirSync(extractDir, { recursive: true })
    await execFileAsync('tar', ['-xzf', join(dlDir, tgz), '-C', extractDir], { timeout: 60000, windowsHide: true })
    const pkgDir = join(extractDir, 'package')
    if (!existsSync(join(pkgDir, 'package.json'))) throw new Error('tgz 内无 package/package.json')
    if (existsSync(target)) rmSync(target, { recursive: true, force: true })
    mkdirSync(dirname(target), { recursive: true })
    copyTree(pkgDir, target)
  } finally {
    rmSync(dlDir, { recursive: true, force: true })
  }
}

/** 套装安装（submodule 聚合仓库）：照仓库 install.ps1/README 语义——
 * clone 套装 → 手动镜像拉取子模块 → 按类型装配（bundle 插件含 Release tgz 兜底 / 普通插件 / 技能 / agent 预设）。
 * 不执行第三方脚本本体（安全护栏：脚本型只读语义不运行）。 */
async function runSuiteInstallJob(job, ctx) {
  const tmpDir = join(tmpdir(), `dsh-suite-${job.id}-${Date.now()}`)
  const report = []
  try {
    job.stage = 'preparing'
    mkdirSync(tmpDir, { recursive: true })
    await gitCloneRepo(job.repo, tmpDir, job.source)
    const subs = readGitmodules(tmpDir)
    if (subs.length === 0) throw new Error('未找到 .gitmodules（不是 submodule 套装仓库）')
    job.stage = 'detecting'
    const patchPath = findPatchPath(ctx)
    const profileDir = dirname(patchPath)
    // 手动拉取子模块（git 的 insteadOf 重写对 submodule 不生效，按镜像 URL 逐个 clone）
    for (const sub of subs) {
      const subRepo = sub.url.replace(/^https?:\/\/[^/]+\//u, '').replace(/\.git$/u, '')
      const dest = join(tmpDir, sub.path)
      try {
        mkdirSync(dirname(dest), { recursive: true })
        await gitCloneRepo(subRepo, dest, sub.url.includes('gitee.com') ? 'gitee' : 'github', 120000)
      } catch (error) {
        report.push({ component: sub.name, type: 'clone', ok: false, note: `子模块拉取失败：${error.message}` })
      }
    }
    for (const sub of subs) {
      const subDir = join(tmpDir, sub.path)
      if (!existsSync(subDir)) continue
      const subRepo = sub.url.replace(/^https?:\/\/[^/]+\//u, '').replace(/\.git$/u, '')
      let pkg = null
      try {
        const pkgPath = join(subDir, 'package.json')
        if (existsSync(pkgPath)) pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
      } catch {}
      let handled = false
      // a. bundle 型插件（如 injector）：自动装配默认**跳过**并给出官方装配指引——
      // 第三方 bundle 需与当前 DSH 版本严格兼容（peer 依赖、client inject 模块、patch 语义），
      // 自动写入 bundles 曾导致启动崩溃；预设/技能/普通插件不受影响。
      if (pkg && typeof pkg.name === 'string' && pkg.dsh?.bundle) {
        report.push({ component: sub.name, type: 'bundle', ok: false, note: `${pkg.name} 是 bundle 型插件，自动装配已跳过（避免 bundle 不兼容导致启动失败）；请按详情面板「官方安装方式」命令手动装配（clone 套装后运行 install.ps1，或构建后加入 profile 的 dsh.profile.bundles）` })
        handled = true
      }
      // b. 技能（根或第一层子目录 SKILL.md）
      if (!handled) {
        let skillDir0 = ''
        if (existsSync(join(subDir, 'SKILL.md'))) {
          skillDir0 = ''
        } else {
          let found = null
          try {
            found = readdirSync(subDir, { withFileTypes: true })
              .find((d) => d.isDirectory() && existsSync(join(subDir, d.name, 'SKILL.md')))
          } catch {}
          skillDir0 = found ? found.name : null
        }
        if (skillDir0 !== null) {
          const skillsRoot = join(dshHome(), 'skills')
          mkdirSync(skillsRoot, { recursive: true })
          const dest = join(skillsRoot, sub.name)
          if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
          copyTree(join(subDir, skillDir0), dest)
          report.push({ component: sub.name, type: 'skill', ok: true, note: `已安装技能 ~/.dsh/skills/${sub.name}` })
          handled = true
        }
      }
      // c. agent 预设（含 preset.yml + agent.cordis.yml 的目录；预设优先于普通 npm 包——
      // 如 dsh-router-standard 既是 npm 包又带预设目录，install.ps1 意图是复制预设）
      const presets = findPresetDirs(subDir, 2)
      for (const p of presets) {
        const pname = basename(p)
        const presetsRoot = join(dshHome(), '.agent-presets')
        mkdirSync(presetsRoot, { recursive: true })
        const dest = join(presetsRoot, pname)
        if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
        copyTree(p, dest)
        report.push({ component: sub.name, type: 'preset', ok: true, note: `已安装预设 ${pname}（新建会话可选）` })
        handled = true
      }
      // d. 普通 npm 插件（无 bundle 且无预设/技能）
      if (!handled && pkg && typeof pkg.name === 'string') {
        const target = join(profileDir, 'node_modules', pkg.name)
        if (existsSync(target)) rmSync(target, { recursive: true, force: true })
        mkdirSync(dirname(target), { recursive: true })
        copyTree(subDir, target)
        const taken = new Set(listEntries(ctx).map((e) => e.rowId))
        const entryId = deriveEntryId(pkg.name, taken)
        await appendInsert(patchPath, entryId, pkg.name)
        report.push({ component: sub.name, type: 'plugin', ok: true, note: `已安装 ${pkg.name}（HMR 生效）` })
        handled = true
      }
      if (!handled) {
        report.push({ component: sub.name, type: 'unknown', ok: false, note: '未识别组件类型（无 package.json / SKILL.md / 预设）' })
      }
    }
    job.status = 'done'
    job.stage = 'done'
    job.suiteReport = report
    const okCount = report.filter((r) => r.ok).length
    const failCount = report.filter((r) => !r.ok).length
    const bundleCount = report.filter((r) => r.type === 'bundle' && r.ok).length
    job.suiteNote = `套装安装完成：${okCount} 个组件成功${failCount > 0 ? `，${failCount} 个失败（详见报告）` : ''}${bundleCount > 0 ? '。bundle 组件需重启服务生效' : ''}；预设需新建会话时选择。`
  } catch (error) {
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : String(error)
  } finally {
    try { rmSync(tmpDir, { recursive: true, force: true }) } catch {}
    job.finishedAt = Date.now()
  }
}

/** 技能安装：git clone 仓库 → 定位 SKILL.md（根或第一层子目录）→ 复制到 ~/.dsh/skills/<name>/。
 * 技能由 dsh-skill-filesystem 插件扫描（发现根：<dshHome>/skills），与桌面版共享。 */
async function runSkillInstallJob(job, ctx) {
  const tmpDir = join(tmpdir(), `dsh-skill-${job.id}-${Date.now()}`)
  try {
    job.stage = 'preparing'
    const shortName = String(job.repo).split('/').pop() || job.repo
    mkdirSync(tmpDir, { recursive: true })
    const urls = job.source === 'gitee'
      ? [`https://gitee.com/${job.repo}.git`]
      : [`https://ghproxy.net/https://github.com/${job.repo}.git`, `https://github.com/${job.repo}.git`]
    let cloned = false
    let lastError = null
    for (const url of urls) {
      try {
        await execFileAsync('git', ['clone', '--depth', '1', '--quiet', url, tmpDir], {
          timeout: 120000,
          windowsHide: true,
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        })
        cloned = true
        break
      } catch (error) {
        lastError = error
      }
    }
    if (!cloned) throw new Error(`git clone 失败：${lastError?.message ?? '未知'}`)
    job.stage = 'detecting'
    // 定位 SKILL.md：根目录优先，其次第一层子目录（常用布局 skills/<name>/SKILL.md）
    let skillDir = ''
    if (!existsSync(join(tmpDir, 'SKILL.md'))) {
      const sub = readdirSync(tmpDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
        .find((d) => existsSync(join(tmpDir, d.name, 'SKILL.md')))
      if (sub) skillDir = sub.name
    }
    if (!existsSync(join(tmpDir, skillDir, 'SKILL.md'))) {
      // 根与第一层子目录都没有：区分「技能集合仓库」与「非技能仓库」，给出可操作提示
      let collection = false
      try {
        const tree = await curlJson(`https://api.github.com/repos/${job.repo}/git/trees/${encodeURIComponent(job.source === 'gitee' ? 'master' : 'main')}?recursive=1`, 6000).catch(() => null)
        collection = (tree?.tree ?? []).filter((n) => n.type === 'blob' && /(?:^|\/)SKILL\.md$/u.test(n.path)).length > 1
      } catch {}
      if (collection) {
        throw new Error('这是技能集合仓库（含多个 SKILL.md），请安装其中单个技能仓库（根或第一层子目录含 SKILL.md 的仓库）')
      }
      throw new Error('仓库内未找到 SKILL.md（检查根目录或第一层子目录）')
    }
    // 技能名：SKILL.md frontmatter 的 name（kebab-case）优先，否则用仓库短名
    let skillName = shortName
    try {
      const text = readFileSync(join(tmpDir, skillDir, 'SKILL.md'), 'utf8')
      const m = text.match(/^name:\s*([a-z0-9][a-z0-9-]{0,63})/mu)
      if (m) skillName = m[1]
    } catch {}
    const skillsRoot = join(dshHome(), 'skills')
    const dest = join(skillsRoot, skillName)
    mkdirSync(skillsRoot, { recursive: true })
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
    copyTree(join(tmpDir, skillDir), dest)
    job.kind = 'skill'
    job.skillName = skillName
    job.skillDir = dest
    job.status = 'done'
    job.stage = 'done'
    job.skillNote = `已安装技能「${skillName}」到 ${dest}。技能由 dsh-skill-filesystem 插件扫描发现（用户根 ~/.dsh/skills）；若当前 profile 未启用该插件，请在 profile 的 cordis.yml 启用 @deepseek-ai/dsh-skill-filesystem 后重启即可生效。`
  } catch (error) {
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : String(error)
  } finally {
    // 无论成败都清理克隆临时目录（cpSync EIO 时代曾泄漏在 TEMP）
    try { rmSync(tmpDir, { recursive: true, force: true }) } catch {}
    job.finishedAt = Date.now()
  }
}

/** 技能停用注入的 frontmatter 行（官方调用策略：disable-model-invocation 从模型目录/loader 排除，
 * user-invocable 从用户命令排除；两者同设 = 完整停用）。 */
const SKILL_DISABLE_LINES = ['disable-model-invocation: true', 'user-invocable: false']

/** 返回 SKILL.md frontmatter 内容区间（不含首尾 --- 行）；无 frontmatter 时 { has: false }。 */
function skillFrontmatterBounds(text) {
  if (!text.startsWith('---')) return { has: false }
  const nl = text.indexOf('\n')
  if (nl === -1) return { has: false }
  const end = text.indexOf('\n---', nl + 1)
  if (end === -1) return { has: false }
  return { has: true, start: nl + 1, end }
}

/** 技能是否已停用（frontmatter 含 disable-model-invocation: true）。 */
function isSkillDisabled(skillFile) {
  try {
    const text = readFileSync(skillFile, 'utf8')
    const fm = skillFrontmatterBounds(text)
    if (!fm.has) return false
    return /^\s*disable-model-invocation:\s*(true|yes|on|1)\s*$/mu.test(text.slice(fm.start, fm.end))
  } catch {
    return false
  }
}

/** 停用/启用技能（可逆）：停用 = 备份原始 SKILL.md 到同目录 .dsh-skill-fm.bak 后在
 * frontmatter 注入调用策略行；启用 = 恢复备份（无备份则移除注入行）。 */
function setSkillEnabled(skillFile, enabled) {
  const backup = join(dirname(skillFile), '.dsh-skill-fm.bak')
  const text = readFileSync(skillFile, 'utf8')
  const fm = skillFrontmatterBounds(text)
  if (!enabled) {
    if (!existsSync(backup)) writeFileSync(backup, text, 'utf8')
    const inject = `${SKILL_DISABLE_LINES.join('\n')}\n`
    if (!fm.has) {
      writeFileSync(skillFile, `---\n${inject}---\n\n${text}`, 'utf8')
    } else {
      writeFileSync(skillFile, `${text.slice(0, fm.start)}${inject}${text.slice(fm.start)}`, 'utf8')
    }
  } else if (existsSync(backup)) {
    writeFileSync(skillFile, readFileSync(backup, 'utf8'), 'utf8')
    rmSync(backup, { force: true })
  } else if (fm.has) {
    const content = text.slice(fm.start, fm.end)
    const cleaned = content.split('\n')
      .filter((l) => !/^\s*(disable-model-invocation|user-invocable)\s*:/u.test(l))
      .join('\n')
    writeFileSync(skillFile, `${text.slice(0, fm.start)}${cleaned}${text.slice(fm.end)}`, 'utf8')
  }
}

/** 列出已安装技能（~/.dsh/skills 下一层含 SKILL.md 的目录 + 平铺 .md 文件）。
 * 点号开头（如 .system）是系统技能根（dsh-skill-filesystem 保留目录），标记 system: true，
 * 前端展示「系统」标签且不提供删除。disabled = 已按官方调用策略停用。 */
function listInstalledSkills() {
  const root = join(dshHome(), 'skills')
  const skills = []
  try {
    if (!existsSync(root)) return skills
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      const system = entry.name.startsWith('.')
      if (entry.isDirectory()) {
        const skillFile = join(root, entry.name, 'SKILL.md')
        if (existsSync(skillFile)) {
          skills.push({ name: entry.name, path: skillFile, system, disabled: isSkillDisabled(skillFile) })
        }
      } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'SKILL.md') {
        const skillFile = join(root, entry.name)
        skills.push({ name: entry.name.slice(0, -3), path: skillFile, system, disabled: isSkillDisabled(skillFile) })
      }
    }
  } catch {}
  return skills
}

/** 服务端列出仓库子包（git trees 递归 + 并行读 package.json 的 name）。 */
async function fetchSubpackageNames(repo, branch, auth) {
  try {
    const data = await githubJson(`${GITHUB_API}/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, undefined, auth)
    const paths = (data.tree ?? [])
      .filter((node) => node.type === 'blob' && /^packages\/[^/]+\/package\.json$/u.test(node.path))
      .map((node) => node.path)
    // 并行读取：黑洞期单条最坏 40s，24 条串行会拖到十几分钟
    const results = await Promise.all(paths.slice(0, 24).map(async (path) => {
      const bodyText = await rawTextWithFallback(repo, branch, path)
      if (bodyText === null) return null
      try {
        const pkg = JSON.parse(bodyText)
        if (pkg && typeof pkg.name === 'string') return { dir: path.split('/')[1], name: pkg.name }
      } catch {}
      return null
    }))
    return results.filter((item) => item !== null)
  } catch {
    return []
  }
}

/** 子包候选：聚合包（名字带 all）优先，上限 8 个。 */
async function subpackageCandidates(repo, branch, auth) {
  const isAll = (name) => /(^|-)all$/u.test(name) || /-all-/u.test(name)
  const subs = await fetchSubpackageNames(repo, branch, auth)
  return subs
    .slice()
    .sort((a, b) => Number(isAll(b.name)) - Number(isAll(a.name)))
    .map((sub) => sub.name)
    .slice(0, 8)
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
    '你是 DeepSeek Harness 的插件安装专家。用户通过插件管理面板安装插件失败，现在由你主动接管安装（不是被动"修复"，而是像人工一样把它装好）。',
    `目标仓库：${job.repo}`,
    `候选包名：${candidates.join('、')}`,
    `profile 目录：${profileDir}（pnpm 管理，绝不能用 npm 写入，会破坏链接）`,
    `此前确定性通道的错误：${lastError ?? '未知'}`,
    '接管步骤：',
    `1) 先弄清楚装什么：若根包是 private 的聚合仓库（monorepo），用 gh api repos/${job.repo}/git/trees/main?recursive=1 或读 packages 目录下的 package.json 找出子包名；优先选聚合包（名字含 all，如 dsh-web-ui-all，一个包装全部）；`,
    `2) 用 corepack pnpm 安装（Windows 执行 node ${JSON.stringify(corepackJs)} pnpm add <包名> --registry https://registry.npmmirror.com，工作目录 ${profileDir}）；镜像 404 时改 --registry https://registry.npmjs.org；都不行再用 git 通道；`,
    '3) **node 网络黑洞判定**：pnpm 长时间无下载进度（Progress 停在 downloaded 0）、或报 socket hang up / EPERM / TIMEOUT、或 node 脚本连 127.0.0.1 都超时，说明本机拦截 node 进程网络——此时 curl 与系统 git 通常仍可用，立即改用 curl 手动安装：先 `curl -s https://registry.npmmirror.com/<包名>` 取最新版本号，再 `curl -sL -o <临时目录>/pkg.tgz https://registry.npmmirror.com/<包名>/-/<包名>-<版本>.tgz`，解压 tar -xzf 后把 package 内容放入 profile/node_modules/<包名>（先备份旧目录）；包有 dependencies 时用同样方式逐个 curl 拉取补齐到 node_modules；零依赖包（如 dsh-skin）一条龙即可完成；',
    `4) 安装成功后按官方 dsh plugin add 规则落配置：包声明 dsh.bundle 时把包名追加进 profile 目录 package.json 的 dsh.profile.bundles 数组；普通插件在 cordis.patch.yml 追加 insert 行（id 由包名去 scope、非字母数字转连字符生成，name 填包名）；`,
    '5) 装完自查：确认包已出现在 node_modules、配置已写入；必要时用 gh api 核对仓库信息；',
    '6) 执行 git/pnpm 前先设置环境变量 GIT_TERMINAL_PROMPT=0 和 GCM_INTERACTIVE=never，禁止弹出任何登录/凭据窗口；',
    '7) 不要杀进程、不要重启服务、不要改动与本次安装无关的文件。',
    '完成后用一两句话报告结果；确实无法安装也请说明原因。',
  ].join('\n')
  try {
    // in-process 驱动要求 parent 是真实的活动 Agent（parent.ctx.agents.create）。
    // 控制台在根上下文运行，从 Agent 注册表借一个顶级会话作为结构性父代理。
    let parent = null
    try {
      const agents = ctx.get('agents')
      const candidates = typeof agents?.roots === 'function' ? agents.roots() : (typeof agents?.list === 'function' ? agents.list() : [])
      parent = candidates[0] ?? null
    } catch {}
    if (parent === null) {
      job.status = 'failed'
      job.error = `本地 AI 修复无法借用活动会话（agents 注册表为空）。原始错误：${lastError ?? '未知'}；请手动执行：dsh plugin --profile web add <包名>`
      return
    }
    const controller = new AbortController()
    const run = await startFn.call(subagents, provider, {
      label: `install-repair-${String(job.repo).split('/')[1] ?? 'plugin'}`,
      prompt: [{ type: 'text', text: prompt }],
      // 父代理深度 0，修复子代理至少深度 1（0 会触发 depth 校验失败）
      maxDepth: 1,
      signal: controller.signal,
      parent,
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
      new Promise((resolve) => setTimeout(() => {
        controller.abort()
        resolve({ status: 'failed', detail: '本地 AI 修复超时（10 分钟）' })
      }, 600000)),
    ])
    if (outcome.status === 'completed') {
      // 校验修复结果：任一候选包现在可解析（或已进 bundle 层）才算成功，
      // 避免子代理"跑完流程但没装上"被误报为成功
      let verified = false
      try {
        const requireLocal = createRequire(join(profileDir, 'package.json'))
        for (const name of candidates) {
          try {
            requireLocal.resolve(`${name}/package.json`)
            verified = true
            break
          } catch {}
        }
        if (!verified) {
          const manifest = JSON.parse(await readFile(join(profileDir, 'package.json'), 'utf8'))
          const bundles = manifest.dsh?.profile?.bundles ?? []
          if (candidates.some((name) => bundles.includes(name))) verified = true
        }
      } catch {}
      if (verified) {
        job.status = 'done'
        job.aiNote = '本地 AI 已接管并完成修复，请刷新页面查看'
      } else {
        job.status = 'failed'
        job.error = `本地 AI 完成了修复流程，但未能确认安装成功（候选包 ${candidates.join('、')} 均不可解析）；请手动执行：dsh plugin --profile web add <包名>`
      }
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
      // 套装兜底：submodule 聚合仓库（根 .gitmodules 存在）→ 自动转套装安装，
      // 不依赖前端标记（搜索结果 enrich 是异步的、索引浏览条目无 enrich）
      let suiteProbe = await rawTextWithFallback(job.repo, 'main', '.gitmodules')
      if (suiteProbe === null) suiteProbe = await rawTextWithFallback(job.repo, 'master', '.gitmodules')
      if (suiteProbe !== null) {
        job.kind = 'suite'
        await runSuiteInstallJob(job, ctx)
        return
      }
      // 兜底：宿主端自行拉取仓库元数据（githubJson 与 curl 竞速 + 3s 超时降级，黑洞期不卡 40s）
      const meta = await Promise.race([
        Promise.any([
          githubJson(`${GITHUB_API}/repos/${job.repo}`),
          curlJson(`${GITHUB_API}/repos/${job.repo}`, 12000),
        ]),
        new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
      ]).catch(() => null)
      const branch = meta?.default_branch ?? 'main'
      const pkg = await fetchRepoPackage(job.repo, branch)
      if (pkg === null) {
        job.status = 'failed'
        job.error = `仓库 ${job.repo} 没有可用的 package.json，无法作为 npm 包安装`
        return
      }
      if (pkg.private === true) {
        // 私有 monorepo 根：自动列出子包作为候选（把人工修复经验自动化），聚合包优先
        subpackageMode = true
        candidates = await subpackageCandidates(job.repo, branch)
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
    // 给了根包名但根包实际是 private 聚合仓库（如直接填 dsh-web-ui）：
    // 与仓库模式同路径——直接展开子包（聚合包优先），跳过 git 装根包的无意义尝试
    if (!subpackageMode && job.repo && job.packageName !== null) {
      const rootPkg = await fetchRepoPackage(job.repo, 'main')
      if (rootPkg !== null && rootPkg.private === true) {
        subpackageMode = true
        const subs = await subpackageCandidates(job.repo, 'main', readGithubAuth().token)
        if (subs.length > 0) {
          candidates = [...subs.filter((name) => !candidates.includes(name)), ...candidates]
          job.subpackages = subs
        }
      }
    }
    job.stage = 'installing'
    const patchPath = findPatchPath(ctx)
    const profileDir = dirname(patchPath)
    const taken = new Set(listEntries(ctx).map((entry) => entry.rowId))
    const patch = await readPatchState(patchPath)
    for (const id of [...patch.inserts, ...patch.disables, ...patch.forced]) taken.add(id)
    let installedName = null
    let lastError = null
    let expanded = false
    // 可配置软件源：主→备依次尝试（默认 npmmirror → npmjs，可增删自定义/内网源）
    const registries = orderedRegistries(readSources())
    const deadline = Date.now() + 8 * 60 * 1000
    for (let index = 0; index < candidates.length && installedName === null; index += 1) {
      if (Date.now() > deadline) break
      const name = candidates[index]
      // 通道 1..n：配置的软件源依次尝试（每源 90 秒封顶）
      for (let ri = 0; ri < registries.length && installedName === null; ri += 1) {
        try {
          await pnpmInstall(profileDir, name, registries[ri])
          installedName = name
          break
        } catch (error) {
          lastError = error
        }
      }
      if (installedName === null) {
        // 通道 n+1：curl 手动安装（node 网络黑洞时 pnpm 下载卡死、curl 可用）——
        // 下载 registry tarball 解压到 node_modules，零依赖包可完整安装
        if (!subpackageMode && !expanded) {
          try {
            const info = await curlManualInstall(profileDir, name, registries)
            installedName = name
            job.curlNote = `已通过 curl 通道安装 v${info.version}${info.missingDeps.length > 0 ? `（依赖未补齐：${info.missingDeps.join('、')}，网络恢复后建议重新安装）` : ''}`
          } catch (curlError) {
            lastError = curlError
          }
        }
      }
      if (installedName === null) {
        // 通道 n+2：git 通道（GitHub 走加速代理+直连；Gitee 走对应平台；各 60 秒封顶）
        if (!subpackageMode && !expanded) {
          const gitSpecs = job.source === 'gitee'
            ? [`git+https://gitee.com/${job.repo}.git`]
            : [
                `git+https://ghproxy.net/https://github.com/${job.repo}.git`,
                `github:${job.repo}`,
              ]
          for (const spec of gitSpecs) {
            try {
              await pnpmInstall(profileDir, spec, undefined, 60000)
              installedName = name
              break
            } catch (gitError) {
              lastError = gitError
            }
          }
        }
      }
      if (installedName !== null) break
      // Windows 原子替换失败（陈旧目录 / _tmp_ 残留）是 EPERM 类错误的根因：
      // 清理后用主源重试一次（把 AI 人工修复经验自动化，减少 AI 兜底触发）
      if (installedName === null && /EPERM|EACCES|rename/i.test(String(lastError?.message ?? ''))) {
        const cleaned = cleanupStalePackageDir(profileDir, name)
        if (cleaned > 0) {
          try {
            await pnpmInstall(profileDir, name, registries[0])
            installedName = name
          } catch (error) {
            lastError = error
          }
        }
      }
      if (installedName !== null) break
      // 懒惰展开：registry 与 git 通道都失败时，自动发现仓库子包继续尝试（聚合包优先），
      // 覆盖"给了根包名但根包未发布"的场景——AI 兜底只处理真正无解的案例
      if (!expanded && job.repo) {
        expanded = true
        let subs = await fetchSubpackageNames(job.repo, 'main', readGithubAuth().token)
        if (subs.length === 0) subs = await fetchSubpackageNames(job.repo, 'master', readGithubAuth().token)
        if (subs.length > 0) {
          const extra = subs
            .slice()
            .sort((a, b) => Number(/(^|-)all$/u.test(b.name) || /-all-/u.test(b.name)) - Number(/(^|-)all$/u.test(a.name) || /-all-/u.test(a.name)))
            .map((sub) => sub.name)
            .filter((n) => !candidates.includes(n))
            .slice(0, 8)
          if (extra.length > 0) {
            candidates = [...candidates, ...extra]
            if (!Array.isArray(job.subpackages)) job.subpackages = []
            for (const e of extra) if (!job.subpackages.includes(e)) job.subpackages.push(e)
          }
        }
      }
    }
    if (installedName === null) {
      // 本地 AI 兜底会调用模型 API、产生费用：挂起等待用户明确同意后再执行
      job.stage = 'ai-consent'
      job.aiPending = { lastError: lastError?.message ?? null }
      job.aiWait = new Promise((resolve) => { job.aiPending.resolver = resolve })
      const decision = await Promise.race([
        job.aiWait,
        new Promise((resolve) => setTimeout(() => resolve({ approved: false, timeout: true }), 600000)),
      ])
      job.aiPending = null
      job.aiWait = null
      if (decision.approved === true) {
        await aiRepair(job, ctx, profileDir, candidates, lastError?.message ?? null)
      } else {
        job.status = 'failed'
        job.error = decision.timeout === true
          ? '等待授权超时（10 分钟），已取消本地 AI 兜底（该操作会调用模型 API 产生费用）'
          : '用户取消本地 AI 兜底（该操作会调用模型 API 产生费用）'
      }
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
    // 框架升级检测与适配（备份快照 + 重打框架补丁），try 包裹不阻塞 state 返回
    let framework = null
    try { framework = detectFrameworkUpgrade(ctx) } catch {}
    sendJson(res, 200, { ok: true, entries, patchPath, compat, installJobs: jobs, recentFailures, github: { loggedIn: auth.loggedIn, login: auth.login }, patch: { disables: patch.disables, forced: patch.forced, inserts: patch.inserts }, framework })
    return
  }

  if (method === 'GET' && pathname === `${ROUTE_PREFIX}/sources`) {
    const sources = readSources()
    const gitee = readGiteeConfig(sources)
    sendJson(res, 200, { ok: true, sources, giteeStatus: { clientConfigured: gitee.clientId !== '', hasToken: gitee.token !== '', login: gitee.login } })
    return
  }

  if (method === 'GET' && pathname === `${ROUTE_PREFIX}/gitee-oauth-url`) {
    const gitee = readGiteeConfig(readSources())
    if (!gitee.clientId) {
      sendError(res, 400, '请先在软件源管理中配置 Gitee 应用的 client_id / client_secret')
      return
    }
    const port = webPort(ctx)
    const redirect = `http://127.0.0.1:${port}/plugin-console/gitee-oauth-callback`
    // scope 请求 user_info + projects：Gitee 会校验请求的 scope 必须在应用已勾选的权限范围内，
    // 应用权限必须同步勾选 user_info、projects，否则报「请求范围无效、未知或格式不正确」
    const url = `${GITEE_AUTH_URL}?client_id=${encodeURIComponent(gitee.clientId)}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=${encodeURIComponent('user_info projects')}`
    sendJson(res, 200, { ok: true, url, redirect })
    return
  }

  if (method === 'GET' && pathname === `${ROUTE_PREFIX}/gitee-oauth-callback`) {
    const code = new URL(req.url ?? '/', 'http://x').searchParams.get('code')
    const sources = readSources()
    const gitee = readGiteeConfig(sources)
    const failPage = (text) => {
      res.writeHead(400, { 'content-type': 'text/html; charset=utf-8' })
      res.end(`<h3>${text}</h3>`)
    }
    if (!code) {
      failPage('这是 Gitee 授权回调地址，不能直接访问。<br>正确流程：插件面板 → 软件源管理 → 填入 client_id / client_secret → 保存配置 → 点击「授权登录 Gitee」，授权完成后会自动跳回这里。')
      return
    }
    if (!gitee.clientId || !gitee.clientSecret) {
      failPage('未配置 Gitee 应用：请先在 gitee.com 创建第三方应用（回调地址填本页完整地址），再在插件面板 → 软件源管理 中填入 client_id / client_secret 并保存。')
      return
    }
    const port = webPort(ctx)
    const redirect = `http://127.0.0.1:${port}/plugin-console/gitee-oauth-callback`
    const result = await postJsonUrl(GITEE_TOKEN_URL, {
      grant_type: 'authorization_code',
      code,
      client_id: gitee.clientId,
      client_secret: gitee.clientSecret,
      redirect_uri: redirect,
    })
    if (result.status < 200 || result.status >= 300 || !result.body || !result.body.access_token) {
      failPage('Gitee 授权失败：token 交换错误，请检查 client_id / client_secret')
      return
    }
    gitee.token = result.body.access_token
    try {
      const user = await fetchJsonUrl(`https://gitee.com/api/v5/user?access_token=${encodeURIComponent(gitee.token)}`)
      gitee.login = user && typeof user.login === 'string' ? user.login : ''
    } catch {}
    sources.gitee = gitee
    await writeSources(sources)
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end('<h3>Gitee 授权成功，可以关闭此页面并回到插件面板</h3>')
    return
  }

  if (method === 'GET' && pathname === `${ROUTE_PREFIX}/skills-installed`) {
    // 已安装技能清单（~/.dsh/skills 用户根），前端用于标记「已安装」与展示
    sendJson(res, 200, { ok: true, skills: listInstalledSkills() })
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

  if (pathname === `${ROUTE_PREFIX}/uninstall`) {
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
    const rowId = rowIdOf(ctx, entryId)
    if (rowId === 'plugin-console') {
      sendError(res, 400, '不能删除插件控制台自身')
      return
    }
    if (isProtectedModule(moduleName)) {
      sendError(res, 403, `${moduleName} 属于宿主基础设施，禁止删除`)
      return
    }
    const patchPath = findPatchPath(ctx)
    const profileDir = dirname(patchPath)
    const patch = await readPatchState(patchPath)
    // bundle 来源的额外插件（如皮肤中心）：删除其所属 bundle
    const owners = await readExtraBundleOwners(profileDir)
    const ownerBundle = owners.get(rowId) ?? owners.get(moduleName)
    if (ownerBundle !== undefined) {
      await removeBundleFromManifest(profileDir, ownerBundle)
      let uninstallError = null
      try {
        await pnpmRemove(profileDir, ownerBundle)
      } catch (error) {
        uninstallError = error instanceof Error ? error.message : String(error)
      }
      sendJson(res, 200, { ok: true, removed: 'bundle', packageName: ownerBundle, restart: true, uninstallError })
      return
    }
    if (!patch.inserts.includes(rowId)) {
      sendError(res, 400, '该插件不是用户安装的额外插件（不可删除）')
      return
    }
    await removeInsertRow(patchPath, rowId)
    let uninstallError = null
    try {
      await pnpmRemove(profileDir, moduleName)
    } catch (error) {
      uninstallError = error instanceof Error ? error.message : String(error)
    }
    sendJson(res, 200, { ok: true, removed: 'entry', packageName: moduleName, restart: false, uninstallError })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/search`) {
    const raw = typeof body.q === 'string' ? body.q.trim() : ''
    const query = raw === '' ? DEFAULT_SEARCH : raw
    const page = Math.max(Math.min(Number.parseInt(String(body.page), 10) || 1, 5), 1)
    const source = typeof body.source === 'string' && body.source !== '' ? body.source : 'github'
    const auth = readGithubAuth()
    let items = []
    if (body.multi === true) {
      // 多源汇总：GitHub + 全部自定义搜索源并行检索，结果合并（每项带 source 标记）。
      // Gitee 为直装模式（关键词搜索无意义），不参与多源汇总。
      const sources = readSources()
      const tasks = [
        (async () => {
          try {
            const data = await githubJson(
              `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20&page=${page}`,
              req.signal,
              auth.token,
            )
            return normalizePlatformItems(data.items ?? [], 'main').map((item) => ({ ...item, source: 'github', sourceName: 'GitHub' }))
          } catch {
            return []
          }
        })(),
        ...sources.searchSources.filter((s) => s.type === 'custom').map((s) => (async () => {
          try {
            const url = s.url.replace('{q}', encodeURIComponent(query)).replace('{page}', String(page))
            const data = await fetchJsonUrl(url, 15000, s.headers ?? {})
            return normalizePlatformItems(data, 'main').map((item) => ({ ...item, source: s.id, sourceName: s.name }))
          } catch {
            return []
          }
        })()),
      ]
      const results = await Promise.all(tasks)
      items = results.flat()
      items = await enrichItems(items)
      sendJson(res, 200, { ok: true, query, items, authenticated: auth.loggedIn, source: 'all', multi: true })
      return
    }
    if (body.skills === true) {
      // 技能模式搜索：agent-skills / claude-skills / dsh-skill 三 topic 并行检索后合并去重
      // （GitHub search 的 OR 语法优先级不可靠，分开查最稳），按 star 排序取前 20。
      if (source !== 'github') {
        sendError(res, 400, '技能搜索仅支持 GitHub 源')
        return
      }
      const keyword = raw === '' ? '' : `${raw} in:name,description,topics `
      const tasks = SKILL_TOPICS.map((topic) => (async () => {
        try {
          const data = await githubJson(
            `${GITHUB_API}/search/repositories?q=${encodeURIComponent(`${keyword}topic:${topic}`)}&sort=stars&order=desc&per_page=20&page=${page}`,
            req.signal,
            auth.token,
          )
          return normalizePlatformItems(data.items ?? [], 'main').map((item) => ({ ...item, source: 'github', skillTopics: [topic] }))
        } catch {
          return []
        }
      })())
      const merged = (await Promise.all(tasks)).flat()
      const seen = new Set()
      items = []
      for (const item of merged.sort((a, b) => b.stars - a.stars)) {
        if (seen.has(item.fullName)) continue
        seen.add(item.fullName)
        items.push(item)
        if (items.length >= 20) break
      }
      items = await enrichItems(items)
      sendJson(res, 200, { ok: true, query, items, authenticated: auth.loggedIn, source: 'github', skills: true })
      return
    }
    if (source === 'gitee') {
      // Gitee 官方 v5 搜索接口（search/repositories）已废弃（恒返回空）；
      // so.gitee.com/v1（Indexea 后端）有百度云 WAF 反爬且需映答账号 token。
      // 因此 Gitee 源采用仓库直装模式：输入 owner/repo 直接取仓库信息（公开接口，无需登录）。
      const gitee = readGiteeConfig(readSources())
      let repo = ''
      let giteeError = ''
      try {
        repo = githubRepoInfo(query)
      } catch (error) {
        giteeError = error instanceof Error ? error.message : String(error)
      }
      if (repo) {
        try {
          const tokenQ = gitee.token ? `?access_token=${encodeURIComponent(gitee.token)}` : ''
          // repo 已由 githubRepoInfo 校验；分段编码（只编码中文等非 ASCII，斜杠保留原样——
          // Gitee 服务器不认 %2F 编码的路径分隔，返回 404）
          const [owner, name] = repo.split('/')
          const data = await fetchJsonUrl(`https://gitee.com/api/v5/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}${tokenQ}`)
          items = normalizePlatformItems([data], 'master').map((item) => ({ ...item, source: 'gitee' }))
        } catch (error) {
          giteeError = error instanceof Error ? error.message : String(error)
        }
      }
      sendJson(res, 200, { ok: true, query, items, authenticated: auth.loggedIn, source, giteeNeedsLogin: false, directOnly: true, giteeError })
      return
    } else if (source !== 'github') {
      // 自定义搜索源：URL 模板（{q}/{page} 占位符），返回数组或 {items} 结构；支持配置的请求头
      const sources = readSources()
      const custom = sources.searchSources.find((s) => s.id === source && s.type === 'custom')
      if (!custom) {
        sendError(res, 404, `没有这个搜索源：${source}`)
        return
      }
      const url = custom.url
        .replace('{q}', encodeURIComponent(query))
        .replace('{page}', String(page))
      const data = await fetchJsonUrl(url, 15000, custom.headers ?? {})
      items = normalizePlatformItems(data, 'main').map((item) => ({ ...item, source, sourceName: custom.name }))
    } else {
      const data = await githubJson(
        `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20&page=${page}`,
        req.signal,
        auth.token,
      )
      items = normalizePlatformItems(data.items ?? [], 'main').map((item) => ({ ...item, source: 'github' }))
      items = await enrichItems(items)
    }
    items = items.filter((item) => item.fullName !== '')
    sendJson(res, 200, { ok: true, query, items, authenticated: auth.loggedIn, source })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/enrich`) {
    // 为浏览器直连的搜索结果补官方/聚合标记（服务端通道可靠；客户端直连无标记能力）
    const raw = Array.isArray(body.items) ? body.items.slice(0, 30) : []
    const items = await enrichItems(raw)
    sendJson(res, 200, { ok: true, items })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/repo`) {
    const repo = githubRepoInfo(typeof body.repo === 'string' ? body.repo : '')
    const auth = readGithubAuth()
    // meta 降级策略：githubJson（https+镜像+gh）与 curl 竞速，3 秒超时即降级——
    // Promise.any 全失败时要等最慢分支（黑洞期 https 41.5s），加 race 超时避免拖累整体。
    let meta = null
    try {
      meta = await Promise.race([
        Promise.any([
          githubJson(`${GITHUB_API}/repos/${repo}`, req.signal, auth.token),
          curlJson(`${GITHUB_API}/repos/${repo}`, 12000),
        ]),
        new Promise((resolve) => setTimeout(() => resolve(null), 3000)),
      ])
    } catch {}
    const branch = meta?.default_branch ?? 'main'
    const pkg = await fetchRepoPackage(repo, branch)
    const skill = await detectSkillRepo(repo, branch)
    const skillMeta = skill.hasSkill ? await fetchSkillMeta(repo, branch, skill.skillDir) : null
    // 套装识别：根 .gitmodules 存在（submodule 聚合仓库）
    const hasSuite = (await rawTextWithFallback(repo, branch, '.gitmodules')) !== null
    // 官方安装方式（详情面板展示 + 一键复制，供用户手动安装）：
    // 套装 → 仓库 install.ps1/README 的官方步骤；普通/聚合 → dsh plugin add 官方命令
    let installCommand = null
    if (hasSuite) {
      const short = repo.split('/')[1] ?? repo
      const hasInstallScript = (await rawTextWithFallback(repo, branch, 'install.ps1')) !== null
        || (await rawTextWithFallback(repo, branch, 'install.sh')) !== null
      // 纯命令（无注释，CMD/PowerShell 通用）；sslVerify=false 兼容本机证书链问题；
      // 脚本用 powershell -File 调用，CMD 里也能跑
      installCommand = [
        `git -c http.sslVerify=false clone --recurse-submodules https://github.com/${repo}.git`,
        `cd ${short}`,
        hasInstallScript
          ? `powershell -ExecutionPolicy Bypass -File install.ps1`
          : `git submodule update --init --recursive`,
      ].join('\n')
    } else {
      installCommand = `dsh plugin --profile web add github:${repo}`
    }
    sendJson(res, 200, {
      ok: true,
      repo,
      defaultBranch: branch,
      description: meta?.description ?? '',
      stars: meta?.stargazers_count ?? 0,
      packageName: pkg?.name ?? null,
      packageDescription: pkg?.description ?? null,
      hasPackageJson: pkg !== null,
      privateRoot: pkg !== null && pkg.private === true,
      hasSkill: skill.hasSkill,
      skillDir: skill.skillDir,
      skill: skillMeta,
      hasSuite,
      installCommand,
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
    // 复用安装链的防护实现：任一 raw 拉取失败只跳过该子包，不整体 500
    const subpackages = await fetchSubpackageNames(repo, branch, auth.token)
    sendJson(res, 200, { ok: true, repo, branch, subpackages })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/sources`) {
    const { action } = body
    const sources = readSources()
    if (action === 'add') {
      const url = typeof body.url === 'string' ? body.url.trim() : ''
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!isAllowedSourceUrl(url)) {
        sendError(res, 400, '软件源地址必须是 https:// 开头（或本机/私网 http://）的合法 URL')
        return
      }
      if (sources.registries.some((r) => r.url === url)) {
        sendError(res, 400, '该软件源已存在')
        return
      }
      const entry = {
        id: `src-${Date.now().toString(36)}`,
        name: name || url,
        url,
        primary: sources.registries.length === 0,
      }
      sources.registries.push(entry)
      await writeSources(sources)
      sendJson(res, 200, { ok: true, sources })
      return
    }
    if (action === 'remove') {
      sendError(res, 400, '软件源不可删除（插件安装依赖的 npm 源，请使用编辑/设为主源）')
      return
    }
    if (action === 'edit') {
      const id = typeof body.id === 'string' ? body.id : ''
      const target = sources.registries.find((r) => r.id === id)
      if (!target) {
        sendError(res, 404, '没有这个软件源')
        return
      }
      const url = typeof body.url === 'string' ? body.url.trim() : target.url
      const name = typeof body.name === 'string' ? body.name.trim() : target.name
      if (!isAllowedSourceUrl(url)) {
        sendError(res, 400, '软件源地址必须是 https:// 开头（或本机/私网 http://）的合法 URL')
        return
      }
      if (sources.registries.some((r) => r.url === url && r.id !== id)) {
        sendError(res, 400, '该软件源地址已存在')
        return
      }
      target.url = url
      target.name = name || url
      await writeSources(sources)
      sendJson(res, 200, { ok: true, sources })
      return
    }
    if (action === 'set-primary') {
      const id = typeof body.id === 'string' ? body.id : ''
      if (!sources.registries.some((r) => r.id === id)) {
        sendError(res, 404, '没有这个软件源')
        return
      }
      for (const r of sources.registries) r.primary = r.id === id
      await writeSources(sources)
      sendJson(res, 200, { ok: true, sources })
      return
    }
    if (action === 'add-search') {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      const url = typeof body.url === 'string' ? body.url.trim() : ''
      if (!isAllowedSourceUrl(url)) {
        sendError(res, 400, '搜索地址必须是 https:// 开头（或本机/私网 http://）的合法 URL')
        return
      }
      if (!url.includes('{q}')) {
        sendError(res, 400, '搜索 URL 模板必须包含 {q} 占位符')
        return
      }
      if (sources.searchSources.some((s) => s.url === url)) {
        sendError(res, 400, '该搜索源已存在')
        return
      }
      // 可选请求头（认证等）：[{name, value}] 结构，仅服务端使用，不下发浏览器
      const headers = Array.isArray(body.headers)
        ? body.headers
          .filter((h) => h && typeof h.name === 'string' && h.name.trim() !== '' && typeof h.value === 'string')
          .map((h) => ({ name: h.name.trim().slice(0, 100), value: h.value.slice(0, 500) }))
        : []
      sources.searchSources.push({
        id: `search-${Date.now().toString(36)}`,
        name: name || url,
        type: 'custom',
        url,
        ...(headers.length > 0 ? { headers } : {}),
      })
      await writeSources(sources)
      sendJson(res, 200, { ok: true, sources })
      return
    }
    if (action === 'remove-search') {
      const id = typeof body.id === 'string' ? body.id : ''
      const target = sources.searchSources.find((s) => s.id === id)
      if (!target) {
        sendError(res, 404, '没有这个搜索源')
        return
      }
      if (target.type === 'builtin') {
        sendError(res, 400, '内置搜索源不可删除')
        return
      }
      sources.searchSources = sources.searchSources.filter((s) => s.id !== id)
      await writeSources(sources)
      sendJson(res, 200, { ok: true, sources })
      return
    }
    if (action === 'reset') {
      const defaults = JSON.parse(JSON.stringify(DEFAULT_SOURCES))
      await writeSources(defaults)
      sendJson(res, 200, { ok: true, sources: defaults })
      return
    }
    if (action === 'gitee-setup') {
      const clientId = typeof body.clientId === 'string' ? body.clientId.trim() : ''
      const clientSecret = typeof body.clientSecret === 'string' ? body.clientSecret.trim() : ''
      if (!clientId || !clientSecret) {
        sendError(res, 400, 'client_id 与 client_secret 不能为空')
        return
      }
      const current = readGiteeConfig(sources)
      sources.gitee = { ...current, clientId, clientSecret }
      await writeSources(sources)
      sendJson(res, 200, { ok: true, sources })
      return
    }
    if (action === 'gitee-clear') {
      const current = readGiteeConfig(sources)
      sources.gitee = { clientId: current.clientId, clientSecret: current.clientSecret, token: '', login: '' }
      await writeSources(sources)
      sendJson(res, 200, { ok: true, sources })
      return
    }
    sendError(res, 400, '未知操作（add / edit / set-primary / remove / add-search / remove-search / gitee-setup / gitee-clear / reset）')
    return
  }

  if (pathname === `${ROUTE_PREFIX}/market-index`) {
    // 静态插件索引（jsDelivr CDN）：curl 拉取 + 10 分钟内存缓存，市场秒开、零 GitHub API 调用
    if (marketIndexCache !== null && Date.now() - marketIndexCache.at < 600000) {
      sendJson(res, 200, { ok: true, ...marketIndexCache.data })
      return
    }
    const urls = [
      'https://cdn.jsdelivr.net/gh/Noob-stupid/dsh-plugin-hub@main/marketplace/index.json',
      'https://ghproxy.net/https://raw.githubusercontent.com/Noob-stupid/dsh-plugin-hub/main/marketplace/index.json',
    ]
    let lastError = null
    for (const url of urls) {
      try {
        const data = await fetchJsonUrl(url, 15000)
        if (data && Array.isArray(data.items)) {
          marketIndexCache = { at: Date.now(), data }
          sendJson(res, 200, { ok: true, ...data })
          return
        }
      } catch (error) {
        lastError = error
      }
    }
    sendError(res, 500, `索引加载失败：${lastError?.message ?? '未知'}`)
    return
  }

  if (pathname === `${ROUTE_PREFIX}/check-update`) {
    // 检测已安装插件是否有新版本：curl registry 元数据取 dist-tags.latest（node 网络黑洞时 curl 可用）。
    // 聚合包（有 dependencies）额外对比子包版本：声明版本 vs 本地 node_modules 实际版本，
    // 返回 depsOutdated 提示"更新本包需同步子包"，避免半更新混搭导致启动冲突。
    const packageName = typeof body.packageName === 'string' ? body.packageName.trim() : ''
    if (!packageName) {
      sendError(res, 400, 'packageName 不能为空')
      return
    }
    let latest = null
    let next = null
    let depsOutdated = []
    let error = null
    try {
      const encoded = packageName.startsWith('@')
        ? `@${encodeURIComponent(packageName.slice(1).split('/')[0])}%2f${encodeURIComponent(packageName.split('/').slice(1).join('/'))}`
        : encodeURIComponent(packageName)
      const data = await fetchJsonUrl(`https://registry.npmmirror.com/${encoded}`)
      latest = data?.['dist-tags']?.latest ?? null
      next = data?.['dist-tags']?.next ?? null
      // 子包配套检查：最新版声明依赖 vs 本地实际版本
      const patchPath = findPatchPath(ctx)
      const profileDir = dirname(patchPath)
      const declared = latest ? data?.versions?.[latest]?.dependencies ?? {} : {}
      const keys = typeof declared === 'object' ? Object.keys(declared) : []
      for (const dep of keys) {
        const required = String(declared[dep] ?? '').replace(/^[\^~>=< ]+/u, '')
        if (!required) continue
        let current = null
        try {
          const pkgPath = join(profileDir, 'node_modules', dep, 'package.json')
          if (existsSync(pkgPath)) {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
            current = typeof pkg.version === 'string' ? pkg.version : null
          }
        } catch {}
        if (current !== null && current !== required) {
          depsOutdated.push({ name: dep, current, required })
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    }
    sendJson(res, 200, { ok: true, packageName, latest, next, depsOutdated, error })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/framework-upgrade`) {
    // 框架升级入口：一键流程 = 备份配置快照 + 备份框架本体（回滚点）+ 自动升级
    // （npx 缓存 dsh 本体 + profile 官方配套包）+ 失败自动回滚 + 重启提示。
    // 升级完成重启后，框架适配逻辑自动：备份新版本快照 + 重打框架补丁 + 版本提示。
    let current = null
    let dshDir = null
    try {
      const require = createRequire(ctx.baseUrl ?? 'file:///')
      const dshPkgPath = require.resolve('@deepseek-ai/dsh/package.json')
      const dshPkg = JSON.parse(readFileSync(dshPkgPath, 'utf8'))
      current = dshPkg.version ?? null
      dshDir = dirname(dshPkgPath) // .../node_modules/@deepseek-ai/dsh
    } catch {}
    let latest = null
    let next = null
    try {
      const data = await fetchJsonUrl('https://registry.npmmirror.com/@deepseek-ai%2fdsh')
      latest = data?.['dist-tags']?.latest ?? null
      next = data?.['dist-tags']?.next ?? null
    } catch {}
    // 升级目标：稳定版 latest 优先；latest 与当前相同而 next（预发布渠道）更新时，目标取 next
    const target = latest !== null && current !== null && latest !== current
      ? latest
      : (next !== null && current !== null && next !== current ? next : null)
    const profileDir = dirname(findPatchPath(ctx))
    // 1) 升级前打包备份现有配置（patch / profile package.json / 插件清单）
    let backupDir = null
    try {
      if (current !== null) backupDir = backupProfileSnapshot(profileDir, current, ctx)
    } catch {}
    const hasUpdate = target !== null
    const steps = []
    let upgraded = false
    // 2) 自动升级框架：运行中的服务锁着 dsh/lib 目录（EBUSY 无法原地替换），
    //    因此生成独立升级脚本（kill 服务 → npm 升级 → 失败回滚 → 拉起服务），后台执行。
    //    与 /restart 同款自守护模式：端口无监听会自动拉起，不会留下"服务起不来"。
    if (hasUpdate && dshDir !== null) {
      const port = webPort(ctx)
      const nodePath = process.execPath
      const binPath = resolveDshBin()
      const npmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
      const corepackJs = join(dirname(process.execPath), 'node_modules', 'corepack', 'dist', 'corepack.js')
      // 预检（事故教训）：npm-cli.js / dsh bin.js 缺失时**拒绝生成升级脚本**（不 kill 服务）——
      // 避免"kill 后升级/拉起双双失败，服务永久 down"
      if (!existsSync(npmCli) || binPath === null || !existsSync(binPath)) {
        steps.push(`升级已取消：无法定位 ${!existsSync(npmCli) ? 'npm-cli.js' : 'dsh bin.js'}（框架安装可能不完整），服务保持运行；请先修复框架再升级`)
        sendJson(res, 200, { ok: true, current, latest, next, target, hasUpdate, upgraded: false, backupDir, steps, hints: steps })
        return
      }
      const profileDir2 = profileDir
      // 官方配套包列表（profile package.json 里的 @deepseek-ai/* 依赖）
      let officialList = ''
      try {
        const profilePkg = JSON.parse(readFileSync(join(profileDir2, 'package.json'), 'utf8'))
        const deps = { ...(profilePkg.dependencies ?? {}), ...(profilePkg.devDependencies ?? {}) }
        officialList = Object.keys(deps).filter((d) => d.startsWith('@deepseek-ai/')).map((d) => `'${d}'`).join(' ')
      } catch {}
      const rollbackDir = backupDir !== null ? join(backupDir, 'dsh-package-backup') : null
      // 备份 dsh 目录（回滚点）
      try {
        if (rollbackDir !== null) {
          mkdirSync(rollbackDir, { recursive: true })
          copyTree(dshDir, rollbackDir)
        }
      } catch {}
      const ps1 = join(tmpdir(), `dsh-fw-upgrade-${process.pid}.ps1`)
      const logFile = join(dshHome(), 'plugin-console', 'fw-upgrade.log')
      try { mkdirSync(dirname(logFile), { recursive: true }) } catch {}
      const lines = [
        `$log = ${JSON.stringify(logFile)}`,
        "function Log($m) { try { Add-Content -Path $log -Value ((Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + ' ' + $m) -Encoding UTF8 } catch {} }",
        "Log '框架升级脚本启动'",
        'Start-Sleep -Seconds 2',
        `Stop-Process -Id ${process.pid} -Force -ErrorAction SilentlyContinue`,
        "Log '服务已停止'",
        'Start-Sleep -Seconds 3',
        `Log '升级框架本体 ${current} -> ${target}…'`,
        `& ${JSON.stringify(nodePath)} ${JSON.stringify(npmCli)} install '@deepseek-ai/dsh@${target}' --no-audit --no-fund --registry https://registry.npmmirror.com`,
        'if ($LASTEXITCODE -ne 0) {',
        "  Log '升级失败，回滚框架本体…'",
        `  Remove-Item ${JSON.stringify(dshDir)} -Recurse -Force -ErrorAction SilentlyContinue`,
        `  Copy-Item ${JSON.stringify(rollbackDir)} ${JSON.stringify(dshDir)} -Recurse -Force`,
        "  Log '回滚完成'",
        '} else { Log \'框架本体升级完成\' }',
        officialList !== '' ? `Log '更新官方配套包…'\n  if (Test-Path ${JSON.stringify(corepackJs)}) { & ${JSON.stringify(nodePath)} ${JSON.stringify(corepackJs)} pnpm update ${officialList} --no-optional; Log '官方配套包更新结束（exit=' + $LASTEXITCODE + '）' }` : '',
        "Log '拉起 DSH 服务…'",
        '$ok = $false',
        `for ($i = 0; $i -lt 20; $i++) {`,
        `  try { $c = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue; if ($c.Count -gt 0) { $ok = $true; break } } catch {}`,
        `  if (-not $ok) { if (Test-Path ${JSON.stringify(binPath)}) { Start-Process -FilePath ${JSON.stringify(nodePath)} -ArgumentList ${JSON.stringify(binPath)},'web' -WindowStyle Hidden } else { Log 'bin.js 缺失，跳过拉起' } }`,
        '  Start-Sleep -Seconds 5',
        '}',
        `if ($ok) { Log '服务已监听 ${port}，升级完成' } else { Log '拉起失败：请手动运行 node ${binPath} web（参考本日志排查）' }`,
      ].filter((l) => l !== '').join('\r\n')
      writeFile(ps1, lines, 'utf8').then(
        () => execFile('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-File', ps1], { windowsHide: true }, () => {}),
        () => {},
      )
      upgraded = true
      steps.push(`框架升级脚本已启动：${current} → ${target}（服务将自动停止→升级→回滚保护→拉起，约 1-3 分钟，期间页面会断开）`)
      steps.push(`升级前配置已打包：${backupDir ?? '（跳过）'}；框架本体回滚点：${rollbackDir ?? '（跳过）'}`)
    } else if (!hasUpdate) {
      steps.push('当前已是最新版本，无需升级')
    }
    // 4) 配置移植说明：cordis.patch.yml / bundles 位于 profile（升级不触碰），天然保留；
    //    重启后框架适配逻辑自动备份新版本快照 + 重打补丁
    const hints = [
      `现有配置已打包备份：${backupDir ?? '（跳过）'}。升级不触碰 profile 配置（cordis.patch.yml / bundles 天然保留）。`,
      ...steps,
      '升级完成后请重启 DSH 服务生效——重启后 Hub 自动：备份新版本配置快照、重打框架补丁（issue #5 容错）、给出适配提示。',
      '官方配套组件（@deepseek-ai/*）随框架一起升级，请勿在市场单独更新。',
    ]
    sendJson(res, 200, { ok: true, current, latest, next, target, hasUpdate, upgraded, backupDir, steps, hints })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/install`) {
    // repo 允许为空：纯 registry 更新（已安装插件的"检测更新"走此路径，无 git 兜底）
    const rawRepo = typeof body.repo === 'string' ? body.repo.trim() : ''
    let repo = ''
    if (rawRepo !== '') {
      try { repo = githubRepoInfo(rawRepo) } catch {}
    }
    const givenName = typeof body.packageName === 'string' ? body.packageName.trim() : ''
    // 框架本体拦截：deepseek-harness 仓库与其根包 @deepseek-ai/dsh-root 是 DSH 框架自身，
    // 作为插件安装会试图构建整个框架源码——直接拒绝并提示
    if (repo === 'deepseek-ai/deepseek-harness'
      || givenName === '@deepseek-ai/dsh-root'
      || givenName === '@deepseek-ai/dsh') {
      sendError(res, 400, 'deepseek-harness 是 DSH 框架本体，不是插件——无需安装（升级请用官方 dsh 升级方式）')
      return
    }
    const kind = body.kind === 'skill' ? 'skill' : body.kind === 'suite' ? 'suite' : 'plugin'
    if ((kind === 'skill' || kind === 'suite') && repo === '') {
      sendError(res, 400, `${kind === 'skill' ? '技能' : '套装'}安装必须提供仓库（owner/name）`)
      return
    }
    const source = body.source === 'gitee' ? body.source : 'github'
    const npmNamePattern = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u
    if (givenName !== '' && (!npmNamePattern.test(givenName) || givenName.length > 214)) {
      sendError(res, 400, 'packageName 不是合法的 npm 包名')
      return
    }
    const job = {
      id: `job-${installJobSeq += 1}`,
      repo,
      source,
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
      kind,
    }
    installJobs.set(job.id, job)
    // 后台执行：请求立即返回，安装不受客户端断开/离开面板影响
    void (kind === 'skill' ? runSkillInstallJob(job, ctx) : kind === 'suite' ? runSuiteInstallJob(job, ctx) : runInstallJob(job, ctx))
    sendJson(res, 200, { ok: true, jobId: job.id, status: 'installing', kind })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/skill-remove`) {
    // 删除已安装技能：仅接受 kebab-case 名称（防目录穿越），删除 ~/.dsh/skills/<name>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.startsWith('.')) {
      // 点号开头是系统/隐藏技能根（如 .system，dsh-skill-filesystem 保留目录）：禁止删除
      sendError(res, 403, `技能 ${name} 属于系统/隐藏技能，禁止删除（保留 DSH 自带技能）`)
      return
    }
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/u.test(name)) {
      sendError(res, 400, '技能名称无效（仅允许 kebab-case）')
      return
    }
    const dest = join(dshHome(), 'skills', name)
    if (!existsSync(dest)) {
      sendError(res, 404, `技能 ${name} 不存在`)
      return
    }
    try {
      rmSync(dest, { recursive: true, force: true })
      sendJson(res, 200, { ok: true, name })
    } catch (error) {
      sendError(res, 500, `删除技能失败：${error instanceof Error ? error.message : String(error)}`)
    }
    return
  }

  if (pathname === `${ROUTE_PREFIX}/skill-toggle`) {
    // 停用/启用技能：写入官方调用策略 frontmatter（disable-model-invocation / user-invocable），
    // 可逆（原始内容备份于技能目录 .dsh-skill-fm.bak）；系统/隐藏技能禁止停用（保护机制）。
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (name.startsWith('.')) {
      // 点号开头是系统/隐藏技能根（如 .system，dsh-skill-filesystem 保留目录）：禁止停用
      sendError(res, 403, `技能 ${name} 属于系统/隐藏技能，禁止停用（保留 DSH 自带技能）`)
      return
    }
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/u.test(name)) {
      sendError(res, 400, '技能名称无效（仅允许 kebab-case）')
      return
    }
    const dest = join(dshHome(), 'skills', name)
    let skillFile = join(dest, 'SKILL.md')
    if (!existsSync(skillFile)) {
      // 平铺技能（<name>.md）
      const flat = `${dest}.md`
      if (existsSync(flat)) skillFile = flat
      else {
        sendError(res, 404, `技能 ${name} 不存在`)
        return
      }
    }
    const enabled = body.enabled === true
    try {
      setSkillEnabled(skillFile, enabled)
      sendJson(res, 200, { ok: true, name, enabled, skillFile })
    } catch (error) {
      sendError(res, 500, `${enabled ? '启用' : '停用'}技能失败：${error instanceof Error ? error.message : String(error)}`)
    }
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

  if (pathname === `${ROUTE_PREFIX}/ai-consent`) {
    const jobId = typeof body.jobId === 'string' ? body.jobId : ''
    const approved = body.approved === true
    const job = installJobs.get(jobId)
    if (!job) {
      sendError(res, 404, '没有这个安装任务')
      return
    }
    if (job.stage !== 'ai-consent' || typeof job.aiWait?.then !== 'function') {
      sendError(res, 400, '该任务不在等待 AI 授权状态')
      return
    }
    const resolver = job.aiPending?.resolver
    job.aiWait = null
    job.aiPending = null
    if (typeof resolver === 'function') resolver({ approved })
    sendJson(res, 200, { ok: true, jobId, approved })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/restart`) {
    // 自带守护的自杀式重启：分离脚本杀掉本进程后，若端口无人监听则自动拉起服务。
    // 不再依赖桌面端监督器（它并不总是会重启服务，曾导致用户需要重启电脑）。
    // 安全护栏（事故教训）：无法定位 dsh bin 或 bin.js 不存在时**拒绝重启**——
    // 避免"kill 后拉不起"（框架缓存损坏时常见），提示先修复框架安装。
    const port = webPort(ctx)
    const binPath = resolveDshBin()
    const nodePath = process.execPath
    if (binPath === null || !existsSync(binPath)) {
      sendError(res, 500, `无法定位 DSH 启动入口（bin.js${binPath !== null ? `：${binPath}` : ''}），已取消重启——框架安装可能已损坏，请先修复 @deepseek-ai/dsh 后再重启`)
      return
    }
    if (process.platform === 'win32') {
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
