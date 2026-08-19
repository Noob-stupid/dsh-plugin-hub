/**
 * 构建静态插件/技能索引：嗅探 GitHub topic 仓库 → marketplace/index.json。
 *
 * 插件模式（默认）：topic:dsh-plugin，按 star 排序，限制 --limit（默认 500）
 * 技能模式：--skills，合并 topic:agent-skills + topic:claude-skills + topic:dsh-skill，
 *   写入 index.json 的 skills 段（保留已有 items 段），限制 --limit（默认 300）
 *
 * 数据拉取（本机沙箱禁止 node spawn gh 时的推荐方式）：
 *   gh api --paginate "search/repositories?q=topic:dsh-plugin&sort=stars&order=desc&per_page=100" > raw.json
 *   node scripts/build-index.cjs --input raw.json [--limit 500]
 * 无 --input 时尝试直接用 gh CLI 拉取（GitHub Actions 中预装 gh 且已认证）。
 *
 * 产物：marketplace/index.json（提交到仓库，经 jsDelivr CDN 分发，终端零 GitHub API 调用）
 */
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const fs = require('node:fs')
const path = require('node:path')

const execFileAsync = promisify(execFile)

const SKILL_TOPICS = ['agent-skills', 'claude-skills', 'dsh-skill']

// gh api search 单对象响应，--paginate 拼接后不是合法 JSON，改手动分页循环
async function ghSearchRepos(query, limit) {
  const all = []
  let page = 1
  const perPage = Math.min(100, limit)
  while (all.length < limit) {
    const { stdout } = await execFileAsync('gh', [
      'api',
      'search/repositories',
      '--method', 'GET',
      '-f', 'q=' + query,
      '-f', 'sort=stars',
      '-f', 'order=desc',
      '-f', `per_page=${perPage}`,
      '-f', `page=${page}`,
      '--jq', '.items',
    ], {
      timeout: 120000,
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
    })
    const batch = JSON.parse(stdout)
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    page += 1
  }
  return all
}

function normalizeRepo(item) {
  const fullName = String(item.full_name ?? '').trim()
  if (!fullName) return null
  return {
    fullName,
    description: item.description ?? '',
    htmlUrl: item.html_url ?? `https://github.com/${fullName}`,
    stars: item.stargazers_count ?? 0,
    updatedAt: item.updated_at ?? '',
    defaultBranch: item.default_branch ?? 'main',
    topics: Array.isArray(item.topics) ? item.topics : [],
  }
}

function readExisting(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return {}
  }
}

async function main() {
  const skillsMode = process.argv.includes('--skills')
  const limitArg = process.argv.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) || (skillsMode ? 300 : 500) : (skillsMode ? 300 : 500)
  const inputArg = process.argv.find((a) => a.startsWith('--input='))
  const inputFile = inputArg ? inputArg.split('=')[1] : null

  const dir = path.join(__dirname, '..', 'marketplace')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'index.json')

  let items = []
  if (skillsMode) {
    console.log(`拉取技能 topic 仓库（${SKILL_TOPICS.join(' + ')}，gh CLI，自动分页）…`)
    try {
      const raw = inputFile ? JSON.parse(fs.readFileSync(inputFile, 'utf8')) : null
      if (raw) {
        items = Array.isArray(raw) ? raw : (raw.items ?? [])
      } else {
        for (const topic of SKILL_TOPICS) {
          const batch = await ghSearchRepos(`topic:${topic} in:name,description,topics`, limit)
          items.push(...batch)
        }
      }
    } catch (error) {
      console.error('技能搜索失败：' + error.message)
      process.exit(1)
    }
  } else if (inputFile) {
    // 外部已拉取的数据文件（gh api --paginate 输出：JSON 数组）
    console.log(`读取数据文件 ${inputFile}…`)
    const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'))
    items = Array.isArray(raw) ? raw : (raw.items ?? [])
  } else {
    console.log('拉取 dsh-plugin topic 仓库（gh CLI，自动分页）…')
    try {
      items = await ghSearchRepos('topic:dsh-plugin in:name,description,topics', limit)
    } catch (error) {
      console.error('搜索失败：' + error.message)
      process.exit(1)
    }
  }

  const seen = new Set()
  const normalized = []
  for (const item of items) {
    const norm = normalizeRepo(item)
    if (!norm || seen.has(norm.fullName)) continue
    seen.add(norm.fullName)
    if (skillsMode) {
      norm.skillTopics = SKILL_TOPICS.filter((t) => norm.topics.includes(t))
    }
    normalized.push(norm)
    if (normalized.length >= limit) break
  }

  const existing = readExisting(file)
  const out = {
    generatedAt: new Date().toISOString(),
    count: existing.count ?? 0,
    items: existing.items ?? [],
    skills: existing.skills ?? [],
  }
  if (skillsMode) {
    out.skills = normalized
    out.skillCount = normalized.length
  } else {
    out.items = normalized
    out.count = normalized.length
  }
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(`已更新 ${file}：${skillsMode ? '技能 ' + normalized.length : '插件 ' + normalized.length}（限制 ${limit}）`)
}

main().catch((error) => { console.error(error); process.exit(1) })
