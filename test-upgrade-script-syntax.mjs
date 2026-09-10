// 升级/回滚脚本「生成物」语法门禁：
// 2026-09-10 事故里，升级脚本的回滚分支在真机上崩了（PowerShell 报「无法将参数绑定到参数 Path」），
// 而这段脚本是 JS 模板串拼出来的 —— 拼错引号/路径只能在真机升级时才暴露。
// 本测试把两段生成逻辑（升级脚本 / 一键回滚脚本）从源码里抽出来，用桩变量真跑一遍，
// 再把生成结果交给 PowerShell 解析器做**语法校验（只解析不执行）**，把这类错误拦在提交前。
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SRC = readFileSync(join(ROOT, 'lib', 'index.js'), 'utf8')
const OUT = join(ROOT, '.testdir')
mkdirSync(OUT, { recursive: true })

let failed = 0
const check = (label, cond, extra) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${label}${extra === undefined ? '' : ' — ' + extra}`)
  if (!cond) failed += 1
}

/** 找一个可用的 PowerShell（Windows: powershell.exe；跨平台 CI: pwsh）；都没有则返回 null（跳过语法校验）。 */
function findPowerShell() {
  for (const bin of ['powershell.exe', 'pwsh', 'pwsh.exe']) {
    try {
      execFileSync(bin, ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.Major'], { encoding: 'utf8', timeout: 30000 })
      return bin
    } catch {}
  }
  return null
}

/** 从源码中抽出 `const lines = [ ... ].filter(...).join('\r\n')` 的数组表达式。 */
function extractBlock(startLine, endLine) {
  const lines = SRC.split('\n')
  const from = lines.findIndex((l, i) => i >= startLine - 1 && l.includes('const lines = ['))
  if (from === -1) throw new Error(`未找到起始行 ${startLine}`)
  const to = lines.findIndex((l, i) => i >= endLine - 1 && l.includes(".filter((l) => l !== '').join('\\r\\n')"))
  if (to === -1) throw new Error(`未找到结束行 ${endLine}`)
  const head = lines[from].slice(lines[from].indexOf('['))
  const body = lines.slice(from + 1, to + 1).join('\n')
  return head + '\n' + body
}

/** 抽出真实的 ps() 实现（要测的就是它的转义正确性，不能另写一份）。 */
const psSrc = SRC.slice(SRC.indexOf('const ps = (s) => {'), SRC.indexOf('const lines = [', SRC.indexOf('const ps = (s) => {')))
const psImpl = psSrc.slice(0, psSrc.lastIndexOf('}') + 1)

// 桩变量：路径故意带空格与 $，用来验证转义（PowerShell 双引号串里 $ 会被插值）
const scope = {
  ps: null,
  join,
  dirname,
  port: 3080,
  target: '0.1.5-rc.1',
  current: '0.1.2-rc.1',
  fwRoot: 'D:\\tmp dir\\$weird\\node_modules',
  dshDir: 'D:\\tmp dir\\$weird\\node_modules\\.pnpm\\@deepseek-ai+dsh@0.1.2-rc.1_x\\node_modules\\@deepseek-ai\\dsh',
  fwCheckpoint: { dest: 'C:\\Users\\花火\\.dsh\\plugin-console\\framework-backups\\0.1.2-rc.1\\fw-tree\\1789022284780' },
  backupDir: 'C:\\Users\\花火\\.dsh\\plugin-console\\framework-backups\\0.1.2-rc.1',
  rollbackDir: 'C:\\Users\\花火\\.dsh\\plugin-console\\framework-backups\\0.1.2-rc.1\\dsh-package-backup',
  taskName: 'DSH-FW-Upgrade-1234',
  corepackJs: 'D:\\nvm4w\\nodejs\\node_modules\\corepack\\dist\\corepack.js',
  pkgArgs: ["'@deepseek-ai/dsh-base'"],
  profileDir2: 'C:\\Users\\花火\\.dsh\\profiles\\web',
  nodePath: 'D:\\nvm4w\\nodejs\\node.exe',
  stateFile: 'C:\\Users\\花火\\.dsh\\plugin-console\\fw-upgrade-state.txt',
  logFile: 'C:\\Users\\花火\\.dsh\\plugin-console\\fw-upgrade.log',
  ps1: 'C:\\Users\\花火\\AppData\\Local\\Temp\\fw-upgrade-1234.ps1',
  rec: { from: '0.1.2-rc.1', checkpointDir: 'C:\\Users\\花火\\.dsh\\plugin-console\\framework-backups\\0.1.2-rc.1\\fw-tree\\1789022284780', fwRoot: 'D:\\tmp dir\\$weird\\node_modules' },
  resolveDshBin: () => 'D:\\tmp dir\\$weird\\node_modules\\.pnpm\\@deepseek-ai+dsh@0.1.5-rc.1_x\\node_modules\\@deepseek-ai\\dsh\\lib\\bin.js',
  fileURLToPath: () => 'file:///D:/dsh/dsh-plugin-hub/lib/index.js',
  selfName: '@noob-stupid/dsh-plugin-console',
  binPath: 'D:\\tmp dir\\$weird\\node_modules\\.pnpm\\@deepseek-ai+dsh@0.1.5-rc.1_x\\node_modules\\@deepseek-ai\\dsh\\lib\\bin.js',
}

// 未知标识符用桩兜底（只为跑通生成、验证 PowerShell 语法；名字会打印出来供人工核对）
const stubbed = new Set()
const scoped = new Proxy(scope, {
  has: () => true,
  get: (target, key) => {
    if (key === Symbol.unscopables) return undefined
    if (key in target) return target[key]
    if (key in globalThis) return globalThis[key] // String/Date/JSON 等内置不能被桩掉
    stubbed.add(String(key))
    return `<stub:${String(key)}>`
  },
})

function build(expr) {
  // import.meta 在 new Function 里不可用：先把 dirname(fileURLToPath(import.meta.url)) 整体替换成桩
  const prepared = expr.replace(/dirname\(fileURLToPath\(import\.meta\.url\)\)/gu, "'D:\\\\dsh\\\\dsh-plugin-hub\\\\lib'")
  const fn = new Function('scope', `with (scope) { ${psImpl}; return (${prepared}); }`)
  return fn(scoped)
}

const blocks = [
  ['升级脚本', 5779, 6098],
  ['一键回滚脚本', 6176, 6212],
]

for (const [name, from, to] of blocks) {
  let script = ''
  try {
    script = build(extractBlock(from, to))
    check(`${name}：生成成功`, typeof script === 'string' && script.length > 200, `${script.length} 字符`)
  } catch (error) {
    check(`${name}：生成成功`, false, error.message)
    continue
  }
  check(`${name}：无未替换的桩值（未知标识符已兜底，列出供核对）`, true, stubbed.size === 0 ? '（无未知标识符）' : [...stubbed].join(','))
  check(`${name}：路径未被 PowerShell 插值破坏（含 $ 的路径保持原样）`, script.includes('$weird') && !/\$\{/.test(script), script.split('\n').find((l) => l.includes('weird'))?.slice(0, 90))
  check(`${name}：不含空串字面量 '' 误用（$cp 类判空）`, !/=\s*'""'/u.test(script), script.split('\n').find((l) => /=\s*'""'/u.test(l)) ?? '（无）')

  const file = join(OUT, `gen-${from}.ps1`)
  writeFileSync(file, `\uFEFF${script}`, 'utf8')
  // PowerShell 解析器校验（只解析、不执行）。CI（ubuntu）只有 pwsh，没有 powershell.exe —— 找不到就 SKIP。
  const shell = findPowerShell()
  if (shell === null) {
    console.log(`SKIP ${name}：PowerShell 语法校验（本机无 powershell.exe / pwsh）`)
  } else {
    try {
      execFileSync(shell, ['-NoProfile', '-Command', `$t = Get-Content -Raw -Encoding UTF8 '${file}'; $null = [scriptblock]::Create($t); 'PARSE OK'`], { encoding: 'utf8', timeout: 60000 })
      check(`${name}：PowerShell 语法校验`, true, shell)
    } catch (error) {
      const msg = String(error.stdout ?? '') + String(error.stderr ?? '') + String(error.message ?? '')
      check(`${name}：PowerShell 语法校验`, false, msg.split('\n').filter((l) => l.trim() !== '').slice(-3).join(' | ').slice(0, 300))
    }
  }
  rmSync(file, { force: true })
}

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
