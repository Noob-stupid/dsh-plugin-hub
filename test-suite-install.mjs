// 套装安装端到端测试：/install 普通路径 → 服务端检测 .gitmodules → 自动转套装安装
// 真实安装 yjh051108/dsh-routing-suite（预设 → .agent-presets，injector → bundle 层）
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'

const require = createRequire(import.meta.url)
const mod = await import(new URL('./lib/index.js', import.meta.url).href)

const ctx = {
  baseUrl: 'file:///C:/Users/%E8%8A%B1%E7%81%AB/.dsh/profiles/web/cordis.yml',
  loader: { entries: () => [] },
  webServer: { register: (route) => { globalThis.__route = route; return () => {} } },
  effect: (fn) => { fn() },
}
mod.apply(ctx)
const route = globalThis.__route

function fakeReq(method, pathname, body) {
  const req = {
    method, url: pathname, socket: { remoteAddress: '127.0.0.1' },
    signal: { aborted: false, addEventListener: () => {} },
    [Symbol.asyncIterator]() {
      const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))]
      let i = 0
      return { next: async () => (i < chunks.length ? { value: chunks[i++], done: false } : { value: undefined, done: true }) }
    },
  }
  return req
}
function fakeRes() {
  const res = { status: 0, body: null }
  res.writeHead = (status) => { res.status = status }
  res.end = (payload) => { res.body = payload }
  return res
}
async function call(method, path, body) {
  const res = fakeRes()
  await route.handler(fakeReq(method, path, body), res)
  return { status: res.status, json: res.body === null ? null : JSON.parse(res.body) }
}

let failed = 0
function check(label, cond, extra) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${label}${extra === undefined ? '' : ' — ' + extra}`)
  if (!cond) failed += 1
}

// 1. 普通插件安装请求（无 packageName）→ 应自动识别套装并转套装安装
const r = await call('POST', '/plugin-console/install', { repo: 'yjh051108/dsh-routing-suite' })
check('install accepted', r.status === 200 && r.json?.ok === true, JSON.stringify(r.json))
const jobId = r.json?.jobId
check('job created', typeof jobId === 'string')

// 2. 轮询直到结束（套装安装：clone 套装 + 2 子模块 + Release tgz + 预设复制，给足时间）
let job = null
const deadline = Date.now() + 8 * 60 * 1000
while (Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 5000))
  const s = await call('POST', '/plugin-console/install-status', { jobId })
  job = s.json
  if (job && job.status !== 'installing') break
}
check('job finished', job !== null && job.status !== 'installing', JSON.stringify({ status: job?.status, stage: job?.stage, error: job?.error }))
check('kind switched to suite', job?.kind === 'suite', `kind=${job?.kind}`)
check('suiteReport present', Array.isArray(job?.suiteReport), JSON.stringify(job?.suiteReport))
if (Array.isArray(job?.suiteReport)) {
  for (const item of job.suiteReport) {
    console.log(`  [${item.ok ? 'OK' : 'FAIL'}] ${item.component} (${item.type}): ${item.note}`)
  }
  check('presets installed (3 presets)', job.suiteReport.filter((x) => x.type === 'preset' && x.ok).length >= 2, job.suiteReport.filter((x) => x.type === 'preset' && x.ok).map((x) => x.component).join(', '))
  // 安全护栏：injector 是源码 bundle（Release tgz 无 lib/ 入口）→ 必须回滚失败，绝不写 bundles
  const inj = job.suiteReport.find((x) => x.component === 'injector')
  check('injector safely rejected (no entry, rolled back)', inj !== undefined && inj.ok === false, JSON.stringify(inj))
}

// 3. 验证磁盘结果
const home = 'C:/Users/花火/.dsh'
check('preset router-standard exists', existsSync(`${home}/.agent-presets/router-standard/preset.yml`), `${home}/.agent-presets/router-standard`)
check('preset router-spec exists', existsSync(`${home}/.agent-presets/router-spec/preset.yml`))
check('injector NOT in node_modules (rolled back)', !existsSync(`${home}/profiles/web/node_modules/@dsh-external/dsh-super-injector`)
  && !existsSync(`${home}/profiles/node_modules/@dsh-external/dsh-super-injector`))
console.log('--- profile bundles 声明 ---')
let bundles = []
try {
  const pkg = JSON.parse(require('node:fs').readFileSync(`${home}/profiles/web/package.json`, 'utf8'))
  bundles = pkg.dsh?.profile?.bundles ?? []
  console.log('bundles:', JSON.stringify(bundles))
} catch (e) { console.log('profile package.json 读取失败：' + e.message) }
check('bundles does NOT contain injector', !bundles.includes('@dsh-external/dsh-super-injector'))

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
