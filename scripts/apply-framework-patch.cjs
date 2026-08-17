/**
 * 框架层补丁：dsh-app-boot 的 cordis.patch.yml 解析容错（议题 #5）。
 *
 * 问题：cordis.patch.yml 若含顶格 `[]` 占位符 + 后续条目（两个 YAML 根节点），
 * DSH 启动时 parsePatchList 解析崩溃（"end of the stream or a document separator is expected"）。
 *
 * 修复：parsePatchList 解析失败时，自动移除顶格空数组占位行（视为 no-op）后重试。
 *
 * 用法：node scripts/apply-framework-patch.cjs
 * 说明：DSH 升级（npx 重新拉取）后框架文件会被覆盖，重新运行本脚本即可。
 */
const fs = require('node:fs')
const path = require('node:path')

// 定位 @deepseek-ai/dsh-app-boot（与 @deepseek-ai/dsh 同级）
function locateAppBoot() {
  try {
    const dshPkg = require.resolve('@deepseek-ai/dsh/package.json')
    const aiDir = path.dirname(dshPkg) // .../node_modules/@deepseek-ai
    const candidate = path.join(aiDir, 'dsh-app-boot', 'lib', 'index.js')
    if (fs.existsSync(candidate)) return candidate
  } catch {}
  // 兜底：扫描常见 npx 缓存
  const roots = [path.join(process.env.USERPROFILE || '', '.dsh'), process.env.DSH_HOME || ''].filter(Boolean)
  for (const root of roots) {
    const p = path.join(root, '..')
    void p
  }
  const cacheRoots = [
    process.env.NODE_CACHE || '',
    'D:\\node_cache\\_npx',
    path.join(process.env.USERPROFILE || '', '.npm', '_npx'),
    path.join(process.env.LOCALAPPDATA || '', 'node_cache', '_npx'),
  ].filter(Boolean)
  for (const root of cacheRoots) {
    if (!fs.existsSync(root)) continue
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const candidate = path.join(root, entry.name, 'node_modules', '@deepseek-ai', 'dsh-app-boot', 'lib', 'index.js')
      if (fs.existsSync(candidate)) return candidate
    }
  }
  return null
}

const MARKER = 'tryDropEmptyArrayPlaceholder'
const OLD = `function parsePatchList(binName, file, content, label) {
	let parsed;
	try {
		parsed = yaml.load(content, { schema: userPatchesSchema });
	} catch (error) {
		throw new Error(\`${'${binName}'}: failed to parse ${'${label}'} ${'${file}'}: ${'${String(error)}'}\`);
	}`
const NEW = `function parsePatchList(binName, file, content, label) {
	let parsed;
	try {
		parsed = yaml.load(content, { schema: userPatchesSchema });
	} catch (error) {
		// 容错（issue #5）：文件可能是「[] 空数组占位符 + 后续条目」两个根节点，
		// YAML 解析必然失败。移除顶层空数组占位行（视为 no-op）后重试。
		const retried = tryDropEmptyArrayPlaceholder(content);
		if (retried !== null) {
			try {
				parsed = yaml.load(retried, { schema: userPatchesSchema });
			} catch {
				throw new Error(\`${'${binName}'}: failed to parse ${'${label}'} ${'${file}'}: ${'${String(error)}'}\`);
			}
		} else {
			throw new Error(\`${'${binName}'}: failed to parse ${'${label}'} ${'${file}'}: ${'${String(error)}'}\`);
		}
	}`

const HELPER = `
/**
 * 容错辅助（issue #5）：若文件含顶格空数组占位行（\`[]\` / \`[ ]\`，可带行尾注释），
 * 视为 no-op 全部移除；无此模式返回 null。
 */
function tryDropEmptyArrayPlaceholder(content) {
	const lines = String(content).split("\\n");
	const kept = [];
	let dropped = false;
	for (const line of lines) {
		if (/^\\[\\s*\\]\\s*(?:#.*)?$/u.test(line)) {
			dropped = true;
			continue;
		}
		kept.push(line);
	}
	if (!dropped) return null;
	return kept.join("\\n");
}
`

function main() {
  const target = locateAppBoot()
  if (!target) {
    console.error('未找到 @deepseek-ai/dsh-app-boot/lib/index.js，请确认 DSH 已安装（或手动指定路径）')
    process.exit(1)
  }
  const source = fs.readFileSync(target, 'utf8')
  if (source.includes(MARKER)) {
    console.log('已打过补丁，跳过：' + target)
    return
  }
  if (!source.includes('function parsePatchList')) {
    console.error('未找到 parsePatchList（框架版本可能已变更），跳过。' + target)
    process.exit(1)
  }
  fs.copyFileSync(target, target + '.bak-issue5')
  const next = source.replace(OLD, NEW) + HELPER
  fs.writeFileSync(target, next, 'utf8')
  console.log('补丁已应用：' + target)
  console.log('备份：' + target + '.bak-issue5')
}

main()
