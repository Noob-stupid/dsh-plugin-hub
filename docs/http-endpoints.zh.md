## HTTP 接口

| 接口 | 方法 | 说明 |
|---|---|---|
| `/plugin-console/state` | GET | 插件清单 + 补丁状态 + 兼容性 + 运行中的安装任务 |
| `/plugin-console/toggle` | POST | 启用/停用条目（写用户补丁层） |
| `/plugin-console/uninstall` | POST | 删除条目并卸载包（bundle 感知） |
| `/plugin-console/search` | POST | 多源搜索（github/gitee/自定义，`multi` 合并） |
| `/plugin-console/repo` | POST | 仓库元数据：package.json、private 根、dsh 提示、**hasSkill** |
| `/plugin-console/enrich` | POST | 服务端类型标记（官方/聚合/技能） |
| `/plugin-console/install` | POST | 安装（插件或 `kind: skill` 技能），返回任务 id |
| `/plugin-console/install-status` | POST | 轮询安装任务 |
| `/plugin-console/check-update` | POST | npm 最新版本 + 子包不配套检查 |
| `/plugin-console/market-index` | POST | 静态索引（jsDelivr CDN，10 分钟缓存） |
| `/plugin-console/skills-installed` | GET | `~/.dsh/skills` 下已安装技能 |
| `/plugin-console/sources` | GET/POST | 软件源与搜索源管理、Gitee OAuth 配置 |
| `/plugin-console/gitee-oauth-url` / `gitee-oauth-callback` | GET | Gitee OAuth 流程 |
| `/plugin-console/ai-consent` | POST | 同意/取消 AI 兜底步骤 |
| `/plugin-console/restart` | POST | 自带守护的安全自重启（等同面板按钮） |
| `/plugin-console/framework-upgrade` | POST | 框架一键升级（全树 checkpoint → 在线安装 → 全树回滚保护） |
| `/plugin-console/framework-rollback` | POST | 一键回滚到升级前版本（停服 → 全树恢复 → 自动拉起 → 健康检测） |
| `/plugin-console/self-update` | POST | 控制台自身一键更新（npm 最新 tarball 到当前 profile） |
| `/plugin-console/ai-empower/plan` / `status` / `run` / `cancel` | POST | AI 赋能：规划（含框架适配预检）→ 状态轮询 → 确认执行 → 取消 |
| `/plugin-console/components` / `component/start` / `stop` / `status` | GET/POST | 服务器组件清单与启动/停止/状态 |
