# Changelog

All notable changes to dsh-plugin-hub.

## v0.3.10 — README 安装说明同步 npm 发布版

- README 中英：安装命令改为 `dsh plugin add @noob-stupid/dsh-plugin-console`（npm 路径），
  GitHub 源码安装保留为备选；
- marketplace/index.json：自身条目加 `name: @noob-stupid/dsh-plugin-console` 字段；
- 社区索引 PR：恢复 zhu1090093659/dsh-web-ui community 索引中的 dsh-plugin-hub 条目（#931）。

## v0.3.9 — npm 发布 + 框架升级检测修复

- **npm 发布**：包名 `@noob-stupid/dsh-plugin-console`（官方 scope `@deepseek-ai` 无权发布，注册自有 scope）；
  `dsh plugin --profile web add @noob-stupid/dsh-plugin-console` 官方路径安装；
- **框架升级检测修复**：客户端版本比较写死 `0.1.0-rc.N`，官方发布 `0.1.1-rc.2` 后解析为 -1 恒不显示升级——
  改为通用 semver 比较（maj/min/pat + rc 数字，正式版视为 rc.∞），支持跨 minor 升级；
- **GitHub release 检测与安装通道**：npm 上不存在的包（如面板自身旧名）从 GitHub release 检测/下载安装；
- **盒子实验验证**：安装前静态验证（包名/入口/bundle 引用），失败保留旧版本。

## v0.3.7 — 框架一键升级（pnpm 通道 + 黑框实时进度 + 在线安装）

- **框架一键升级**：deepseek-harness 卡片显示「框架升级 → vX」（latest 优先、相同时取 next 渠道），
  一键完成：备份配置与框架本体（回滚点）→ 在线安装（服务保持运行、页面不断）→ 版本校验 →
  自动重启生效；
- **实时进度**：升级弹出 `DSH-Upgrade` 窗口实时显示 pnpm 下载进度；面板进度卡片同步显示等待时长；
- **升级保护**：失败自动回滚（robocopy + 升级前校验回滚点）、版本校验防假成功、10 分钟硬超时、
  卡死检测（debug 日志无更新自动换 registry）、全局 trap 兜底、15 分钟残留状态清理、
  升级卡片终态关闭永久化；
- **pnpm 通道**：npm-cli.js 在 schtasks 任务环境启动即卡死（0 字节日志、网络请求都发不出）——
  升级改用 `corepack pnpm`（秒启动）+ 国内源 npmmirror + `dangerouslyAllowAllBuilds`
  （node-pty/koffi 原生模块正常编译）；
- **schtasks 环境适配**：cmd /c 原生重定向（PowerShell 重定向全失效）、start 独立窗口显示进度、
  运行时解析 bin.js（pnpm Junction 布局）、compat 检测插件目录兜底、客户端升级目标版本比较；
- 升级脚本：无引号 /tr、BOM、防桌面端误杀改名、重启任务自删、状态文件残留清理等累计 16+ 修复。

## v0.3.2 — 套装 bundle 安全策略（紧急修复）

- **bundle 自动装配默认跳过**：套装安装不再自动把 bundle 型插件写入 `dsh.profile.bundles`——第三方 bundle 需与当前 DSH 严格兼容（peer 依赖 / client inject / patch 语义），自动装配曾导致启动崩溃（`@dsh-external/dsh-super-injector` 案例）；现在跳过并给出官方装配指引（详情面板官方命令 / install.ps1）；
- **入口校验修复**：`packageEntryExists` 排除 `.d.ts` 与 `package.json` 自身（exports 的 `./package.json` 是合法导出但非运行时入口，曾导致校验恒过）；
- 预设 / 技能 / 普通插件装配不受影响；测试更新为「injector 安全跳过 + 双预设成功」ALL PASS。

## v0.3.1 — Suite install + official-install command

- **套装安装通道**：submodule 聚合仓库（如 `yjh051108/dsh-routing-suite`）一键装配——clone 套装 → 镜像逐个拉子模块 → 按类型装配：bundle 插件（构建产物缺失时自动拉 Release 预构建 tgz）/ 技能 / **agent 预设**（复制到 `~/.dsh/.agent-presets/`，预设优先于同名 npm 包）/ 普通插件；组件报告逐项展示；
- **安装链自动识别套装**：普通安装请求发现根 `.gitmodules` 自动转套装安装（不依赖前端标记）；
- **详情面板官方安装方式**：套装仓库显示纯命令（`git -c http.sslVerify=false clone --recurse-submodules` + `powershell -File install.ps1`，CMD/PowerShell 通用）+ 一键复制；浏览器直连查看时本地即时拼装；
- 「添加到本地」直接启动安装任务（服务端解析包名，黑洞期不再 40s 无反馈）；卡片/详情「套装」标签；
- `/repo` 元数据 3 秒超时降级（Promise.any 不再等最慢分支 41.5s）；SKILL.md 探测加 jsDelivr 快速通道；Release 下载支持 gh 绝对路径候选；
- 测试：`test-suite-install.mjs` 端到端（普通请求→自动转套装→injector bundle+双预设 ALL PASS）。

## v0.3 — Auto-collection CI + Skills support

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
