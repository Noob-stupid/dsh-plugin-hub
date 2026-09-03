主题：请求重新验证 dsh-plugin-hub —— L5 误报「未声明 dsh.bundle」+ 数据陈旧（Updated 08-25）

dsh.so 团队，你好：

我是 dsh-plugin-hub（GitHub: Noob-stupid/dsh-plugin-hub）的维护者。贵站 artifact 页当前显示：
- 信任度：银（说明「已通过安全审计，验证级别 ≥L2」）
- L5 · 未定论，检查项提示「未声明 dsh.bundle」
- 速览 Updated 08-25

请求贵站**重新扫描并复测 L5**，原因如下：

1. **dsh.bundle 声明是存在的**（L2 也已识别「插件层组件（已声明 dsh.bundle.patch）」）：
   仓库 `package.json` 与 npm 正式版（@noob-stupid/dsh-plugin-console@0.3.24）均为：
   ```json
   "dsh": {
     "bundle": { "patch": "./cordis.patch.yml" },
     "client": { "platform": "web", "inject": [...] }
   }
   ```
   与贵站收录的 @linxin666/dsh-web-ui-all 完全同格式。L5 的「未声明 dsh.bundle」应为语义误报。

2. **数据已过期**：仓库自 08-25 以来有大量提交（AI 赋能正式版 v0.3.24、社区规范文件、README 重构等，09-01 累计 30+ 提交）；页面仍显示 Updated 08-25 / Stars ★70（当前 ★73+）。另外仓库已补充 `master` 分支（= main），旧分支读取问题已排除。

3. **复测建议**：以 main 分支 HEAD（当前 commit 806eb2c / 最新 207f030）重新执行 L4/L5 沙盒验证；bundle 检查请读取 package.json 的 `dsh.bundle.*` 字段。

我会持续关注贵站刷新结果；如需我提供任何材料（L4 本机实测日志、测试套件输出），随时回复。

谢谢！

—— @Noob-stupid（Noob-stupid，dsh-plugin-hub 维护者）
