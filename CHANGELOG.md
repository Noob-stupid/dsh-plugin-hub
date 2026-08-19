# Changelog

All notable changes to dsh-plugin-hub.

## v0.3 — Auto-collection CI + Skills support (unreleased)

- **自动收录 CI**：`.github/workflows/registry.yml` 每 6 小时重跑 `build-index`（也支持手动触发），
  自动提交刷新后的 `marketplace/index.json`——作者打上 `dsh-plugin` / `agent-skills` / `claude-skills` / `dsh-skill`
  标签后无需申请即可被收录；
- **Skills 支持**：
  - 索引新增技能段：`build-index.cjs --skills` 合并收录 `agent-skills` ∪ `claude-skills` ∪ `dsh-skill`（最多 300）；
  - 市场搜索框旁「插件 / 技能」双 tab 浏览技能库；
  - 技能一键安装：`git clone` → 复制 SKILL.md 及资源到 `~/.dsh/skills/<name>/`（frontmatter name 优先，
    SKILL.md 位于根或第一层子目录均可识别），不碰 npm、不写补丁、无需重启；
  - 类型识别新增「技能」徽标：搜索结果 / 详情 / 索引条目均自动检测 SKILL.md（raw 双通道竞速）；
  - `GET /plugin-console/skills-installed`：已安装技能清单，技能卡片显示「已装」；
- `build-index.cjs` 分页改为手动循环（`gh api --paginate` 对 search 单对象响应拼接后非法，CI/本地均可靠）。

## v0.2 — Static index market

- **静态插件索引**：嗅探 `dsh-plugin` topic 仓库生成 `marketplace/index.json`（按 star 500+ 个，
  jsDelivr CDN 分发）——终端市场浏览**零 GitHub API 调用、零限流**；
- **市场秒开**：`/market-index` 路由（CDN + 10 分钟宿主缓存）；GitHub 源空查询直接展示全量索引，
  分页浏览（每批 50 条）；
- **自动版本比对**：市场中已安装条目后台自动查 npm `dist-tags.latest`，卡片显示「更新 → vX」一键升级。

## v0.1 — Marketplace & plugin console foundation

- 插件管理面板：一键启用/停用（写用户补丁层，HMR 生效）、第三方插件列表、详情面板、基础设施保护；
- 多搜索源市场：GitHub 浏览器直连 + 服务端兜底、Gitee 仓库直装模式、自定义搜索源
  （URL 模板 + 请求头认证 + 私网 http）、多源汇总搜索（⊞）；
- ★ 官方筛选：可 `dsh plugin add` 直装（根包 `dsh.bundle` 官方 / 聚合仓库子包带 bundle）；
- 软件源管理：多 registry 主→备安装链、私有/内网源、删除保护；Gitee 登录（可选，仅提高限额）；
- 安装链：配置源 → curl 手动安装（node 网络黑洞兜底）→ git 通道 → EPERM 清理重试 →
  子包自动展开（聚合优先）→ 本地 AI 兜底（费用授权弹窗 + 不再提醒 + AI 兜底总开关）；
- 检测更新：curl 读 npm dist-tags + 子包配套检查（depsOutdated，防版本混搭冲突）；
- 框架层补丁：`cordis.patch.yml` 解析容错（issue #5，幂等脚本）；
- 安全：环回限定、自定义源白名单、AI 兜底零费用默认保障。
