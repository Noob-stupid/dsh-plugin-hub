## AI 赋能与服务器组件控制

> **AI Empower** — v0.3.24 正式版核心功能。

在插件控制台输入 **npm 包名或 GitHub 仓库**（如 `OpenViking`、`@noob-stupid/dsh-plugin-console`）：

1. **AI 读文档出计划**：子代理调研 README/docs，产出结构化计划（类型：纯插件 / 服务器组件 / 仅配置；步骤：安装 / 写配置 / 下载 / 启动服务 / 健康检查）；
2. **你确认**（计划在弹窗里逐步骤勾选）——安全护栏：命令/路径白名单、破坏性命令拦截、日志脱敏；
3. **安全执行**：实时回显日志、可中断、幂等（已装/已下载/服务健康则复用）；
4. **自动生成组件卡片**：服务器类组件注册到组件清单，卡片出现在主面板左侧（启动/停止/状态/【打开】直达 Web UI；多服务器时 ▾ 下拉；打开详情时自动隐藏；可折叠并有状态记忆）。

**内置 OpenViking 模板**：输入 `OpenViking` 秒出计划（pip 装 `openviking[local-embed]` → 下载中文嵌入模型 → 写 `ov.conf`（复用 DSH 的 DeepSeek 凭据，支持独立区块覆盖）→ 启动服务器 → 健康检查）。

**模型配置**：默认跟随 DSH（`settings.yaml` + `.credentials.yaml`）；可建 `~/.dsh/plugin-console/ai-empower.json` 独立覆盖：

```json
{ "vlm": { "provider": "openai", "api_base": "https://api.deepseek.com", "model": "deepseek-v4-flash-vision-exp" }, "api_key": "sk-..." }
```
