/**
 * 构建静态插件索引：嗅探 GitHub `dsh-plugin` topic 仓库 → marketplace/index.json。
 *
 * 数据拉取（本机沙箱禁止 node spawn gh 时的推荐方式）：
 *   gh api --paginate "search/repositories?q=topic:dsh-plugin&sort=stars&order=desc&per_page=100" > raw.json
 *   node scripts/build-index.cjs --input raw.json [--limit 500]
 * 无 --input 时尝试直接用 gh CLI 拉取。
 *
 * 产物：marketplace/index.json（提交到仓库，经 jsDelivr CDN 分发，终端零 GitHub API 调用）
 */
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const fs = require('node:fs')
const path = require('node:path')

const execFileAsync = promisify(execFile)

async function ghJson(args) {
  const { stdout } = await execFileAsync('gh', ['api', '--paginate', ...args, '--jq', '.'], {
    timeout: 120000,
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  })
  return JSON.parse(stdout)
}

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) || 500 : 500
  const inputArg = process.argv.find((a) => a.startsWith('--input='))
  const inputFile = inputArg ? inputArg.split('=')[1] : null

  let items = []
  if (inputFile) {
    // 外部已拉取的数据文件（gh api --paginate 输出：JSON 数组）
    console.log(`读取数据文件 ${inputFile}…`)
    const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
    items = Array.isArray(raw) ? raw : (raw.items ?? [])
  } else {
    console.log('拉取 dsh-plugin topic 仓库（gh CLI）…')
    try {
      const data = await ghJson([
        'search/repositories',
        '--method', 'GET',
        '-f', 'q=topic:dsh-plugin in:name,description,topics',
        '-f', 'sort=stars',
        '-f', 'order=desc',
        '-f', 'per_page=100',
      ])
      items = Array.isArray(data) ? data : (data.items ?? [])
    } catch (error) {
      console.error('搜索失败：' + error.message)
      process.exit(1)
    }
  }

  const seen = new Set()
  const normalized = []
  for (const item of items) {
    const fullName = String(item.full_name ?? '').trim()
    if (!fullName || seen.has(fullName)) continue
    seen.add(fullName)
    normalized.push({
      fullName,
      description: item.description ?? '',
      htmlUrl: item.html_url ?? `https://github.com/${fullName}`,
      stars: item.stargazers_count ?? 0,
      updatedAt: item.updated_at ?? '',
      defaultBranch: item.default_branch ?? 'main',
      topics: Array.isArray(item.topics) ? item.topics : [],
    })
    if (normalized.length >= limit) break
  }

  const out = {
    generatedAt: new Date().toISOString(),
    count: normalized.length,
    items: normalized,
  }
  const dir = path.join(__dirname, '..', 'marketplace')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'index.json')
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(`已生成 ${file}：${normalized.length} 个插件（限制 ${limit}）`)
}

main().catch((error) => { console.error(error); process.exit(1) })
