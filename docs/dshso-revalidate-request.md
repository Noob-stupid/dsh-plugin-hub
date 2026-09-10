# dsh.so 重新采集 / 复核请求 —— dsh-plugin-hub

> 用途：`https://www.dsh.so/zh/artifact/dsh-plugin-hub/` 的信任等级为**银**，唯一未通过的信任因子是「低风险已验证」（自动审查判中风险）。
> 本文分三部分：① 可直接粘贴的 issue 正文；② 更短的邮件版；③ 完整证据附录（内部留档，不必全部贴给对方）。
> 渠道：`github.com/dsh-so/dsh-plugin-submissions`（issues 可用）· `/zh/submit/` · `hello@dsh.so`

---

## ① 可直接粘贴的 issue 正文

**标题**：重新采集 + 复核请求：dsh-plugin-hub（审查工件停在 v0.3.24-beta.2 / 站点数据停在 08-25）

dsh.so 团队，你好：

我是 `Noob-stupid/dsh-plugin-hub`（npm：`@noob-stupid/dsh-plugin-console`）的维护者。当前 artifact 页显示 **信任：银 / 风险：中风险**，信任因子中唯一未通过的是「低风险已验证」，其余（MIT、持续维护、安全审计已完成、L3、L4）均通过。请求重新采集与复核，理由如下：

### 1. 安全审查绑定的是一份 8 月 31 日的测试版工件

页面记载：`插件版本 0.3.24-beta.2`、`被测插件工件 github · …#v0.3.24-beta.2`、`扫描版本 c11eef73376a`、`当前版本 db7d9c4bc6a5`。核对本仓库提交历史：

| 站点字段 | 对应提交 | 日期 |
|---|---|---|
| 扫描版本 `c11eef73376a` | `c11eef7 release: bump v0.3.24-beta.2` | 2026-08-31 |
| 当前版本 `db7d9c4bc6a5` | `db7d9c4 docs: …` | **2026-08-16** |

当前实际情况：

- 最新正式版 **v0.3.32**（npm `@noob-stupid/dsh-plugin-console@0.3.32`，2026-09-09 发布；GitHub tag + Release `v0.3.32`）
- 仓库 **2026-08-25 以来 134 个提交**；站点「速览」仍显示 Stars ★70 / Forks 5 / Updated 08-25，实际为 **★81 / Forks 8 / pushed 2026-09-10**
- 因此站点当前给出的安装命令是 `dsh plugin --profile web add github:Noob-stupid/dsh-plugin-hub#v0.3.24-beta.2` —— **照此安装会装到 8 月底的 beta 版**，建议更新为当前正式版或去掉 tag

### 2. 风险报告中的行号在当前代码里对不上

| 报告条目 | 当前 0.3.32 的实际情况 |
|---|---|
| `high R3 index.js:3040 直接访问 process.kill` | 全文件仅一处 `process.kill`，位于**第 3708 行**的 `processAlive()`：`process.kill(Number(pid), 0)` —— **signal 0 只探测进程是否存在，不发送任何信号、不终止任何进程** |
| `medium R9 index.js:316 / 318 循环内集合写入 map.set` | 这两行现在是 semver 范围匹配函数，**没有 map.set** |
| `medium R11 index.js:385 / 393 删除文件操作 rmSync(?)` | 这两行现在是框架兼容检查函数，**没有 rmSync** |

可见报告描述的是旧文件结构，请对当前工件重扫并核对行号归属。

### 3. 中风险命中的能力是「插件管理器」的设计必需

- **fs.write**：写 profile 的 `cordis.patch.yml`（启用/停用插件）、`~/.dsh/plugin-console/*`（软件源配置、组件记录、任务状态）、把插件安装进 profile 的 `node_modules`
- **network.external**：GitHub API / raw、npm registry（含用户自配的内网私服）、静态索引 CDN —— 端点全部由用户在「软件源 / 索引源 / Git 源 / 搜索源」中配置，插件不内置任何硬编码回传地址
- **env**：读 `DSH_HOME`、`LOCALAPPDATA` 等以定位安装位置
- **破坏性命令**：`taskkill.exe /PID <记录的组件 PID> /F` 只用于「停止组件」（重启服务走计划任务 + `Stop-Process`）；全库 23 处 `rmSync` 全部落在安装/卸载/升级/清理流程内——临时克隆目录、下载缓存、被替换的旧目录、框架升级备份快照，以及两处**用户主动触发且有路径校验**的删除（删除技能、删除已落地仓库）
- **无 `preinstall` / `postinstall` 脚本**：`package.json` 仅有一个 `prepublishOnly`（发布前 BOM 自检）

### 4. 具体请求

1. 重新采集仓库元数据（Stars / Forks / 最近提交 / 最新版本 / 安装命令）；
2. 对当前工件（npm 0.3.32）重跑 vet，并核实行号归属；
3. 对 `process.kill(pid, 0)`（signal-0 存活探测）与临时目录清理两类 finding 做人工复核；
4. 如「低风险」有可满足的判定口径（例如提交能力声明清单 / `SECURITY.md` / 权限白名单），请告知标准，我们按标准整改。

需要任何材料（L4/L5 本机实测日志、测试套件输出、能力清单）我随时提供。

谢谢！

—— @Noob-stupid

---

## ② 邮件版（发 `hello@dsh.so`，更短）

主题：请求重新采集与复核 dsh-plugin-hub —— 审查工件停在 v0.3.24-beta.2，站点数据停在 08-25

dsh.so 团队，你好：

`Noob-stupid/dsh-plugin-hub`（npm `@noob-stupid/dsh-plugin-console`）的 artifact 页现在信任为「银」，唯一未通过的信任因子是「低风险已验证」（自动审查判中风险）。请求重新采集与复核：

1. **审查绑定的是 8/31 的测试版**：页面记的扫描版本 `c11eef73376a` = 本仓库 2026-08-31 的提交 `release: bump v0.3.24-beta.2`；站点「当前版本 db7d9c4bc6a5」是 2026-08-16 的提交。现在最新正式版是 **v0.3.32**（2026-09-09 发布），08-25 以来 134 个提交，Stars ★70→81、Forks 5→8。站点给出的安装命令仍带 `#v0.3.24-beta.2`，照装会装到旧 beta。
2. **风险报告行号对不上当前代码**：报告说 `index.js:3040` 直接访问 `process.kill`，而当前唯一的 `process.kill` 在第 3708 行、形式是 `process.kill(pid, 0)`（signal 0 存活探测，不杀进程）；报告说 `316/318` 是循环内 `map.set`、`385/393` 是 `rmSync`，当前这几行分别是 semver 范围匹配与框架兼容检查。
3. **中风险命中的是插件管理器的本职能力**：写 `cordis.patch.yml` 与插件目录、访问 GitHub/npm（含用户自配内网源）、读环境变量定位安装位置、用 `taskkill` 停止/重启服务、清理临时目录；**无 preinstall/postinstall 脚本**，外联端点全部由用户配置。

请协助：① 重新采集仓库元数据并更新安装命令；② 对当前工件重跑 vet；③ 对 signal-0 存活探测与临时目录清理做人工复核；④ 如「低风险」有可满足的标准，请告知，我们按标准整改。

—— @Noob-stupid

---

## ③ 证据附录（内部留档）

### A. 页面抓取快照（2026-09-09 抓取 `https://www.dsh.so/zh/artifact/dsh-plugin-hub/`）

信任因子区块原文：

```
✓ 许可证：MIT
✓ 持续维护
✓ 安全审计: 已完成 · 中风险
✗ 低风险已验证
✓ 安装规范已验证 (L3)
✓ 沙盒安装已测 (L4)
信任度：银 — 已通过安全审计，验证级别 ≥L2。
```

验证区块（L1–L5 均通过，按 dsh 版本归档）：

- `dsh 0.1.3-alpha.1`（当前）：L1 由 L3 推定 / L2 由 L3 推定 / L3 安装规范 / L4 安装已测 / **L5 运行已测（已验证，签发 2026-09-07，有效至 2026-09-14）**
- `dsh 0.1.2-rc.1`：同上，标注"待复测"
- `dsh 0.1.2-alpha.1`：同上，标注"待复测"

安全报告区块原文：

```
DSH.SO VET  MEDIUM  c11eef
安全审查：自动审查 · 每日更新 → MEDIUM
vet 判定为可疑（suspicious）：存在需人工复核的发现（外联端点、删除文件等）。
0 严重 · 1 高 · 21 中
版本绑定：插件版本 0.3.24-beta.2 / 扫描版本 c11eef73376a（2026-09-07） / 当前版本 db7d9c4bc6a5
vet 判定：suspicious · npm
```

风险详情（页面仅展示前 5 条）：

```
high   R3   index.js:3040   直接访问 process.kill
medium R9   index.js:316    循环内集合写入 map.set（无界增长信号）
medium R9   index.js:318    循环内集合写入 map.set（无界增长信号）
medium R11  index.js:385    删除文件操作：rmSync(?)
medium R11  index.js:393    删除文件操作：rmSync(?)
```

### B. 站点公开标准（`/zh/security/`）

- 扫描范围：硬编码密钥 · 可疑权限（fs.write / network.external / env 访问）· 破坏性命令 · 外传端点 · 未锁定依赖 · 安装脚本 · 供应链风险
- 等级定义：**低风险 = 无已知漏洞或可疑发现**；中风险 = 存在中等发现；严重 = 严重漏洞或密钥泄露
- 站点自述：静态启发式分析、非人工审计、"复杂上下文可能漏判、偶有误报"

→ 结论：只要命中任意一条 medium（本插件必然有 fs.write / network.external / env），等级即为中风险，「低风险已验证」这一信任因子无法通过自动扫描满足；因此第 ④ 项请求（索取可满足的判定口径）是拿到金级的关键。

### C. 事实核对表（2026-09-09）

| 项 | 站点显示 | 实际 |
|---|---|---|
| 插件版本 | 0.3.24-beta.2 | **0.3.32**（npm 2026-09-09 发布） |
| 最新提交 | Updated 08-25 | pushed 2026-09-10（08-25 起 134 个提交） |
| Stars / Forks | ★70 / 5 | ★81 / 8 |
| 安装命令 | `…#v0.3.24-beta.2` | `dsh plugin --profile web add github:Noob-stupid/dsh-plugin-hub`（或 `@noob-stupid/dsh-plugin-console`） |
| 扫描工件 | git `c11eef7`（08-31） | tag `v0.3.32`（09-09） |
| L5 | 已验证（通过） | — |

### D. 可提供的补充材料

- 本机 8 套测试套件输出（compat-gate / skill-toggle / harness / framework-upgrade / bundle-guard / issue15-resolve / suite-install / registry-scan）
- 能力与护栏清单（仅环回访问、Host 校验、同源写保护、git 非交互、写路径白名单、无 postinstall）——如需可作为 `SECURITY.md` 补充进仓库
