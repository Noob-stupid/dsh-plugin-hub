// 插件控制台宿主端逻辑验证（独立于运行中的服务）
// 模拟 cordis ctx（loader + webServer），驱动真实路由处理逻辑；
// GitHub 调用走真实网络（https 通道）。
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const pkgPath = new URL('./lib/index.js', import.meta.url).href
const mod = await import(pkgPath)

const PATCH = 'D:/dsh/.testdir/cordis.patch.yml'
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
await mkdir(dirname(PATCH), { recursive: true })
await writeFile(PATCH, '# test\n- insert:\n    - id: schedule\n      name: \'@deepseek-ai/dsh-schedule\'\n    - id: mcp-memory\n      name: \'@deepseek-ai/dsh-mcp-client\'\n')

// 模拟 loader 条目（include 前缀 + 若干行）
const fakeEntries = [
  { id: 'include', options: { name: 'cordis:include', group: true, config: { path: pathToFileURL('D:/dsh/.testdir/cordis.yml').href } } },
  { id: 'include:schedule', options: { name: '@deepseek-ai/dsh-schedule' }, disabled: false, fiber: { state: 2 } },
  { id: 'include:mcp-memory', options: { name: '@deepseek-ai/dsh-mcp-client' }, disabled: false, fiber: { state: 2 } },
  { id: 'include:tool-web', options: { name: '@deepseek-ai/dsh-tool-web' }, disabled: true, fiber: undefined },
  { id: 'include:plugin-console', options: { name: '@deepseek-ai/dsh-plugin-console' }, disabled: false, fiber: { state: 2 } },
  { id: 'include:llm', options: { name: '@deepseek-ai/dsh-llm' }, disabled: false, fiber: { state: 2 } },
]
const ctx = {
  baseUrl: 'file:///C:/Users/%E8%8A%B1%E7%81%AB/.dsh/profiles/web/cordis.yml',
  loader: {
    entries: () => fakeEntries,
  },
  webServer: {
    register: (route) => {
      globalThis.__route = route
      return () => {}
    },
  },
  effect: (fn) => { fn() },
}

mod.apply(ctx)
const route = globalThis.__route
if (!route || route.path !== '/plugin-console') throw new Error('route not registered')

function fakeReq(method, pathname, body) {
  const req = {
    method,
    url: pathname,
    socket: { remoteAddress: '127.0.0.1' },
    headers: { host: '127.0.0.1:3080' },
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
  const res = { status: 0, body: null, headers: null }
  res.writeHead = (status, headers) => { res.status = status; res.headers = headers }
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

// 1. state
let r = await call('GET', '/plugin-console/state')
check('state 200', r.status === 200, `status=${r.status}`)
check('state lists entries', r.json?.entries?.length === fakeEntries.length - 1, `count=${r.json?.entries?.length}`)
const sched = r.json.entries.find((e) => e.entryId === 'include:schedule')
check('state rowId resolution', sched?.rowId === 'schedule', JSON.stringify(sched?.rowId))
check('state tool-web disabled', r.json.entries.find((e) => e.entryId === 'include:tool-web')?.enabled === false)
check('state plugin-console not toggleable', r.json.entries.find((e) => e.entryId === 'include:plugin-console')?.toggleable === false)

// 2. toggle off (row id form)
r = await call('POST', '/plugin-console/toggle', { entryId: 'include:schedule', enabled: false })
check('toggle off ok', r.json?.ok === true && r.json?.rowId === 'schedule', JSON.stringify(r.json))
let patchText = await readFile(PATCH, 'utf8')
check('patch contains disable block', patchText.includes('- id: schedule\n  disabled: true'), patchText)

// 3. toggle on (re-enable)
r = await call('POST', '/plugin-console/toggle', { entryId: 'include:schedule', enabled: true })
check('toggle on ok', r.json?.ok === true && r.json?.changed === true, JSON.stringify(r.json))
patchText = await readFile(PATCH, 'utf8')
check('patch block removed', !patchText.includes('disabled: true'), patchText)

// 4. enable a bundle-disabled row (tool-web) → forced override
r = await call('POST', '/plugin-console/toggle', { entryId: 'include:tool-web', enabled: true })
check('toggle on bundle-disabled ok', r.json?.ok === true, JSON.stringify(r.json))
patchText = await readFile(PATCH, 'utf8')
check('forced-enable block appended', patchText.includes('- id: tool-web\n  disabled: false'), patchText)

// 5. toggle validation
r = await call('POST', '/plugin-console/toggle', { entryId: 'include:nope', enabled: true })
check('unknown entry 404', r.status === 404, `status=${r.status}`)
r = await call('POST', '/plugin-console/toggle', { entryId: 'include:plugin-console', enabled: false })
check('self-disable rejected', r.status === 400, `status=${r.status}`)
r = await call('POST', '/plugin-console/toggle', { entryId: 'include:llm', enabled: false })
check('protected infra rejected', r.status === 403, `status=${r.status}`)

// 5b. 插件详情（解析 profile store 中的真实 dsh-schedule 包）
r = await call('POST', '/plugin-console/details', { entryId: 'include:schedule' })
check('details ok', r.status === 200 && r.json?.ok === true, `status=${r.status} err=${r.json?.error ?? 'none'}`)
check('details meta resolved', typeof r.json?.meta?.name === 'string' && r.json.meta.version !== null, JSON.stringify(r.json?.meta?.name))
check('details readme summary', r.json?.readme !== null && typeof r.json?.readme?.summary === 'string', `title=${r.json?.readme?.title ?? 'none'}`)
r = await call('POST', '/plugin-console/details', { entryId: 'include:nope' })
check('details unknown 404', r.status === 404, `status=${r.status}`)

// 6. GitHub search（真实网络，走宿主端 https 兜底通道）
// 网络黑洞期会整段卡死，属环境问题而非逻辑问题：超时按 SKIP 计。
r = await call('POST', '/plugin-console/search', { q: '' })
if (r.status !== 200 && r.json?.error === 'GitHub 请求超时') {
  console.log('SKIP search — 当前网络处于黑洞期（GitHub 连接被环境卡死），浏览器直连通道不受影响')
} else {
  check('search ok', r.status === 200 && r.json?.ok === true, `status=${r.status} items=${r.json?.items?.length} err=${r.json?.error ?? 'none'}`)
}
if (r.json?.items?.length > 0) {
  const first = r.json.items[0]
  check('search has fields', typeof first.fullName === 'string' && typeof first.stars === 'number', JSON.stringify(first.fullName))
}

// 7. repo info
if (r.json?.items?.length > 0) {
  const repo = r.json.items[0].fullName
  r = await call('POST', '/plugin-console/repo', { repo })
  check('repo ok', r.status === 200 && r.json?.ok === true, `status=${r.status} pkg=${r.json?.packageName ?? 'null'}`)
}

// 8. 非环回拒绝
const res = fakeRes()
const req = fakeReq('GET', '/plugin-console/state')
req.socket.remoteAddress = '10.0.0.5'
await route.handler(req, res)
check('non-loopback rejected', res.status === 403, `status=${res.status}`)

  // 9. 跨站写请求拒绝（issue #9：Origin/Sec-Fetch-Site 校验）
  const originRes = fakeRes()
  const originReq = fakeReq('POST', '/plugin-console/toggle', { entryId: 'include:schedule', enabled: false })
  originReq.headers = { host: '127.0.0.1:3080', origin: 'https://evil.example' }
  await route.handler(originReq, originRes)
  check('cross-origin POST rejected', originRes.status === 403, `status=${originRes.status}`)

  const siteRes = fakeRes()
  const siteReq = fakeReq('POST', '/plugin-console/toggle', { entryId: 'include:schedule', enabled: false })
  siteReq.headers = { host: '127.0.0.1:3080', 'sec-fetch-site': 'cross-site' }
  await route.handler(siteReq, siteRes)
  check('cross-site POST rejected', siteRes.status === 403, `status=${siteRes.status}`)

  const hostRes = fakeRes()
  const hostReq = fakeReq('GET', '/plugin-console/state')
  hostReq.headers = { host: 'evil.example' }
  await route.handler(hostReq, hostRes)
  check('bad Host rejected', hostRes.status === 403, `status=${hostRes.status}`)


console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
