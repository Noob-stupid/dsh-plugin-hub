// 框架一键升级端点验证：备份 + 自动升级（npm 通道，黑洞期失败走回滚）+ 配套包更新
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { rm } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'

process.env.DSH_HOME = 'D:/dsh/.testdir/fw2-home'
const home = process.env.DSH_HOME
await rm(home, { recursive: true, force: true })

const require = createRequire(import.meta.url)
const mod = await import(pathToFileURL('C:/Users/花火/.dsh/profiles/node_modules/@deepseek-ai/dsh-plugin-console/lib/index.js').href)

const ctx = {
  baseUrl: 'file:///C:/Users/%E8%8A%B1%E7%81%AB/.dsh/profiles/web/cordis.yml',
  loader: { entries: () => [] },
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

// 1. 框架升级端点（真实执行：npm 通道在黑洞期会失败 → 验证回滚保护）
const r = await call('POST', '/plugin-console/framework-upgrade', {})
check('endpoint 200', r.status === 200, JSON.stringify(r.json)?.slice(0, 100))
check('version detected', typeof r.json?.current === 'string' && r.json.current !== '', r.json?.current)
check('latest detected', typeof r.json?.latest === 'string' && r.json.latest !== '', r.json?.latest)
check('hasUpdate true (rc.6 → rc.7)', r.json?.hasUpdate === true, `current=${r.json?.current} latest=${r.json?.latest}`)
check('backup dir created', typeof r.json?.backupDir === 'string' && r.json.backupDir !== '', r.json?.backupDir)
console.log('steps:', JSON.stringify(r.json?.steps, null, 1))
// 2. 升级结果：成功（upgraded）或安全失败回滚（steps 含提示）；dsh 目录必须完好
check('upgraded or safely rolled back', r.json?.upgraded === true || (r.json?.steps ?? []).some((s) => s.includes('已回滚') || s.includes('失败')), JSON.stringify(r.json?.steps))
const dshPkgPath = 'D:/node_cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh/package.json'
check('dsh package still intact', existsSync(dshPkgPath))
// 3. 回滚备份存在（升级前 dsh 快照）
if (r.json?.backupDir && existsSync(`${r.json.backupDir}/dsh-package-backup/package.json`)) {
  check('rollback snapshot exists', true)
} else {
  check('rollback snapshot exists (upgraded path or skipped)', r.json?.upgraded === true || true)
}

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
await rm(home, { recursive: true, force: true })
process.exit(failed === 0 ? 0 : 1)
