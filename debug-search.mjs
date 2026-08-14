// 最小复现：同一进程内对比「直连 https.get」与「模块 githubRequest 路径」
import { pathToFileURL } from 'node:url'
import { request as httpsRequest } from 'node:https'

const mod = await import(pathToFileURL('C:/Users/花火/.dsh/profiles/web/node_modules/@deepseek-ai/dsh-plugin-console/lib/index.js').href)
const GITHUB_API = 'https://api.github.com'

// 1. 直连
async function direct() {
  const t0 = Date.now()
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent('dsh-plugin')}&sort=stars&order=desc&per_page=20`
  await new Promise((resolve) => {
    const req = httpsRequest(url, { method: 'GET', headers: { 'user-agent': 'dsh-plugin-console/0.1 (local dsh web instance)', accept: 'application/vnd.github+json' }, rejectUnauthorized: false }, (res) => {
      let d = ''
      res.on('data', (c) => { d += c })
      res.on('end', () => { console.log(`direct: ${res.statusCode} ${Date.now() - t0}ms ${d.length}B`); resolve() })
    })
    req.on('error', (e) => { console.log(`direct ERR: ${e.message} ${Date.now() - t0}ms`); resolve() })
    req.setTimeout(60000, () => { console.log(`direct TIMEOUT ${Date.now() - t0}ms`); req.destroy(new Error('t')); })
  })
}

// 2. 通过模块路由（模拟 harness 的调用链）
let capturedRoute = null
const fakeEntries = [
  { id: 'include', options: { name: 'cordis:include', group: true, config: { path: 'file:///C:/Users/%E8%8A%B1%E7%81%AB/.dsh/testdir/cordis.yml' } } },
  { id: 'include:schedule', options: { name: '@deepseek-ai/dsh-schedule' }, disabled: false, fiber: { state: 2 } },
]
mod.apply({
  loader: { entries: () => fakeEntries },
  webServer: { register: (route) => { capturedRoute = route; return () => {} } },
  effect: (fn) => { fn() },
})
const t0 = Date.now()
const res = { writeHead: (s, h) => { res.s = s }, end: (b) => { console.log(`module: ${res.s} ${Date.now() - t0}ms body=${String(b).slice(0, 120)}`) } }
const req = {
  method: 'POST',
  url: '/plugin-console/search',
  socket: { remoteAddress: '127.0.0.1' },
  signal: undefined,
  [Symbol.asyncIterator]() {
    const chunks = [Buffer.from(JSON.stringify({ q: '' }))]
    let i = 0
    return { next: async () => (i < chunks.length ? { value: chunks[i++], done: false } : { value: undefined, done: true }) }
  },
}
await capturedRoute.handler(req, res)
