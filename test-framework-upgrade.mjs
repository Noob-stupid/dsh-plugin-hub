// 框架升级适配逻辑验证：备份快照 + 版本变化检测 + 补丁状态
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'

process.env.DSH_HOME = 'D:/dsh/.testdir/fw-home'
const home = process.env.DSH_HOME
await rm(home, { recursive: true, force: true })
// 模拟 profile
await mkdir(`${home}/profiles/web`, { recursive: true })
await writeFile(`${home}/profiles/web/cordis.patch.yml`, '- insert:\n    - id: x\n      name: \'x\'\n', 'utf8')
await writeFile(`${home}/profiles/web/package.json`, '{"name":"web","dsh":{"profile":{"bundles":["a"]}}}', 'utf8')
// 模拟已记录版本（旧版 rc.5 → 现在 rc.6 = 升级）
await mkdir(`${home}/plugin-console`, { recursive: true })
await writeFile(`${home}/plugin-console/framework-state.json`, JSON.stringify({ lastVersion: '0.1.0-rc.5', backupAt: 0 }), 'utf8')

const require = createRequire(import.meta.url)
const mod = await import(new URL('./lib/index.js', import.meta.url).href)

const fakeEntries = [
  { id: 'include', options: { name: 'cordis:include', group: true, config: { path: pathToFileURL(`${home}/profiles/web/cordis.yml`).href } } },
  { id: 'include:schedule', options: { name: '@deepseek-ai/dsh-schedule' }, disabled: false, fiber: { state: 2 } },
]
const ctx = {
  // baseUrl 用真实 profile（@deepseek-ai/dsh 从真实 node_modules 链解析出版本）；
  // DSH_HOME 已指到临时目录，备份/状态文件写临时位置，不污染真实环境
  baseUrl: 'file:///C:/Users/%E8%8A%B1%E7%81%AB/.dsh/profiles/web/cordis.yml',
  loader: { entries: () => fakeEntries },
  webServer: { register: (r) => { globalThis.__route = r; return () => {} } },
  effect: (fn) => { fn() },
}
mod.apply(ctx)
const route = globalThis.__route

function fakeReq(method, pathname, body) {
  const req = { method, url: pathname, socket: { remoteAddress: '127.0.0.1' }, signal: { aborted: false, addEventListener: () => {} }, [Symbol.asyncIterator]() { const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))]; let i = 0; return { next: async () => (i < chunks.length ? { value: chunks[i++], done: false } : { value: undefined, done: true }) } } }
  return req
}
function fakeRes() { const res = { status: 0, body: null }; res.writeHead = (s) => { res.status = s }; res.end = (p) => { res.body = p }; return res }
async function call(method, path, body) { const res = fakeRes(); await route.handler(fakeReq(method, path, body), res); return { status: res.status, json: res.body === null ? null : JSON.parse(res.body) } }

let failed = 0
function check(label, cond, extra) { console.log(`${cond ? 'PASS' : 'FAIL'} ${label}${extra === undefined ? '' : ' — ' + extra}`); if (!cond) failed += 1 }

// 1. state 返回 framework 字段（升级检测：rc.5 → 实际版本）
const r = await call('GET', '/plugin-console/state')
check('state 200', r.status === 200)
check('framework present', r.json?.framework !== null && typeof r.json?.framework?.version === 'string', JSON.stringify(r.json?.framework))
check('upgraded detected (rc.5 → current)', r.json?.framework?.upgraded === true, `from=${r.json?.framework?.from} to=${r.json?.framework?.version}`)
check('backup dir created', typeof r.json?.framework?.backupDir === 'string' && existsSync(`${home}/plugin-console/framework-backups/${r.json.framework.version}/cordis.patch.yml`), r.json?.framework?.backupDir)

// 2. 插件清单备份
const pluginsFile = `${home}/plugin-console/framework-backups/${r.json.framework.version}/plugins.json`
check('plugins.json backed up', existsSync(pluginsFile))

// 3. 第二次调用：版本未变 → upgraded=false
const r2 = await call('GET', '/plugin-console/state')
check('second call upgraded=false', r2.json?.framework?.upgraded === false, JSON.stringify(r2.json?.framework))

// 4. 状态文件已更新
const state = JSON.parse(await readFile(`${home}/plugin-console/framework-state.json`, 'utf8'))
check('state file updated', state.lastVersion === r.json.framework.version)

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
await rm(home, { recursive: true, force: true })
process.exit(failed === 0 ? 0 : 1)
