> **English**: [README.md](README.md) | **中文**: [README.zh.md](README.zh.md)

---

<img width="1170" height="609" alt="image" src="https://github.com/user-attachments/assets/b802d606-14ba-4151-9956-ff642ed12b0a" />

# DSH 插件中心（dsh-plugin-hub）

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
[![GitHub stars](https://img.shields.io/github/stars/Noob-stupid/dsh-plugin-hub?style=flat-square&logo=github)](https://github.com/Noob-stupid/dsh-plugin-hub/stargazers)
[![License](https://img.shields.io/github/license/Noob-stupid/dsh-plugin-hub?style=flat-square)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/Noob-stupid/dsh-plugin-hub?style=flat-square)](https://github.com/Noob-stupid/dsh-plugin-hub/commits/main)
[![Registry CI](https://img.shields.io/github/actions/workflow/status/Noob-stupid/dsh-plugin-hub/registry.yml?label=registry%20CI&style=flat-square)](https://github.com/Noob-stupid/dsh-plugin-hub/actions/workflows/registry.yml)
[![topic: dsh-plugin](https://img.shields.io/badge/topic-dsh_plugin-4D6BFE?style=flat-square)](https://github.com/topics/dsh-plugin)

给 DeepSeek Harness（DSH）Web 界面加上**插件管理面板**：一键启用/停用已安装插件，
在**多个搜索源**上浏览 dsh-plugin 插件项目（GitHub / Gitee / 自定义源），一键添加并启用——
并带一份 **CI 每 6 小时自动收录的静态插件/技能索引**。

<!-- TOC -->
- [核心优势](#核心优势)
- [一键部署](#一键部署)
- [使用方法](#使用方法)
- [功能](#功能)
- [原理](#原理)
- [兼容性策略](#兼容性策略)
- [项目结构](#项目结构)
- [HTTP 接口](#http-接口)
- [AI 兜底安装与授权弹窗](#ai-兜底安装与授权弹窗)
- [框架层补丁（cordis.patch.yml 解析容错）](#框架层补丁cordispatchyml-解析容错)
- [安全说明](#安全说明)
- [免责声明](#免责声明)
- [已知限制](#已知限制)
- [帮助 / Help](#帮助--help)
- [更新日志](#更新日志)
- [License](#license)
<!-- /TOC -->

---

## 核心优势

| | 优势 | 说明 |
|---|---|---|
| 🧩 | **插件 + 技能双市场** | 自动收录 `dsh-plugin` topic 仓库（按 star **500+**），另有**技能 tab**（`agent-skills` ∪ `claude-skills` ∪ `dsh-skill`，最多 300）——浏览、搜索、一键安装，零 GitHub API 调用 |
| 🤖 | **自动收录 CI** | GitHub Actions 每 6 小时自动重跑 `build-index`（也支持手动触发）；作者只需给自己的仓库打 `dsh-plugin` / `agent-skills` / `claude-skills` / `dsh-skill` 标签，**无需申请、无需审核** |
| ⚡ | **秒开、零限流** | 索引以静态 `marketplace/index.json` 提交仓库，经 jsDelivr CDN 分发（宿主 10 分钟缓存）——终端用户**零 GitHub API 调用、零限流** |
| 🔄 | **版本检测与一键更新** | 已安装条目自动比对 npm `dist-tags.latest`，卡片出现「更新 → vX」；聚合包子包版本不配套时给出 depsOutdated 提示，避免版本混搭启动冲突 |
| 🔀 | **多源检索** | GitHub / Gitee（仓库直装模式）/ 自定义搜索源（URL 模板 + 请求头认证 + 私网 http）；「⊞」并行合并 GitHub + 全部自定义源 |
| 🔒 | **安全默认** | 全部路由仅环回；AI 兜底置于明确费用授权弹窗之后；基础设施行禁止开关（受保护） |

> **给插件作者**：给仓库打上 `dsh-plugin` 标签即可被官方 [topic 列表](https://github.com/topics/dsh-plugin)
> 与本中心自动收录；技能类仓库请打 `agent-skills` / `claude-skills` / `dsh-skill`。

---

## 一键部署

### 方式一：官方命令（推荐）

插件声明了 `dsh.bundle` 官方清单，一条命令装好并自动启用：

```sh
dsh plugin --profile web add github:Noob-stupid/dsh-plugin-hub
```

卸载 / 重装（即更新）：

```sh
dsh plugin --profile web remove github:Noob-stupid/dsh-plugin-hub
dsh plugin --profile web add github:Noob-stupid/dsh-plugin-hub
```

然后重启 dsh 服务 → 刷新页面 → 设置 → 插件 → 插件管理。

### 方式二：部署脚本（网络受限时的兜底）

Windows（PowerShell）：

```powershell
git clone https://github.com/Noob-stupid/dsh-plugin-hub "$env:TEMP\dsh-plugin-console" 2>$null; & "$env:TEMP\dsh-plugin-console\deploy.ps1"
```

Linux / macOS：

```bash
git clone https://github.com/Noob-stupid/dsh-plugin-hub /tmp/dsh-plugin-console 2>/dev/null; bash /tmp/dsh-plugin-console/deploy.sh
```

脚本会做两件事：把插件包拷进 `$DSH_HOME/profiles/<profile>/node_modules/`，
并在 `cordis.patch.yml` 幂等追加启用条目。完成后：

1. 重启 dsh 服务（宿主代码变更需要重启进程；命令行方式重启进程，桌面客户端退出重开）；
2. 刷新页面 → 设置 → 插件 → **插件管理**。

### 方式三：一句话交给 AI

> 安装 DSH 插件中心（dsh-plugin-hub）：运行 `dsh plugin --profile web add github:Noob-stupid/dsh-plugin-hub`；若没有 dsh CLI，则克隆 https://github.com/Noob-stupid/dsh-plugin-hub 到 `~/.dsh/profiles/web/node_modules/`，在 `cordis.patch.yml` 注册（id: plugin-console，name: @deepseek-ai/dsh-plugin-console）。完成后重启 dsh web。

要求：DSH ≥ 0.1.0-rc.6（web profile，含 `dsh-client-modules` / `dsh-host-plugin-inventory`）。

---

## 使用方法

1. 重启 DSH → 打开 Web GUI → **设置 → 插件 → 插件管理**。
2. **已安装列表**：一键开关（HMR 约 1 秒生效）、按名称/id 搜索、展开详情（版本、仓库、README 摘要）。
3. **插件市场**：GitHub 源空查询直接打开静态索引（秒开）；输入关键词实时搜索。顶部登录标切换
   搜索源（GitHub / Gitee / 自定义）；「⊞」多源合并；「★」只看可 `dsh plugin add` 直装。
4. **技能 tab**：搜索框旁切换「插件 / 技能」，浏览并一键安装技能（克隆到 `~/.dsh/skills/<名称>/`）。
5. **安装**：点「添加到本地」→ 后台安装链自动执行（可放心离开页面）；已安装条目自动出现
   「检测更新」/「更新 → vX」。

---

## 功能

### 已安装插件（一键开关 + 详情）

- **默认只显示第三方插件**（后装/非 dsh 自带），带「第三方」标签与删除入口；点「全部」切换查看完整列表（1.5s 亮框反馈）；
- 列出全部插件条目（名称、加载状态、启用状态）；支持按名称/id 搜索；
- 点「停用」= 在用户补丁层写入 `- id: X` + `disabled: true`，HMR 立即生效；
- 点「启用」= 移除该停用条目；bundle 层本就停用的行用 `disabled: false` 覆盖；
- 打标「补丁停用 / 补丁强制启用」区分用户补丁状态；
- **基础设施保护**：host 传输/热加载/存储/设置链上的插件（timer、hmr、webserver 等
  70+ 行）标记「受保护」，禁止开关——误停用会破坏热加载本身；
- **详情面板**：每个插件可点「详情」，展开简介、版本、仓库/主页链接与 README 摘要；
- **版本检测**：「检测更新」走 curl 读 npm `dist-tags.latest`（node 网络黑洞时也可用），
  并提示需要同步的子包版本（depsOutdated），避免半更新混搭导致启动冲突。

### 插件市场（多搜索源）

- **搜索源切换**：点击顶部登录态标识弹出菜单，在 **GitHub / Gitee / 自定义源** 间切换（选择持久化）；
  市场标题、加载提示、搜索框占位符、说明行全部随源切换；
- **GitHub 源**：默认搜索 `dsh-plugin`，浏览器直连（失败自动回退服务端通道）；
- **Gitee 源**：Gitee 官方搜索 API 已停用，采用**仓库直装模式**——输入 `owner/repo`
  （支持中文路径与完整 URL）精确查找仓库并安装；
- **自定义搜索源**：软件源管理中添加（URL 模板含 `{q}`/`{page}` 占位符），支持
  **请求头认证**（如 `Authorization: Bearer ...`）与**本机/私网 http 地址**；
- **多源汇总**：搜索框旁「⊞」开启——GitHub + 全部自定义源并行检索，结果合并并标注来源；
- **★ 官方筛选**：只筛**可 `dsh plugin add` 直装**的插件——根包带 `dsh.bundle` 清单（官方）
  或聚合仓库中**子包带 `dsh.bundle`**（子包可直装）；标记由服务端 curl 双通道 + 客户端兜底补全，
  搜索结果与筛选即时可用；
- **类型徽标**：官方 / 聚合 / 技能（仓库含 SKILL.md）自动识别；
- 「添加到本地」= 按当前源安装（registry 失败自动回退 git 通道）+ 写入启用条目，HMR 生效。

### 静态索引市场（插件 / 技能双 tab）

- GitHub 源空查询展示**静态索引**（`marketplace/index.json`，jsDelivr CDN + 宿主 10 分钟缓存）：
  按 star 排序 500+ 插件，秒开、**零 GitHub API 调用**；
- 搜索框旁**「插件 / 技能」tab**：技能 tab 列出自动收录的 `agent-skills` ∪ `claude-skills` ∪
  `dsh-skill` 仓库（最多 300）；
- **自动版本比对**：市场中已安装的条目后台自动查 npm `dist-tags.latest`，卡片变「更新 → vX」；
- **技能安装**：技能条目一键安装 = git clone → 复制 SKILL.md 及同目录资源到
  `~/.dsh/skills/<名称>/`（frontmatter 的 name 优先于仓库名；SKILL.md 位于仓库根或第一层
  子目录均可识别）；已装技能显示灰色「已装」徽标。

### 软件源管理

市场标题行右侧悬浮「软件源」按钮（半透明、颜色加深），弹出管理模态框：

- **安装源（registry）**：添加 / 行内编辑 / 设为主源 / 恢复默认；支持私有源与内网地址；
  **删除已保护**（插件安装依赖的 npm 源，避免误删）；
- **搜索源**：内置 GitHub、Gitee + 自定义搜索源（增删、🔒 显示请求头数量）；
- **Gitee 登录（可选）**：直装模式无需登录；登录仅提高接口限额——创建第三方应用
  （gitee.com → 数据管理 → 第三方应用，权限勾选 user_info、projects）后填入
  client_id / client_secret → 保存 → 授权登录。

---

## 原理

### 开关语义

DSH 的 web profile 由 bundle 补丁层 + 用户补丁层（`$DSH_HOME/profiles/web/cordis.patch.yml`）
组合而成，补丁是**逐键覆盖**语义。插件开关只是往用户补丁层追加/移除两行 YAML：

```yaml
- id: 插件条目id
  disabled: true
```

配置文件监视器（HMR）会在保存后 1 秒内重组合，无需重启——除宿主代码本身变更外。

### 安装链

```
配置的软件源按主→备依次尝试（默认 npmmirror → npmjs）
  → curl 手动安装     （node 网络黑洞时：curl 下载 tarball 解压进 node_modules）
  → git 通道          （GitHub 走加速代理+直连，Gitee 走对应平台）
  → Windows EPERM 陈旧目录自动清理重试
  → 自动展开仓库子包  （聚合包优先）
  → 本地 AI 兜底      （置于明确费用授权弹窗之后）
```

技能安装独立走：`git clone --depth 1` → 复制 SKILL.md 资源到 `~/.dsh/skills/<名称>/`
（不碰 npm、不写补丁、无需重启）。

### 数据源

```
GitHub Actions（每 6 小时，仓库自带 token）
  └─ scripts/build-index.cjs：分页拉取 topic:dsh-plugin（按 star 500 个）+ 技能 topic（300 个）
       └─ 提交 marketplace/index.json 回 main
            └─ 宿主经 jsDelivr CDN 读取（10 分钟缓存）→ 市场秒开、零 API 调用
                 └─ 实时搜索仍走 GitHub 搜索 API（浏览器直连 + 服务端通道兜底）
```

### 版本检测与已安装识别

- **已安装识别**：按已装条目的 `repository` 字段或模块名与市场条目比对（仓库名 → 包名映射）；
- **版本检测**：`check-update` 走 curl 读 npm `dist-tags.latest`；聚合包额外对比子包
  声明版本 vs 本地实际版本（depsOutdated），防止半更新混搭导致启动冲突。

---

## 兼容性策略

- 当前支持 **DSH 0.1.0 系列**（`0.1.0-rc.6` 及同系列版本）。
- 面板会读取运行中的 `@deepseek-ai/dsh-web-app` 版本：官方发布破坏性升级
  （0.2 / 1.0 等）后，面板顶部会显示兼容性警告并给出本仓库地址，而不是默默失效。
- 官方破坏性更新可能改动的接口：补丁层语义、`webServer.register`、
  加载器条目结构、`dsh.client` bundle 格式、`settings.plugins.tab` 插槽。
  届时随官方版本更新本仓库即可（依赖面已收窄到上述几个点）。
- 部署脚本不校验版本、直接安装；面板里的警告是权威提示。

---

## 项目结构

```
lib/index.js       宿主端插件（/plugin-console/* 路由 + 补丁读写 + 多源检索 + 安装）
lib/client.js      浏览器端 bundle（ModuleLoader 格式，设置页 tab）
scripts/build-index.cjs        索引构建（插件 --limit 500 / 技能 --skills --limit 300）
scripts/apply-framework-patch.cjs   框架层补丁（issue #5，幂等，可重复应用）
.github/workflows/registry.yml 自动收录 CI（每 6 小时 + 手动触发）
marketplace/index.json         生成的静态索引（jsDelivr CDN 分发）
deploy.ps1 / deploy.sh   一键部署脚本（Windows / Linux·macOS）
test-harness.mjs   逻辑自检（state/toggle/校验/环回保护；搜索视网络环境 SKIP）
```
<img width="1878" height="945" alt="image" src="https://github.com/user-attachments/assets/b26f2f19-0ba4-4be7-9ca1-b3fd4c51a7a8" />

---

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

---

## AI 兜底安装与授权弹窗

安装走**确定性通道链**：`配置源（主→备）→ curl 手动安装 → git 通道 → EPERM 清理重试 → 仓库子包展开`。常规通道全部失败时，才轮到**本地 AI 兜底**。

**本地 AI 兜底是什么**：拉起一个本地 AI 子代理接管安装——它会像人工一样诊断（查仓库结构、识别子包/聚合包、清理残留），用正确管理器完成安装并落配置。**注意：这一步会调用 DeepSeek API 模型，可能产生 API 费用。**

**授权弹窗逻辑（费用透明）**：

1. 常规通道全失败后，任务进入「等待授权」状态，屏幕中央弹出**最上层模态框**：
   - 明确说明"将调用 DeepSeek API 模型，可能产生 API 费用"
   - 提供 **同意，继续** / **取消** 两个按钮（取消 = 零费用）
   - 10 分钟未决定自动取消
2. 模态框内可勾选 **"以后不再提醒"**（自动同意）——勾选后可随时在**插件市场页面最底部**恢复弹窗提醒
3. 右上角悬浮的 **"AI 兜底"开关**可彻底关闭该功能：常规通道失败将直接取消安装，**永远不会调用模型 API（零费用）**

---

## 框架层补丁（cordis.patch.yml 解析容错）

**问题（issue #5）**：`cordis.patch.yml` 若含顶格 `[]` 占位符 + 后续条目（两个 YAML 根节点），
DSH 启动时解析崩溃：`end of the stream or a document separator is expected`。

**修复位置**：DSH 框架 `dsh-app-boot` 的 `parsePatchList`——解析失败时自动移除顶格空数组占位行（视为 no-op）后重试；
正常文件、纯 `[]` 文件、缩进子数组均不受影响。

**应用方式**（DSH 升级后需重新执行，升级会覆盖框架文件）：

```bash
node scripts/apply-framework-patch.cjs
```

脚本自动定位 npx 缓存中的 `dsh-app-boot/lib/index.js`，检测到已补丁则跳过（幂等），首次应用会保留 `.bak-issue5` 备份。

---

## 安全说明

- 全部路由仅允许环回地址访问；
- GitHub 元数据只用于发现公开插件，npm 安装走 registry 的完整 TLS 校验；
- GitHub 源搜索在浏览器内直连；Gitee / 自定义源检索与请求头（含认证信息）仅经服务端处理，不下发浏览器；
- 自定义源地址仅允许 https 与本机/私网 http（127.0.0.1、localhost、10.x、192.168.x、172.16-31.x 等）；
- 技能是纯文件（SKILL.md + 资源）——安装技能**不会执行任何代码**；git clone 来自你选择的仓库，安装前请自行核验。

---

## 免责声明

- 市场收录的均为 GitHub 第三方仓库，各插件由各自作者独立开发维护，**与 DeepSeek Harness 及本插件中心无任何关联**；
- 本中心**不对任何插件的质量、可靠性、安全性、许可证合规性、兼容性作任何明示或默示担保**；收录**不构成推荐或背书**——安装即代表你已自行评估并接受相应风险，建议安装前阅读仓库源码与 README；
- 本中心按「现状」（AS-IS）提供，因安装或使用任何第三方插件造成的任何直接或间接损失（数据丢失、系统损坏、隐私泄露等），本中心及其开发者不承担任何责任。

---

## 已知限制

- 宿主代码变更需要**重启服务**（面板的重启按钮自带守护、安全）；客户端变更只需刷新页面；
- 实时 GitHub 搜索依赖 GitHub 可达性（浏览器直连 + 服务端兜底；网络黑洞期请稍后重试）；
- 版本检测只对已发布到 npm 的包生效；技能类仓库没有版本概念；
- 静态索引有上限（每次构建 500 插件 / 300 技能）；新仓库靠 star 爬升或等下一轮 6 小时 CI 进入索引；
- 技能由 `dsh-skill-filesystem` 扫描发现——若当前 profile 未启用该插件，装好的技能会休眠，启用并重启后生效。

---

## 帮助 / Help

遇到问题先看这里；仍有疑问请到 [Issues](https://github.com/Noob-stupid/dsh-plugin-hub/issues) 提问。

- **面板没出现**：重启 dsh 服务 → 刷新页面 → 设置 → 插件 → 插件管理。
- **点开关没反应**：基础设施行带"受保护"标签（禁止开关，这是保护机制）；普通插件开关经
  HMR 生效，约 1-3 秒，可点刷新查看。
- **顶部出现兼容性警告**：官方发布了破坏性更新，请到本仓库获取适配版本（见兼容性策略）。
- **市场搜索没结果/报错**：GitHub 源走浏览器直连（与浏览器可用性一致），失败自动回退
  服务端通道；Gitee 源为仓库直装模式（输入 `owner/repo`）；自定义源检查地址与请求头配置；
  网络黑洞期请稍后重试。
- **★ 筛选为空**：★ 只筛可 `dsh plugin add` 直装（官方 + 子包带 bundle 的聚合）；
  标记 1-3 秒后台补全后自动出现，不会误报"没有"。
- **安装失败**：确认仓库有 package.json 且包名已发布到 npm；npm 装不了的会回退
  `github:owner/repo` 安装（需要 git）；可在软件源管理中换主源（如 npmmirror 网络波动时）。
- **装好的技能 DSH 不识别**：在 profile 的 `cordis.yml` 启用 `@deepseek-ai/dsh-skill-filesystem`
  并重启；技能位于 `~/.dsh/skills/<名称>/`。

---

## 更新日志

版本记录见 [CHANGELOG.md](CHANGELOG.md)。

---

## License

MIT
