// 场景模拟（issue #15）：npm 全局安装 dsh 时 ctx.baseUrl 落在框架安装树，
// resolvePackageJson(moduleName, frameworkBase, profileDir) 必须回退解出第三方包。
import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const src = fs.readFileSync(path.join(process.cwd(), 'lib', 'index.js'), 'utf8')
const start = src.indexOf('/** 包名归一')
const end = src.indexOf('/** 已加载插件的包元信息缓存')
if (start < 0 || end < 0) { console.error('markers not found'); process.exit(1) }
const sandbox = {
  console, String, JSON, Math,
  createRequire: (await import('node:module')).createRequire,
  existsSync: fs.existsSync,
  join: path.join,
  dirname: path.dirname,
  fileURLToPath,
}
vm.createContext(sandbox)
vm.runInContext(src.slice(start, end), sandbox)
const { resolvePackageJson } = sandbox

const frameworkBase = 'D:/node_cache/_npx/1e7f6d9597241db0/node_modules/@deepseek-ai/dsh' // 模拟全局 dsh 树
const profileDir = 'C:/Users/花火/.dsh/profiles/web'

const cases = [
  ['第三方: dsh-better-sidebar', 'dsh-better-sidebar'],
  ['第三方: @noob-stupid/dsh-plugin-console', '@noob-stupid/dsh-plugin-console'],
  ['全家桶: @linxin666/dsh-web-all/plugin-manager', '@linxin666/dsh-web-all/plugin-manager'],
  ['官方: @deepseek-ai/dsh-settings', '@deepseek-ai/dsh-settings'],
]
let fail = 0
for (const [label, name] of cases) {
  const noFallback = resolvePackageJson(name, frameworkBase, null)
  const withFallback = resolvePackageJson(name, frameworkBase, profileDir)
  const ok = withFallback !== null && withFallback.includes('dsh-plugin-hub')
    ? true // 第三方在 profile 下
    : withFallback !== null
  // 判定：官方包两种都能解；第三方必须依赖回退才能解
  const cond = name.startsWith('@deepseek-ai/')
    ? withFallback !== null
    : withFallback !== null && noFallback === null
  console.log(`${cond ? 'PASS' : 'FAIL'} ${label}: noFallback=${noFallback === null ? 'null' : path.basename(dirOf(noFallback))} withFallback=${withFallback === null ? 'null' : withFallback}`)
  if (!cond) fail += 1
}
function dirOf(p) { return path.dirname(p) }
console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`)
process.exit(fail === 0 ? 0 : 1)
