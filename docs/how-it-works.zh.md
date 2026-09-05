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
