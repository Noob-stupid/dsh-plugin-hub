
<img width="1170" height="609" alt="image" src="https://github.com/user-attachments/assets/b802d606-14ba-4151-9956-ff642ed12b0a" />

# DSH 插件中心（dsh-plugin-hub）

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

给 DeepSeek Harness（DSH）Web 界面加上**插件管理面板**：一键启用/停用已安装插件，
并直接在 **GitHub 上浏览 dsh-plugin 插件项目**，一键添加并启用。

- 宿主端：环回 HTTP 路由（state / toggle / search / repo / install），直接读写
  profile 用户补丁层 `cordis.patch.yml`，由 DSH 的 HMR 自动生效；
- 浏览器端：设置 → 插件 → **插件管理** tab（开关列表 + GitHub 插件市场）；
- 插件市场走**浏览器直连 GitHub**（你的浏览器能打开 GitHub，市场就能用；
  打不开时自动回退到服务端通道）。

## 一键部署

### 方式一：官方命令（推荐）

插件声明了 `dsh.bundle` 官方清单，一条命令装好并自动启用：

```sh
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

要求：DSH ≥ 0.1.0-rc.6（web profile，含 `dsh-client-modules` / `dsh-host-plugin-inventory`）。

## 功能

### 已安装插件（一键开关 + 详情）

- 列出全部插件条目（名称、加载状态、启用状态）；
- 点「停用」= 在用户补丁层写入 `- id: X` + `disabled: true`，HMR 立即生效；
- 点「启用」= 移除该停用条目；bundle 层本就停用的行用 `disabled: false` 覆盖；
- 打标「补丁停用 / 补丁强制启用」区分用户补丁状态；
- **基础设施保护**：host 传输/热加载/存储/设置链上的插件（timer、hmr、webserver 等
  70+ 行）标记「受保护」，禁止开关——误停用会破坏热加载本身；
- **详情面板**：每个插件可点「详情」，展开简介、版本、仓库/主页链接与 README
  摘要（读取插件包自带的 README，说明它的作用）。

### 插件市场（GitHub）

- 默认搜索 `dsh-plugin`（与 GitHub 网页搜索 `https://github.com/search?q=dsh-plugin&type=repositories` 一致）；
- 查看仓库的 npm 包名、DSH 插件特征提示与 **README 摘要**（浏览器直连 GitHub，说明插件作用）；
- 「添加并启用」= npm 安装该包到 profile（registry 失败自动回退 `github:owner/repo`）
  + 写入启用条目，HMR 生效。

## 原理

DSH 的 web profile 由 bundle 补丁层 + 用户补丁层（`$DSH_HOME/profiles/web/cordis.patch.yml`）
组合而成，补丁是**逐键覆盖**语义。插件开关只是往用户补丁层追加/移除两行 YAML：

```yaml
- id: 插件条目id
  disabled: true
```

配置文件监视器（HMR）会在保存后 1 秒内重组合，无需重启——除宿主代码本身变更外。

## 兼容性策略

- 当前支持 **DSH 0.1.0 系列**（`0.1.0-rc.6` 及同系列版本）。
- 面板会读取运行中的 `@deepseek-ai/dsh-web-app` 版本：官方发布破坏性升级
  （0.2 / 1.0 等）后，面板顶部会显示兼容性警告并给出本仓库地址，而不是默默失效。
- 官方破坏性更新可能改动的接口：补丁层语义、`webServer.register`、
  加载器条目结构、`dsh.client` bundle 格式、`settings.plugins.tab` 插槽。
  届时随官方版本更新本仓库即可（依赖面已收窄到上述几个点）。
- 部署脚本不校验版本、直接安装；面板里的警告是权威提示。

## 项目结构

```
lib/index.js       宿主端插件（/plugin-console/* 路由 + 补丁读写 + npm 安装）
lib/client.js      浏览器端 bundle（ModuleLoader 格式，设置页 tab）
deploy.ps1 / deploy.sh   一键部署脚本（Windows / Linux·macOS）
test-harness.mjs   逻辑自检（state/toggle/校验/环回保护；搜索视网络环境 SKIP）
```

## 安全说明

- 全部路由仅允许环回地址访问；
- GitHub 元数据只用于发现公开插件，npm 安装走 registry 的完整 TLS 校验；
- 插件市场搜索在浏览器内直连 GitHub，不经过服务端。

## 帮助 / Help

遇到问题先看这里；仍有疑问请到 [Issues](https://github.com/Noob-stupid/dsh-plugin-hub/issues) 提问。

- **面板没出现**：重启 dsh 服务 → 刷新页面 → 设置 → 插件 → 插件管理。
- **点开关没反应**：基础设施行带"受保护"标签（禁止开关，这是保护机制）；普通插件开关经
  HMR 生效，约 1-3 秒，可点刷新查看。
- **顶部出现兼容性警告**：官方发布了破坏性更新，请到本仓库获取适配版本（见兼容性策略）。
- **市场搜索没结果/报错**：市场走浏览器直连 GitHub（与浏览器可用性一致），失败自动回退
  服务端通道；网络黑洞期请稍后重试。
- **安装失败**：确认仓库有 package.json 且包名已发布到 npm；npm 装不了的会回退
  `github:owner/repo` 安装（需要 git）。

## License

MIT
