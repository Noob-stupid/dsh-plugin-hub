window.__ModuleLoader__.load({
	id: "@noob-stupid/dsh-plugin-console",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region styles
		const css = ".pc_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.pc_section h3{margin:0;font-size:13px;font-weight:600;line-height:20px}.pc_message{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;margin:0}.pc_messageRow{display:flex;align-items:center;gap:10px}.pc_spinner{width:14px;height:14px;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-state-business-primary);border-radius:50%;animation:pcspin 1s linear infinite;flex:none}@keyframes pcspin{to{transform:rotate(360deg)}}.pc_message[data-error=true]{color:var(--dsw-alias-state-error-primary)}.pc_list{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0;padding:0;list-style:none;display:grid}.pc_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;min-width:0;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_rowTop{align-items:center;gap:8px;display:flex}.pc_name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}.pc_tag{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 8px;font-size:11px;line-height:16px;flex:none}.pc_tag[data-enabled=true]{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}.pc_tag[data-user=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.pc_tag[data-skill=true]{border-color:var(--dsw-alias-state-warning-primary);color:var(--dsw-alias-state-warning-primary)}.pc_tag[data-system=true]{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-2)}.pc_tag[data-disabled=true]{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}.pc_tag[data-suite=true]{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}.pc_tag[data-error=true]{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}.pc_tabGroup{display:inline-flex;gap:4px;align-items:center}.pc_meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;gap:6px;display:flex;align-items:center}.pc_phase[data-phase=failed]{color:var(--dsw-alias-state-error-primary)}.pc_phase[data-phase=active]{color:var(--dsw-alias-state-success-primary)}.pc_toggle{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:4px 12px;align-self:flex-start}.pc_toggle:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}.pc_toggle:disabled{opacity:.5;cursor:default}.pc_search{gap:8px;display:flex}.pc_search input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);height:34px;flex:1;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;padding:0 12px;font-size:13px}.pc_search input:focus-visible{border-color:var(--dsw-alias-state-business-primary)}.pc_search button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);font:inherit;cursor:pointer;border-radius:8px;padding:0 14px;font-size:13px}.pc_search button:hover{border-color:var(--dsw-alias-state-business-primary)}.pc_market{flex-direction:column;gap:10px;margin:0;padding:0;list-style:none;display:flex}.pc_item{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;min-width:0;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_itemTop{align-items:center;gap:8px;display:flex}.pc_itemTop a{color:var(--dsw-alias-state-business-primary);font-size:13px;font-weight:600;text-decoration:none;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pc_stars{color:var(--dsw-alias-label-tertiary);font-size:11px;flex:none}.pc_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0}.pc_item button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:3px 10px;align-self:flex-start;font-size:12px}.pc_item button:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}.pc_item button:disabled{opacity:.5;cursor:default}.pc_detail{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_status{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0}.pc_note{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin:0}.pc_marketHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.pc_descWrap{flex-direction:column;display:flex}.pc_installedHead{display:flex;align-items:center;gap:10px}.pc_backTopWrap{position:fixed;top:56px;right:20px;z-index:100;display:flex;flex-direction:column;gap:8px}.pc_backTop{width:34px;height:34px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:rgba(22,27,34,.72);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);cursor:pointer;backdrop-filter:blur(4px);opacity:.7}.pc_backTop:hover{opacity:1;border-color:var(--dsw-alias-state-business-primary)}.pc_descTopbar{display:flex;justify-content:flex-end;margin:2px 0}.pc_ghpill{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 10px;font-size:11px;line-height:18px}.pc_ghpill[data-on=true]{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}.pc_extraBtn{opacity:.75;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:4px 10px;font-size:12px;line-height:16px;flex:none;transition:opacity .15s ease,border-color 1.5s ease,color 1.5s ease}.pc_extraBtn:hover{opacity:1}.pc_extraBtn[data-active=true]{opacity:1;border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.pc_extraBtn[data-flash=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.pc_view{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:2px 10px;font-size:12px;line-height:18px;flex:none}.pc_floatPanel{position:fixed;left:20px;top:50%;transform:translateY(-50%);width:340px;max-height:75vh;overflow-y:auto;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.18);z-index:50;flex-direction:column;gap:8px;display:flex}.pc_refresh{position:sticky;bottom:14px;align-self:flex-end;margin-top:8px;z-index:60;opacity:.45;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:transparent;font:inherit;cursor:pointer;border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;transition:opacity .15s ease}.pc_refresh:hover{opacity:.9}.pc_date{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;flex:none}.pc_searchInner{position:relative;flex:1;display:flex;align-items:center;min-width:0}.pc_searchInner input{padding-right:32px;width:100%}.pc_starBtn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:13px;line-height:1;padding:4px 8px;border-radius:6px;opacity:.75;transition:opacity .15s ease;flex:none}.pc_starBtn:hover{opacity:1}.pc_starBtn[data-active=true]{opacity:1;color:var(--dsw-alias-state-business-primary)}.pc_restartBtn{position:fixed;right:20px;top:50%;transform:translateY(-50%);z-index:60;opacity:.45;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:transparent;font:inherit;cursor:pointer;border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;transition:opacity .15s ease}.pc_restartBtn:hover{opacity:.9}.pc_relaunchFloat{position:fixed;left:20px;top:50%;transform:translateY(-50%);z-index:70;opacity:.85;border:1px solid var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-bg-layer-3);font:inherit;cursor:pointer;border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;transition:opacity .15s ease}.pc_relaunchFloat:hover{opacity:1}.pc_aiToggle{position:fixed;right:20px;top:20px;z-index:70;opacity:.45;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:transparent;font:inherit;cursor:pointer;border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;transition:opacity .15s ease}.pc_aiToggle:hover{opacity:.9}.pc_aiToggle[data-active=true]{opacity:1;border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.pc_sourcesFloat{position:fixed;right:20px;top:76px;z-index:70;opacity:.85;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-3);font:inherit;cursor:pointer;border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;transition:opacity .15s ease}.pc_sourcesFloat:hover{opacity:1;border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.pc_modeFloat{position:fixed;right:20px;top:176px;z-index:70;opacity:.85;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-3);font:inherit;cursor:pointer;border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;transition:opacity .15s ease}.pc_modeFloat:hover{opacity:1;border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.pc_modeFloat[data-mode=true]{opacity:1;border-color:var(--dsw-alias-state-warning-primary);color:var(--dsw-alias-state-warning-primary)}.pc_trashBtn{border:0;background:0 0;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:12px;line-height:16px;padding:2px 6px;flex:none;display:flex;align-items:center;border-radius:6px;transition:color .15s ease}.pc_trashBtn:hover{color:var(--dsw-alias-state-error-primary)}.pc_consentRemember{display:flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--dsw-alias-label-secondary);cursor:pointer}.pc_modalBackdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center}.pc_modalCard{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:12px;padding:16px 18px;max-width:420px;width:calc(100% - 48px);flex-direction:column;gap:10px;display:flex;box-shadow:0 12px 32px rgba(0,0,0,.25)}.pc_ghpill{background:0 0;cursor:pointer}.pc_ghwrap{position:relative;display:inline-flex}.pc_sourceMenu{position:absolute;right:0;top:calc(100% + 6px);z-index:90;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:4px;flex-direction:column;display:flex;min-width:120px;box-shadow:0 8px 24px rgba(0,0,0,.18)}.pc_sourceOpt{border:0;background:0 0;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:6px;padding:6px 10px;text-align:left;font-size:12px;line-height:16px}.pc_sourceOpt[data-active=true]{color:var(--dsw-alias-state-business-primary);font-weight:600}.pc_sourceOpt:hover{background:var(--dsw-alias-bg-layer-3)}";
		const tagId = "@noob-stupid/dsh-plugin-console/PluginConsoleTab.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@noob-stupid/dsh-plugin-console";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const styles = {
			section: "pc_section",
			marketHead: "pc_marketHead",
			installedHead: "pc_installedHead",
			backTop: "pc_backTop",
			backTopWrap: "pc_backTopWrap",
			spinner: "pc_spinner",
			ghpill: "pc_ghpill",
			descWrap: "pc_descWrap",
			descTopbar: "pc_descTopbar",
			message: "pc_message",
			list: "pc_list",
			row: "pc_row",
			rowTop: "pc_rowTop",
			name: "pc_name",
			tag: "pc_tag",
			meta: "pc_meta",
			phase: "pc_phase",
			toggle: "pc_toggle",
			search: "pc_search",
			extraBtn: "pc_extraBtn",
			view: "pc_view",
			floatPanel: "pc_floatPanel",
			refresh: "pc_refresh",
			restartBtn: "pc_restartBtn",
			relaunchFloat: "pc_relaunchFloat",
			aiToggle: "pc_aiToggle",
			sourcesFloat: "pc_sourcesFloat",
			modeFloat: "pc_modeFloat",
			trashBtn: "pc_trashBtn",
			consentRemember: "pc_consentRemember",
			modalBackdrop: "pc_modalBackdrop",
			modalCard: "pc_modalCard",
			ghwrap: "pc_ghwrap",
			sourceMenu: "pc_sourceMenu",
			sourceOpt: "pc_sourceOpt",
			date: "pc_date",
			searchInner: "pc_searchInner",
			starBtn: "pc_starBtn",
			tabGroup: "pc_tabGroup",
			market: "pc_market",
			item: "pc_item",
			itemTop: "pc_itemTop",
			stars: "pc_stars",
			desc: "pc_desc",
			detail: "pc_detail",
			status: "pc_status",
			note: "pc_note",
		};
		//#endregion
		//#region locales
		const zh = {
			tab: "插件管理",
			loading: "正在读取插件…",
			error: "暂时无法读取插件。",
			retry: "重试",
			installedTitle: "已安装插件",
			marketTitle: "插件市场（GitHub）",
			marketTitleOther: "插件市场（{source}）",
			search: "搜索",
			searchPlaceholder: "搜索 GitHub 上的 dsh-plugin 插件（留空使用默认关键词）",
			searchPlaceholderOther: "搜索 {source} 上的插件（留空使用默认关键词）",
			multiSourceTitle: "多源汇总：GitHub + 全部自定义源并行搜索（Gitee 直装模式不参与）",
			multiSourceToggle: "多源搜索开关",
			multiEmpty: "所有搜索源都没有找到匹配的插件。",
			giteeRepoPlaceholder: "输入 Gitee 仓库名（owner/repo，如 oschina/git-osc）",
			giteeEmpty: "Gitee 官方搜索接口已废弃：请在搜索框直接输入仓库名（owner/repo，如 oschina/git-osc）后回车",
			empty: "暂无插件。",
			on: "启用",
			off: "停用",
			enabledTag: "已启用",
			disabledTag: "已停用",
			userDisabledTag: "补丁停用",
			userForcedTag: "补丁强制启用",
			protectedTag: "受保护",
			unobserved: "未挂载",
			pending: "等待依赖",
			loadingPhase: "加载中",
			active: "已挂载",
			failed: "挂载失败",
			unloading: "卸载中",
			toggledOn: "已请求启用",
			toggledOff: "已请求停用",
			failed: "操作失败",
			view: "查看",
			install: "添加并启用",
			installing: "正在安装…",
			marketLoading: "正在搜索 GitHub…",
			marketLoadingOther: "正在搜索 {source}…",
			directOther: "通过服务端通道检索 {source} 平台（自定义源不走浏览器直连）",
			marketError: "搜索失败",
			marketEmpty: "没有找到相关项目。",
			repoLoading: "正在读取仓库信息…",
			repoError: "读取仓库信息失败",
			packageName: "npm 包名",
			dshHint: "疑似 DSH 插件",
			noPackage: "该仓库没有 package.json，无法安装",
			privateRootHint: "该仓库根包未发布到 npm（private），无法直接安装",
			subpackagesTitle: "仓库子包（可单独安装）",
			subpackagesLoading: "正在读取子包列表…",
			subpackagesError: "读取子包列表失败（网络波动时可稍后重试）",
			subpackagesEmpty: "未发现可安装的子包。",
			recentFailures: "最近安装失败",
			installed: "已安装并启用",
			installNote: "HMR 正在生效；若插件带界面，请刷新页面",
			bundleNote: "该包是 bundle 层插件（如皮肤合集），重启 DSH 服务后生效",
			direct: "（浏览器直连 GitHub；若你的浏览器打不开 GitHub，将自动回退到服务端通道）",
			details: "详情",
					expandDesc: "展开",
			collapseDesc: "收起",
			addLocal: "添加到本地",
			installingLocal: "安装中…",
			needPackage: "该仓库没有 package.json，无法直接添加",
			noDetail: "该插件没有提供说明信息。",
			versionLabel: "版本",
			repoLabel: "仓库",
			homepageLabel: "主页",
			readmeLabel: "说明摘要",
			loadingDetails: "正在读取详情…",
			githubLoggedIn: "已登录 GitHub：",
			githubCornerOut: "未登录 GitHub",
			hubUpdateAvailable: "下载更新",
					searchInstalledPlaceholder: "搜索已安装插件（名称或 id）",
			extraFilter: "已装",
			extraFilterAll: "全部",
			extraTag: "第三方",
			extraFilterTitle: "切换：已装（后装/第三方插件）/ 全部",
			extraEmpty: "没有已装的插件（非 dsh 自带）。",
			noMatch: "没有匹配的插件。",
			loadMore: "加载更多",
			loadingMore: "加载中…",
			backToSearch: "回到搜索",
			collapseResults: "收起搜索结果",
			expandResults: "展开搜索结果",
			reloadPage: "刷新页面",
			refreshList: "刷新插件列表",
			stageLabel: "阶段",
			stagePreparing: "准备中",
			stageInstalling: "下载安装中（可离开本页，后台继续）",
			stageConfiguring: "写入启用配置",
			stageRepairing: "本地 AI 接管安装中…",
			restartService: "重启服务",
			restarting: "服务重启中，页面稍后自动恢复…",
			autoReload: "页面即将自动刷新…",
			aiRepaired: "本地 AI 已接管并完成修复，请刷新页面查看",
			deletePlugin: "删除插件（移除配置并卸载包）",
			confirmDelete: "确认删除？",
			deleting: "删除中…",
			deleteNote: "已删除插件并卸载包，正在刷新",
			deleteBundleNote: "已移除插件所属 bundle，重启服务后生效",
			aiConsentText: "常规安装通道均已尝试失败。下一步将让本地 AI 接管安装——这会调用 DeepSeek API 模型，可能产生 API 费用。是否继续？",
			aiConsentNotifyTitle: "插件安装需要授权",
			aiConsentApprove: "同意，继续（可能产生费用）",
			aiConsentDecline: "取消",
			aiFallbackLabel: "AI 兜底",
			aiFallbackTitle: "关闭后：常规通道失败将直接取消安装，不再调用模型 API（零费用）",
			aiFallbackOff: "已按设置关闭 AI 兜底，本次安装已取消（零费用）",
			aiConsentRemember: "以后不再提醒（自动同意 AI 兜底，可能产生费用；可随时在插件市场页面最底部恢复提醒）",
			aiRememberNote: "已按设置自动同意本地 AI 兜底（如需恢复弹窗提醒，请到市场底部修改）",
			aiRememberReset: "已关闭 AI 兜底弹窗提醒（点击恢复提醒）",
			consentWaiting: "等待授权确认…",
			dismissFailure: "关闭此条提示",
			sourcesBtn: "软件源",
			sourcesTitle: "软件源管理",
			sourcesDesc: "安装源（registry）：安装时按主→备依次尝试；支持私有 / 内网 registry",
			sourcePrimary: "主源",
			setPrimary: "设为主源",
			removeSource: "删除",
			sourceName: "名称",
			sourceUrl: "地址（https://…）",
			addSource: "添加",
			resetSources: "恢复默认",
			closeModal: "关闭",
			invalidSourceUrl: "软件源地址必须是 https:// 开头（或本机/私网 http://）的合法 URL",
			editSource: "编辑",
			saveSource: "保存",
			cancelEdit: "取消",
			searchSourcesTitle: "搜索源",
			searchSourcesDesc: "搜索平台（点击登录标切换）。自定义源用 URL 模板：{q}=关键词、{page}=页码",
			addSearchSource: "添加搜索源",
			searchUrlPlaceholder: "URL 模板（必须含 {q}）",
			invalidSearchUrl: "搜索 URL 模板必须包含 {q} 占位符",
			headersPlaceholder: "请求头（可选）：每行一个，格式 名称: 值，如 Authorization: Bearer 令牌",
			giteeTitle: "Gitee 登录（可选）",
			giteeDesc: "Gitee 直装模式无需登录；登录仅用于提高接口限额（可选）：① 打开 gitee.com → 设置 → 数据管理 → 第三方应用（或直接访问 https://gitee.com/oauth/applications/new）；② 新建应用：应用名称随意，应用主页填 http://127.0.0.1:{port}（任意有效网址即可），应用回调地址填 http://127.0.0.1:{port}/plugin-console/gitee-oauth-callback，权限勾选 user_info、projects；③ 创建成功后把 Client ID / Client Secret 填到下面并点「保存配置」，再点「授权登录 Gitee」",
			giteeClientId: "Client ID",
			giteeClientSecret: "Client Secret",
			giteeSave: "保存配置",
			giteeLoginBtn: "授权登录 Gitee",
			giteeLoggedIn: "已登录 Gitee：",
			giteeClear: "清除登录",
			giteeSetupHint: "未登录（可选）——直装模式无需登录，登录仅提高接口限额",
			giteeLoginPrompt: "Gitee 源不需要登录：直接输入仓库名 owner/repo 搜索安装即可",
			sourcesUpdated: "软件源已更新",
			sourceOf: "源：",
			searchSourceTitle: "点击切换搜索源（GitHub / Gitee / 自定义）",
			recentFailures: "最近安装失败",
			installedAt: "已安装",
			checkUpdate: "检测更新",
			checkingUpdate: "检测中…",
			updateCheckFailed: "检测失败",
			updateAvailable: "发现新版本",
			upToDate: "已是最新版本",
			updateNow: "更新",
			depsOutdatedHint: "本包更新后还需同步以下子包版本（避免版本混搭导致启动冲突）",
			update: "更新版本",
			officialBadge: "官方",
			aggregateBadge: "聚合",
			officialTitle: "官方 dsh plugin add 通道可安装（dsh.bundle 清单）",
			aggregateTitle: "聚合仓库：根包未发布，子包才是插件（查看详情可逐个安装）",
			officialOnlyToggle: "只看官方",
			officialChecking: "正在识别插件类型…",
			elapsed: "已用时",
			skillBadge: "技能",
			skillTitle: "仓库含 SKILL.md，可按技能安装到 ~/.dsh/skills（由 dsh-skill-filesystem 扫描发现）",
			skillTab: "技能",
			pluginsTab: "插件",
			skillMarketEmpty: "技能库为空（自动收录 agent-skills / claude-skills / dsh-skill topic 仓库）",
			installSkill: "装技能",
			skillInstalledTag: "已装",
			skillInstalledMsg: "技能安装完成",
			skillInstallNote: "技能已复制到 ~/.dsh/skills；当前 profile 若未启用 dsh-skill-filesystem 插件，技能不会被发现（启用后重启即可）",
			skillUninstallHint: "删除技能：直接删除 ~/.dsh/skills/<名称> 目录",
			modeBtn: "切换市场模式：插件市场 / 技能市场（技能从 SKILL.md 仓库一键安装到 ~/.dsh/skills）",
			skillsMode: "技能",
			pluginsMode: "插件",
			skillsMarketTitle: "技能市场（GitHub）",
			skillsMarketTitleOther: "技能市场（{source}）",
			skillsSearchPlaceholder: "搜索技能仓库（agent-skills / claude-skills / dsh-skill topic；留空浏览全部）",
			skillsNote: "技能模式仅支持 GitHub 源；技能安装 = 克隆 SKILL.md 仓库到 ~/.dsh/skills/<名称>/，不写补丁、无需重启",
			skillsGithubOnly: "技能搜索仅支持 GitHub 源（其他源请在插件模式使用）",
			installedSkillsTitle: "已安装技能",
			skillDelete: "删除技能",
			skillDeleteConfirm: "确认删除技能「{name}」？",
			skillDeletedMsg: "技能已删除",
			skillsEmpty: "技能库为空（自动收录 agent-skills / claude-skills / dsh-skill topic 仓库）",
			skillSystemTag: "系统",
			skillSystemTitle: "系统自带技能（~/.dsh/skills/.system 等保留目录），禁止删除",
			skillDisable: "停用",
			skillEnable: "启用",
			skillDisabledTag: "已停用",
			skillDisabledTitle: "已停用：模型与用户命令均不可调用（disable-model-invocation: true，可随时启用）",
			skillToggledMsg: "技能已停用",
			skillEnabledMsg: "技能已启用",
			skillMetaLabel: "技能摘要",
			skillNameLabel: "技能名",
			skillWhenToUseLabel: "适用场景",
			skillRepoNote: "技能仓库（SKILL.md），非 npm 包",
			skillTopicsLabel: "来源",
			skillDetailInstalled: "已装",
			skillDetailDisabled: "已停用",
			skillDetailPath: "安装位置",
			suiteBadge: "套装",
			suiteTitle: "submodule 聚合套装：自动装配子模块组件（bundle 插件 / 普通插件 / 技能 / agent 预设），照仓库 install.ps1 语义执行、不运行第三方脚本",
			suiteInstall: "安装套装",
			suiteInstalledMsg: "套装安装完成",
			suiteComponentType: "组件",
			suiteComponentOk: "成功",
			suiteComponentFail: "失败",
			suiteRepoNote: "套装仓库（submodule 聚合），非 npm 包——安装方式见下方官方命令",
			officialInstallLabel: "官方安装方式",
			copyInstallCmd: "复制",
			copiedInstallCmd: "安装命令已复制，可粘贴到终端手动执行",
			frameworkUpgradeNotice: "检测到 DSH 框架升级：{from} → {to}。已自动备份升级前配置到 {dir}，框架补丁：{patch}；第三方插件请留意兼容性。",
			frameworkPatchApplied: "已重新应用",
			frameworkPatchSkipped: "无需应用",
			frameworkUpgradeBtn: "框架升级",
			frameworkUpgradeTitle: "框架升级：自动打包备份现有配置 → 停止并重启 DSH 服务 → npm 升级框架与配套包（失败自动回滚）→ 拉起服务并适配",
			frameworkUpgradeConfirm: "确认升级？（服务将自动重启）",
			frameworkUpgradeDone: "框架升级流程已执行",
			frameworkUpgradeUpToDate: "（已是最新版本）",
			frameworkUpgradeCheckFailed: "（版本检测失败，无法确认是否有更新——请检查网络后重试）",
			frameworkUpToDate: "已是最新框架",
			frameworkUpToDateTitle: "当前 DSH 框架已是最新版本（升级请走官方流程或等新版本发布）",
			frameworkUseUpgrade: "deepseek-harness 是 DSH 框架本体，无需安装；升级请使用卡片上的「框架升级」流程（有新版本时出现）",
			relaunchBtn: "拉起服务",
			relaunchTitle: "框架升级期间服务可能断开——点此手动拉起 DSH 服务（升级脚本也会自动拉起）",
			relaunchDone: "已发起手动拉起（端口无监听时自动启动服务）",
			fwStepBackup: "备份现有配置",
			fwStepStop: "停止服务（页面将断开）",
			fwStepInstall: "升级框架本体",
			fwStepRollback: "升级失败回滚",
			fwStepPkg: "更新官方配套包",
			fwStepRelaunch: "拉起 DSH 服务",
			fwStepDone: "升级完成",
			installBusy: "已有安装/更新任务进行中，请等待完成后再试",
		};
		const en = {
			tab: "Plugin console",
			loading: "Reading plugins…",
			error: "Plugins are temporarily unavailable.",
			retry: "Retry",
			installedTitle: "Installed plugins",
			marketTitle: "Plugin market (GitHub)",
			marketTitleOther: "Plugin market ({source})",
			search: "Search",
			searchPlaceholder: "Search dsh-plugin projects on GitHub (empty = default query)",
			searchPlaceholderOther: "Search {source} for plugins (empty = default query)",
			multiSourceTitle: "Multi-source: GitHub + all custom sources in parallel (Gitee direct mode excluded)",
			multiSourceToggle: "Multi-source search toggle",
			multiEmpty: "No matching plugins found in any search source.",
			giteeRepoPlaceholder: "Enter a Gitee repo (owner/repo, e.g. oschina/git-osc)",
			giteeEmpty: "Gitee's official search API is deprecated: type a repo name (owner/repo, e.g. oschina/git-osc) in the search box and press Enter",
			empty: "No plugins are available.",
			on: "Enable",
			off: "Disable",
			enabledTag: "Enabled",
			disabledTag: "Disabled",
			userDisabledTag: "Disabled by patch",
			userForcedTag: "Forced on by patch",
			protectedTag: "Protected",
			unobserved: "Not mounted",
			pending: "Waiting for dependencies",
			loadingPhase: "Loading",
			active: "Mounted",
			failed: "Mount failed",
			unloading: "Unloading",
			toggledOn: "Enable requested",
			toggledOff: "Disable requested",
			failed: "Operation failed",
			view: "Inspect",
			install: "Add & enable",
			installing: "Installing…",
			marketLoading: "Searching GitHub…",
			marketLoadingOther: "Searching {source}…",
			directOther: "Searching {source} through the server channel (custom sources do not use browser-direct)",
			marketError: "Search failed",
			marketEmpty: "No matching projects.",
			repoLoading: "Reading repository…",
			repoError: "Failed to read repository",
			packageName: "npm package",
			dshHint: "Looks like a DSH plugin",
			noPackage: "This repository has no package.json, cannot install",
			privateRootHint: "Root package is not published to npm (private); cannot install directly",
			subpackagesTitle: "Repository subpackages (installable individually)",
			subpackagesLoading: "Reading subpackage list…",
			subpackagesError: "Failed to read subpackages (retry later if the network is flaky)",
			subpackagesEmpty: "No installable subpackages found.",
			recentFailures: "Recent install failures",
			installed: "Installed and enabled",
			installNote: "HMR is applying; refresh the page if the plugin ships UI",
			bundleNote: "This package is a bundle-layer plugin (e.g. skin packs); restart the DSH service to activate it",
			direct: "(The browser calls GitHub directly; the server channel is used as fallback.)",
			details: "Details",
					expandDesc: "Expand",
			collapseDesc: "Collapse",
			addLocal: "Add locally",
			installingLocal: "Installing…",
			needPackage: "This repository has no package.json, cannot add directly",
			noDetail: "No description provided for this plugin.",
			versionLabel: "Version",
			repoLabel: "Repository",
			homepageLabel: "Homepage",
			readmeLabel: "Readme summary",
			loadingDetails: "Reading details…",
			githubLoggedIn: "GitHub signed in: ",
                    hubUpdateAvailable: "Download update",
			githubCornerOut: "Not signed in to GitHub",
					searchInstalledPlaceholder: "Search installed plugins (name or id)",
			extraFilter: "Installed",
			extraFilterAll: "All",
			extraTag: "Third-party",
			extraFilterTitle: "Toggle: installed (extra/third-party) / all",
			extraEmpty: "No installed extra (non-bundled) plugins.",
			noMatch: "No matching plugins.",
			loadMore: "Load more",
			loadingMore: "Loading…",
			backToSearch: "Back to search",
			collapseResults: "Collapse results",
			expandResults: "Expand results",
			reloadPage: "Reload page",
			refreshList: "Refresh plugin list",
			stageLabel: "Stage",
			stagePreparing: "Preparing",
			stageInstalling: "Downloading & installing (safe to leave this page)",
			stageConfiguring: "Writing enable config",
			stageRepairing: "Local AI is taking over the install…",
			restartService: "Restart service",
			restarting: "Service restarting, the page will recover shortly…",
			autoReload: "Page will auto-reload…",
			aiRepaired: "Local AI took over and finished the repair; refresh the page",
			deletePlugin: "Delete plugin (remove config and uninstall package)",
			confirmDelete: "Confirm delete?",
			deleting: "Deleting…",
			deleteNote: "Plugin deleted and package uninstalled; refreshing",
			deleteBundleNote: "Owning bundle removed; takes effect after service restart",
			aiConsentText: "All regular install channels failed. Next, the local AI takes over the install, which calls a DeepSeek API model and may incur API costs. Continue?",
			aiConsentNotifyTitle: "Plugin install needs approval",
			aiConsentApprove: "Agree, continue (may incur costs)",
			aiConsentDecline: "Cancel",
			aiFallbackLabel: "AI fallback",
			aiFallbackTitle: "When off: if regular channels fail, the install is cancelled directly without calling the model API (zero cost)",
			aiFallbackOff: "AI fallback is disabled by your setting; this install was cancelled (zero cost)",
			aiConsentRemember: "Don't ask again (auto-approve the AI fallback, may incur costs; restore reminders anytime at the very bottom of the market)",
			aiRememberNote: "AI fallback auto-approved per your setting (restore reminders at the market bottom)",
			aiRememberReset: "AI fallback reminders disabled (click to restore)",
			consentWaiting: "Awaiting approval…",
			dismissFailure: "Dismiss this notice",
			sourcesBtn: "Sources",
			sourcesTitle: "Software sources",
			sourcesDesc: "Install registries, tried primary-first; private / intranet registries supported",
			sourcePrimary: "Primary",
			setPrimary: "Set primary",
			removeSource: "Remove",
			sourceName: "Name",
			sourceUrl: "URL (https://…)",
			addSource: "Add",
			resetSources: "Reset defaults",
			closeModal: "Close",
			invalidSourceUrl: "Source URL must start with https:// (or a private http:// address)",
			editSource: "Edit",
			saveSource: "Save",
			cancelEdit: "Cancel",
			searchSourcesTitle: "Search sources",
			searchSourcesDesc: "Search platforms (switch via the pill). Custom sources use a URL template: {q}=keyword, {page}=page number",
			addSearchSource: "Add search source",
			searchUrlPlaceholder: "URL template (must contain {q})",
			invalidSearchUrl: "Search URL template must contain the {q} placeholder",
			headersPlaceholder: "Headers (optional): one per line, format Name: Value, e.g. Authorization: Bearer token",
			giteeTitle: "Gitee login (optional)",
			giteeDesc: "Gitee direct-repo mode needs no login; login only raises API rate limits (optional): ① Open gitee.com → Settings → Data management → Third-party apps (or go directly to https://gitee.com/oauth/applications/new); ② Create an app: any app name, homepage URL = http://127.0.0.1:{port} (any valid URL works), redirect/callback URL = http://127.0.0.1:{port}/plugin-console/gitee-oauth-callback, grant scope user_info, projects; ③ Fill Client ID / Client Secret below, click Save, then click Authorize Gitee",
			giteeClientId: "Client ID",
			giteeClientSecret: "Client Secret",
			giteeSave: "Save",
			giteeLoginBtn: "Authorize Gitee",
			giteeLoggedIn: "Signed in to Gitee: ",
			giteeClear: "Clear login",
			giteeSetupHint: "Not signed in (optional) — direct mode needs no login; login raises rate limits",
			giteeLoginPrompt: "Gitee login is optional: type a repo name owner/repo to search and install",
			sourcesUpdated: "Sources updated",
			sourceOf: "Source: ",
			searchSourceTitle: "Click to switch search source (GitHub / Gitee / custom)",
			recentFailures: "Recent install failures",
			installedAt: "Installed",
			checkUpdate: "Check update",
			checkingUpdate: "Checking…",
			updateCheckFailed: "Check failed",
			updateAvailable: "New version available",
			upToDate: "Up to date",
			updateNow: "Update",
			depsOutdatedHint: "Updating this package also needs these subpackage versions (avoid mixed-version startup conflicts)",
			update: "Update",
			officialBadge: "Official",
			aggregateBadge: "Aggregate",
			officialTitle: "Installable via official dsh plugin add (dsh.bundle manifest)",
			aggregateTitle: "Aggregate repo: root unpublished; subpackages are the plugins (view to install)",
			officialOnlyToggle: "Official only",
			officialChecking: "Identifying plugin types…",
			elapsed: "Elapsed",
			skillBadge: "Skill",
			skillTitle: "Repo contains SKILL.md — installable as a skill into ~/.dsh/skills (scanned by dsh-skill-filesystem)",
			skillTab: "Skills",
			pluginsTab: "Plugins",
			skillMarketEmpty: "Skill library is empty (auto-collected from agent-skills / claude-skills / dsh-skill topic repos)",
			installSkill: "Install skill",
			skillInstalledTag: "Installed",
			skillInstalledMsg: "Skill installed",
			skillInstallNote: "Skill copied to ~/.dsh/skills; if the current profile does not enable the dsh-skill-filesystem plugin the skill won't be discovered (enable it and restart)",
			skillUninstallHint: "To remove a skill: delete the ~/.dsh/skills/<name> directory",
			modeBtn: "Switch market mode: plugin market / skill market (skills install from SKILL.md repos into ~/.dsh/skills)",
			skillsMode: "Skills",
			pluginsMode: "Plugins",
			skillsMarketTitle: "Skill market (GitHub)",
			skillsMarketTitleOther: "Skill market ({source})",
			skillsSearchPlaceholder: "Search skill repos (agent-skills / claude-skills / dsh-skill topics; empty = browse all)",
			skillsNote: "Skill mode supports the GitHub source only; installing a skill = clone the SKILL.md repo into ~/.dsh/skills/<name>/, no patch, no restart",
			skillsGithubOnly: "Skill search supports the GitHub source only (use plugin mode for other sources)",
			installedSkillsTitle: "Installed skills",
			skillDelete: "Remove skill",
			skillDeleteConfirm: "Remove skill「{name}」?",
			skillDeletedMsg: "Skill removed",
			skillsEmpty: "Skill library is empty (auto-collected from agent-skills / claude-skills / dsh-skill topic repos)",
			skillSystemTag: "System",
			skillSystemTitle: "System-owned skill (~/.dsh/skills/.system etc.), cannot be removed",
			skillDisable: "Disable",
			skillEnable: "Enable",
			skillDisabledTag: "Disabled",
			skillDisabledTitle: "Disabled: neither model nor user commands can invoke it (disable-model-invocation: true, re-enable anytime)",
			skillToggledMsg: "Skill disabled",
			skillEnabledMsg: "Skill enabled",
			skillMetaLabel: "Skill summary",
			skillNameLabel: "Skill name",
			skillWhenToUseLabel: "When to use",
			skillRepoNote: "Skill repo (SKILL.md), not an npm package",
			skillTopicsLabel: "Source",
			skillDetailInstalled: "Installed",
			skillDetailDisabled: "Disabled",
			skillDetailPath: "Location",
			suiteBadge: "Suite",
			suiteTitle: "Submodule aggregate suite: auto-assembles components (bundle plugins / plugins / skills / agent presets) following the repo's install.ps1 semantics without executing third-party scripts",
			suiteInstall: "Install suite",
			suiteInstalledMsg: "Suite installed",
			suiteComponentType: "Component",
			suiteComponentOk: "OK",
			suiteComponentFail: "Failed",
			suiteRepoNote: "Suite repo (submodule aggregate), not an npm package — see the official install command below",
			officialInstallLabel: "Official install",
			copyInstallCmd: "Copy",
			copiedInstallCmd: "Install command copied — paste into your terminal to run it manually",
			frameworkUpgradeNotice: "DSH framework upgrade detected: {from} → {to}. Pre-upgrade config backed up to {dir}; framework patch: {patch}. Check third-party plugin compatibility.",
			frameworkPatchApplied: "reapplied",
			frameworkPatchSkipped: "not needed",
			frameworkUpgradeBtn: "Framework upgrade",
			frameworkUpgradeTitle: "Framework upgrade: backup config → stop & restart DSH service → npm upgrade framework + official packages (auto rollback on failure) → relaunch and adapt",
			frameworkUpgradeConfirm: "Confirm upgrade? (service will restart)",
			frameworkUpgradeDone: "Framework upgrade flow executed",
			frameworkUpgradeUpToDate: " (already latest)",
			frameworkUpgradeCheckFailed: " (version check failed - cannot confirm update, check network and retry)",
			frameworkUpToDate: "Framework up to date",
			frameworkUpToDateTitle: "Current DSH framework is already the latest (upgrade via the official flow or wait for a new release)",
			frameworkUseUpgrade: "deepseek-harness is the DSH framework itself, not a plugin; upgrade via the card's Framework Upgrade flow (shown when a new version exists)",
			relaunchBtn: "Relaunch service",
			relaunchTitle: "During a framework upgrade the service may disconnect — click to manually relaunch the DSH service (the upgrade script also relaunches automatically)",
			relaunchDone: "Manual relaunch requested (starts the service if the port is not listening)",
			fwStepBackup: "Backup current config",
			fwStepStop: "Stop service (page will disconnect)",
			fwStepInstall: "Upgrade framework",
			fwStepRollback: "Rollback on failure",
			fwStepPkg: "Update official packages",
			fwStepRelaunch: "Relaunch DSH service",
			fwStepDone: "Upgrade complete",
		};
		//#endregion
		const NS = "settings.pluginConsole";
		const inject = ["slots", "locale"];
		const PHASE_KEYS = { pending: "pending", loading: "loadingPhase", active: "active", failed: "failed", unloading: "unloading" };
		const GITHUB_API = "https://api.github.com";
		const GITHUB_RAW = "https://raw.githubusercontent.com";
		const el = react.createElement;
		function moduleShortName(moduleName) {
			return (moduleName.startsWith("@") ? moduleName.slice(moduleName.indexOf("/") + 1) : moduleName)
				.replace(/^cordis:/, "").replace(/^cordis-plugin-/, "").replace(/^dsh-(?:host-|client-)?/, "");
		}
		/** 提取 README 标题与开篇摘要（与宿主端 summarizeReadme 同规则）。 */
		function summarizeReadmeText(text) {
			const lines = text.split(/\r?\n/u);
			let title = "";
			const intro = [];
			for (const line of lines) {
				const heading = line.match(/^(#{1,3})\s+(.+)$/u);
				if (heading) {
					if (title === "") { title = heading[2].trim(); continue; }
					break;
				}
				if (title === "") continue;
				const cleaned = line.replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
					.replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
					.replace(/[`*_~]/gu, "")
					.trim();
				if (cleaned) intro.push(cleaned);
				if (intro.join(" ").length > 700) break;
			}
			return { title, summary: intro.join(" ").trim().slice(0, 900) };
		}
		function phaseLabel(phase, t) {
			return phase === null ? t("unobserved") : t(PHASE_KEYS[phase]);
		}
		async function call(path, body) {
			const response = await fetch(path, body === undefined
				? {}
				: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
			let data = null;
			try {
				data = await response.json();
			} catch {}
			if (!response.ok || (data !== null && data.ok === false)) {
				throw new Error(data !== null && typeof data.error === "string" ? data.error : "HTTP " + response.status);
			}
			return data;
		}
		/** 超时类错误附上可操作提示（网络黑洞期的最常见表现）。 */
		function friendlyGithubError(error) {
			const msg = error !== null && typeof error.message === "string" ? error.message : String(error);
			if (/超时|timeout|aborted|网络/iu.test(msg)) {
				return new Error(msg + "（当前网络可能处于波动期：稍等一两分钟再试；或刷新页面，让浏览器直连通道重新工作）");
			}
			return error;
		}
		async function githubFetch(url) {
			const response = await fetch(url, {
				headers: { accept: "application/vnd.github+json" },
				signal: AbortSignal.timeout(15000),
			});
			if (response.status === 403) throw new Error("GitHub 匿名接口限流已用尽，请稍后再试");
			if (!response.ok) throw new Error("GitHub 请求失败 (HTTP " + response.status + ")");
			return response.json();
		}
		/** raw 文件多通道竞速：官方直连 + 常见 gh 镜像，谁先成功用谁；非 GitHub 平台走对应 raw 地址。 */
		const RAW_CANDIDATES = [
			(repo, branch, file) => `${GITHUB_RAW}/${repo}/${branch}/${file}`,
			(repo, branch, file) => `https://ghproxy.net/https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
			(repo, branch, file) => `https://ghfast.top/https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
			(repo, branch, file) => `https://mirror.ghproxy.com/https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
		];
		async function fetchRawText(repo, branch, file, source = "github") {
			if (source === "gitee") {
				try {
					const res = await fetch(`https://gitee.com/${repo}/raw/${branch}/${file}`, { signal: AbortSignal.timeout(15000) });
					if (!res.ok) return null;
					return await res.text();
				} catch { return null; }
			}
			const attempts = RAW_CANDIDATES.map((build) => fetch(build(repo, branch, file), {
				signal: AbortSignal.timeout(15000),
			}).then((res) => {
				if (!res.ok) throw new Error("HTTP " + res.status);
				return res.text();
			}));
			try {
				return await Promise.any(attempts);
			} catch {
				return null;
			}
		}
		/** 浏览器直连 GitHub 搜索；失败抛错由调用方回退到服务端通道。 */
		async function searchFromGithub(q, page) {
			const query = (q ?? "").trim() || "dsh-plugin";
			const data = await githubFetch(`${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20&page=${Math.max(page || 1, 1)}`);
			return (data.items ?? []).map((item) => ({
				fullName: item.full_name,
				description: item.description ?? "",
				htmlUrl: item.html_url,
				stars: item.stargazers_count ?? 0,
				updatedAt: item.updated_at ?? "",
				defaultBranch: item.default_branch ?? "main",
				topics: item.topics ?? [],
			}));
		}
		/** 提取 SKILL.md frontmatter 摘要（name / description / whenToUse，与宿主端同规则）。 */
		function summarizeSkillFrontmatter(text) {
			const fm = text.startsWith("---") ? text.slice(3, text.indexOf("\n---", 3)) : "";
			if (fm === "") return null;
			const pick = (key) => {
				const m = fm.match(new RegExp("^" + key + ":\\s*(.*)$", "mu"));
				if (!m) return "";
				const first = m[1].trim();
				if (first.startsWith("|")) {
					// 多行块：取后续行直到下一个键或结束
					const rest = fm.slice(m.index + m[0].length);
					const lines = [];
					for (const line of rest.split("\n")) {
						if (/^[a-zA-Z][\w-]*\s*:/u.test(line)) break;
						const v = line.trim();
						if (v) lines.push(v);
						if (lines.join(" ").length > 240) break;
					}
					return lines.join(" ").slice(0, 500);
				}
				return first.slice(0, 200);
			};
			const name = pick("name");
			const description = pick("description");
			const whenToUse = pick("whenToUse");
			if (!name && !description && !whenToUse) return null;
			return { name, description, whenToUse };
		}
		/** 浏览器直连读取仓库元数据 + package.json + README 摘要。
		 * 搜索结果自带描述/star/分支信息，seed 存在时跳过 api.github.com 请求
		 * （该接口在黑洞期会挂起很久，是"查看没反应"的根因）。 */
		async function repoInfoFromGithub(repo, seed) {
			let branch = "main";
			let metaDescription = "";
			let metaStars = 0;
			if (seed && typeof seed.defaultBranch === "string" && seed.defaultBranch) {
				branch = seed.defaultBranch;
				metaDescription = seed.description ?? "";
				metaStars = seed.stars ?? 0;
			} else {
				const meta = await githubFetch(`${GITHUB_API}/repos/${encodeURIComponent(repo)}`);
				branch = meta.default_branch ?? "main";
				metaDescription = meta.description ?? "";
				metaStars = meta.stargazers_count ?? 0;
			}
			let pkg = null;
			let readme = null;
			let skill = null;
			const pkgText = await fetchRawText(repo, branch, "package.json");
			if (pkgText !== null) {
				try { pkg = JSON.parse(pkgText); } catch {}
			}
			const readmeText = await fetchRawText(repo, branch, "README.md");
			if (readmeText !== null) readme = summarizeReadmeText(readmeText);
			const skillText = await fetchRawText(repo, branch, "SKILL.md");
			if (skillText !== null) skill = summarizeSkillFrontmatter(skillText);
			return {
				repo,
				defaultBranch: branch,
				description: metaDescription,
				stars: metaStars,
				packageName: pkg !== null && typeof pkg.name === "string" ? pkg.name : null,
				packageDescription: pkg !== null && typeof pkg.description === "string" ? pkg.description : null,
				hasPackageJson: pkg !== null,
				privateRoot: pkg !== null && pkg.private === true,
				readme,
				skill,
				dshHint: pkg !== null && (
					typeof pkg.name === "string" && /(^|-)dsh[-/]/u.test(pkg.name)
					|| pkg.peerDependencies !== undefined && pkg.peerDependencies["@deepseek-ai/cordis"] !== undefined
					|| Array.isArray(pkg.keywords) && pkg.keywords.includes("dsh-plugin")
				),
			};
		}
		/** 只取仓库的 npm 包名与 private 标记（跳过 README 与 api.github.com，供"添加到本地"快捷路径使用）。 */
		async function fetchPackageName(repo, seedBranch, source = "github") {
			const branch = typeof seedBranch === "string" && seedBranch ? seedBranch : "main";
			const pkgText = await fetchRawText(repo, branch, "package.json", source);
			if (pkgText !== null) {
				try {
					const pkg = JSON.parse(pkgText);
					if (pkg && typeof pkg.name === "string") return { name: pkg.name, private: pkg.private === true };
				} catch {}
			}
			return null;
		}
		/** 非 GitHub 平台仓库详情：seed 自带元数据，直接用平台 raw 读 package.json 与 README。 */
		async function repoInfoFromPlatform(item) {
			const source = item.source ?? "github";
			const branch = item.defaultBranch ?? (source === "gitee" ? "master" : "main");
			let pkg = null;
			let readme = null;
			let skill = null;
			const pkgText = await fetchRawText(item.fullName, branch, "package.json", source);
			if (pkgText !== null) {
				try { pkg = JSON.parse(pkgText); } catch {}
			}
			const readmeText = await fetchRawText(item.fullName, branch, "README.md", source);
			if (readmeText !== null) readme = summarizeReadmeText(readmeText);
			const skillText = await fetchRawText(item.fullName, branch, "SKILL.md", source);
			if (skillText !== null) skill = summarizeSkillFrontmatter(skillText);
			return {
				repo: item.fullName,
				defaultBranch: branch,
				description: item.description ?? "",
				stars: item.stars ?? 0,
				packageName: pkg !== null && typeof pkg.name === "string" ? pkg.name : null,
				packageDescription: pkg !== null && typeof pkg.description === "string" ? pkg.description : null,
				hasPackageJson: pkg !== null,
				privateRoot: pkg !== null && pkg.private === true,
				readme,
				skill,
				dshHint: pkg !== null && (
					typeof pkg.name === "string" && /(^|-)dsh[-/]/u.test(pkg.name)
					|| pkg.peerDependencies !== undefined && pkg.peerDependencies["@deepseek-ai/cordis"] !== undefined
					|| Array.isArray(pkg.keywords) && pkg.keywords.includes("dsh-plugin")
				),
			};
		}
		/** monorepo 子包列表：git trees 递归列出 packages 目录下的 package.json，逐个取 npm 包名（上限 24 个）。 */
		async function fetchSubpackages(repo, branch) {
			const data = await githubFetch(`https://api.github.com/repos/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
			const paths = (data.tree ?? []).filter((node) => node.type === "blob" && /^(?:packages|examples|plugins|skills|apps|extensions|src|lib)\/[^/]+\/package\.json$/u.test(node.path)).map((node) => node.path);
			if (paths.length === 0) return [];
			const out = [];
			for (const path of paths.slice(0, 24)) {
				const text = await fetchRawText(repo, branch, path);
				if (text === null) continue;
				try {
					const pkg = JSON.parse(text);
					if (pkg && typeof pkg.name === "string") out.push({ dir: path.split("/")[1], path: path.split("/").slice(0, -1).join("/"), name: pkg.name });
				} catch {}
			}
			return out;
		}
		/** 批量识别搜索结果：官方通道（根包 dsh.bundle）/ 聚合仓库（private+workspaces，子包才是插件）/ 普通项目。 */
		async function enrichOfficialBundle(items) {
			return Promise.all(items.map(async (item) => {
				let official = null;
				let aggregate = false;
				const pkgText = await fetchRawText(item.fullName, item.defaultBranch, "package.json", item.source ?? "github");
				if (pkgText !== null) {
					try {
						const pkg = JSON.parse(pkgText);
						if (typeof pkg.dsh?.bundle?.patch === "string") {
							official = true;
						} else if (pkg.private === true && (Array.isArray(pkg.workspaces) || /(^|-)dsh[-/]/u.test(String(pkg.name ?? "")))) {
							aggregate = true;
						}
					} catch {}
				}
				return { ...item, official, aggregate };
			}));
		}
		/** 源地址校验（与宿主端一致）：https 任意；http 仅限本机/私网（内网源常用 http）。 */
		function isAllowedSourceUrl(url) {
			if (/^https:\/\/\S+$/u.test(url)) return true;
			if (!/^http:\/\/\S+$/u.test(url)) return false;
			try {
				const host = new URL(url).hostname.toLowerCase();
				if (host === "localhost" || host === "::1" || host === "[::1]") return true;
				if (/^127\.\d+\.\d+\.\d+$/u.test(host)) return true;
				if (/^10\.\d+\.\d+\.\d+$/u.test(host)) return true;
				if (/^192\.168\.\d+\.\d+$/u.test(host)) return true;
				if (/^169\.254\.\d+\.\d+$/u.test(host)) return true;
				const m = host.match(/^172\.(\d+)\.\d+\.\d+$/u);
				if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
				if (/^[0-9a-f]{1,4}(?::[0-9a-f]{1,4}){2,7}$/iu.test(host)) return true;
				return false;
			} catch {
				return false;
			}
		}
		function PluginConsoleTab({ t }) {
			const [state, setState] = react.useState({ status: "loading" });
			const [busy, setBusy] = react.useState(null);
			const [message, setMessage] = react.useState(null);
			const [reloadHint, setReloadHint] = react.useState(false);
			const [restartHint, setRestartHint] = react.useState(false);
			const [jobs, setJobs] = react.useState({});
			const [query, setQuery] = react.useState("");
			const [market, setMarket] = react.useState(null);
			const [marketPage, setMarketPage] = react.useState(1);
			const [loadingMore, setLoadingMore] = react.useState(false);
			const [repoInfo, setRepoInfo] = react.useState(null);
			const [subpackages, setSubpackages] = react.useState(null);
			const [installing, setInstalling] = react.useState(null);
			const [details, setDetails] = react.useState(null);
			// 已安装插件"检测更新"：null=未检测 / {status:'checking'} / {status:'ready', latest, error}
			const [updateCheck, setUpdateCheck] = react.useState(null);
			// 静态插件索引（dsh-plugin topic 全量浏览）：null=未加载 / {items, skills, loaded}
			const [indexData, setIndexData] = react.useState(null);
			// 索引浏览当前展示条数（分页展示，避免一次渲染 500 条）
			const [indexShown, setIndexShown] = react.useState(50);
			// 市场总模式：'plugins' = 插件市场 / 'skills' = 技能市场（localStorage 持久化）
			const [mode, setMode] = react.useState(() => {
				try { return localStorage.getItem("pc-market-mode") === "skills" ? "skills" : "plugins"; } catch { return "plugins"; }
			});
			// 已安装技能清单（~/.dsh/skills），[{name, dir|file}]，用于技能条目「已装」标记与已安装区展示
			const [installedSkills, setInstalledSkills] = react.useState([]);
			// 原始页面标题（AI 授权标题闪烁后恢复用）
			const originalTitleRef = react.useRef("");
			// 技能删除两步确认：存待确认技能名
			const [confirmSkillDelete, setConfirmSkillDelete] = react.useState(null);
			// 技能停用/启用进行中
			const [togglingSkill, setTogglingSkill] = react.useState(null);
			// 套装安装报告：{ jobId: [{component, type, ok, note}] }
			const [suiteReports, setSuiteReports] = react.useState({});
			// 框架升级提示已关闭（本次会话内）
			const [frameworkNoticeDismissed, setFrameworkNoticeDismissed] = react.useState(false);
			// 进度条已关闭
			const [fwStatusDismissed, setFwStatusDismissed] = react.useState(false);
			// 框架升级：两步确认 + 执行中
			const [confirmFrameworkUpgrade, setConfirmFrameworkUpgrade] = react.useState(false);
			const [frameworkUpgrading, setFrameworkUpgrading] = react.useState(false);
			// 框架升级进度（重连后恢复显示）：{status, message}
			const [frameworkStatus, setFrameworkStatus] = react.useState(null);
			// Hub 自身更新：仅在检测到远程新版时显示下载/更新按钮
			const [selfUpdate, setSelfUpdate] = react.useState(null);
			// 进度条步骤（与 host 脚本 SetState 的阶段对应）
			const FW_STEPS = [
				{ key: "starting", label: t("fwStepBackup") },
				{ key: "stopped", label: t("fwStepStop") },
				{ key: "installing", label: t("fwStepInstall") },
				{ key: "rollback", label: t("fwStepRollback") },
				{ key: "pkg", label: t("fwStepPkg") },
				{ key: "relaunching", label: t("fwStepRelaunch") },
				{ key: "done", label: t("fwStepDone") },
			];
			// 升级进度轮询：页面断开后请求失败自动停止；重连后由挂载恢复逻辑继续
			const fwStatusTimerRef = react.useRef(null);
			const pollFrameworkStatus = () => {
				if (fwStatusTimerRef.current) return;
				fwStatusTimerRef.current = window.setInterval(() => {
					call("/plugin-console/framework-upgrade-status").then(
						(data) => {
							if (data && typeof data.status === "string") {
								setFrameworkStatus(data);
								if (data.status === "done" || data.status === "failed") {
									window.clearInterval(fwStatusTimerRef.current);
									fwStatusTimerRef.current = null;
								}
							}
						},
						() => {}, // 服务断开：轮询失败静默（重连后由挂载逻辑恢复）
					);
				}, 3000);
			};
			// 挂载/重连后恢复升级进度（若上次升级仍在进行/刚完成）
			react.useEffect(() => {
				call("/plugin-console/framework-upgrade-status").then(
					(data) => {
						if (data && typeof data.status === "string" && data.status !== "idle") {
							// 终态（done/failed）且用户此前点过叉号关闭：永久不再恢复显示（localStorage 持久化）
							let dismissedTerminal = null;
							try { dismissedTerminal = localStorage.getItem("pc-fw-dismiss-terminal"); } catch {}
							if (data.status !== dismissedTerminal) {
								setFrameworkStatus(data);
								if (data.status !== "done" && data.status !== "failed") pollFrameworkStatus();
							}
						}
					},
					() => {},
				);
				return () => { if (fwStatusTimerRef.current) { window.clearInterval(fwStatusTimerRef.current); fwStatusTimerRef.current = null; } };
			}, []);
			// 自动版本比对结果：{ fullName: latest }（已安装且有新版）
			const [updateMap, setUpdateMap] = react.useState({});
			const [expandedDescs, setExpandedDescs] = react.useState({});
			const [installedQuery, setInstalledQuery] = react.useState("");
			const [installedSearchOpen, setInstalledSearchOpen] = react.useState(false);
			const [extraOnly, setExtraOnly] = react.useState(true);
			// 点击切换时的高亮闪烁（1.5 秒后渐变回落）
			const [extraFlash, setExtraFlash] = react.useState(false);
			const [officialOnly, setOfficialOnly] = react.useState(false);
			// 多源汇总搜索（GitHub + 全部自定义源并行），localStorage 持久化
			const [multiSource, setMultiSource] = react.useState(() => {
				try { return localStorage.getItem("pc-multi-source") === "1"; } catch { return false; }
			});
			const [confirmDeleteRowId, setConfirmDeleteRowId] = react.useState(null);
			const [deleteBusy, setDeleteBusy] = react.useState(null);
			// AI 兜底开关（默认开启，零费用保障）：关掉后常规通道失败即取消，不调用模型 API
			const [aiFallback, setAiFallback] = react.useState(() => {
				try { return localStorage.getItem("pc-ai-fallback-v2") !== "off"; } catch { return true; }
			});
			const aiAutoDeclinedRef = react.useRef({});
			// 已关闭的失败提示（用户点 × 后不再显示，服务重启后重置）
			const [dismissedFailures, setDismissedFailures] = react.useState({});
			// 软件源管理
			const [sourcesOpen, setSourcesOpen] = react.useState(false);
			const [sourcesData, setSourcesData] = react.useState(null);
			const [sourceName, setSourceName] = react.useState("");
			const [sourceUrl, setSourceUrl] = react.useState("");
			const [sourcesBusy, setSourcesBusy] = react.useState(false);
			// registry 行内编辑
			const [editReg, setEditReg] = react.useState(null);
			// 搜索源列表（内置 + 自定义，来自配置）
			const [searchSourcesList, setSearchSourcesList] = react.useState(null);
			// 自定义搜索源添加表单
			const [searchSourceName, setSearchSourceName] = react.useState("");
			const [searchSourceUrl, setSearchSourceUrl] = react.useState("");
			// 自定义源请求头（每行 "名称: 值"，保存时解析）
			const [searchSourceHeaders, setSearchSourceHeaders] = react.useState("");
			// Gitee OAuth
			const [giteeClientId, setGiteeClientId] = react.useState("");
			const [giteeClientSecret, setGiteeClientSecret] = react.useState("");
			// 派生：Gitee 登录状态
			const giteeStatus = sourcesData !== null
				? { clientConfigured: !!sourcesData.gitee?.clientConfigured, hasToken: !!sourcesData.gitee?.hasToken, login: sourcesData.gitee?.login ?? "" }
				: null;
			// 搜索源（默认 GitHub；点击登录标切换），localStorage 持久化
			const [searchSource, setSearchSource] = react.useState(() => {
				try { const s = localStorage.getItem("pc-search-source"); return s === "gitee" ? s : "github"; } catch { return "github"; }
			});
			const [sourceMenuOpen, setSourceMenuOpen] = react.useState(false);
			// "不再提醒"：勾选后 AI 兜底自动同意，不再弹窗（可在市场底部恢复提醒）
			const [aiRemember, setAiRemember] = react.useState(() => {
				try { return localStorage.getItem("pc-ai-remember") === "1"; } catch { return false; }
			});
			const [showBackTop, setShowBackTop] = react.useState(false);
			const [marketCollapsed, setMarketCollapsed] = react.useState(false);
			// 下滑超过搜索框顶部时浮现"回到搜索"↑按钮
			react.useEffect(() => {
				const onScroll = () => {
					const node = document.getElementById("pc-market-search");
					setShowBackTop(node ? node.getBoundingClientRect().top < -24 : false);
				};
				window.addEventListener("scroll", onScroll, true);
				window.addEventListener("resize", onScroll);
				onScroll();
				return () => {
					window.removeEventListener("scroll", onScroll, true);
					window.removeEventListener("resize", onScroll);
				};
			}, []);
			// 挂载时拉取软件源配置（搜索源菜单用，含自定义源）
			react.useEffect(() => {
				call("/plugin-console/sources").then(
					(data) => setSearchSourcesList(data.sources.searchSources ?? []),
					() => {},
				);
			}, []);
			// 挂载时加载静态插件索引（GitHub 源空查询时秒开浏览，零 API 调用）
			react.useEffect(() => {
				call("/plugin-console/market-index").then(
					(data) => { if (data && Array.isArray(data.items)) setIndexData({ items: data.items, skills: Array.isArray(data.skills) ? data.skills : [], loaded: true }); },
					() => {},
				);
			}, []);
			// 挂载时记录原始标题（AI 授权标题闪烁后恢复用）
			react.useEffect(() => {
				try { originalTitleRef.current = document.title; } catch {}
			}, []);
			// 挂载时拉取已安装技能清单（技能条目「已装」标记用）
			react.useEffect(() => {
				call("/plugin-console/skills-installed").then(
					(data) => { if (data && Array.isArray(data.skills)) setInstalledSkills(data.skills); },
					() => {},
				);
			}, []);
			// 自动版本比对：市场数据中已安装的条目，后台查 registry 最新版，有新版则卡片显示「更新」。
			// 官方框架组件（@deepseek-ai/* 且 repository 指向 deepseek-harness）随框架版本配套发布，
			// 单独更新会版本混搭——排除；且必须 latest !== 已装版本才显示（避免恒显示「更新」）。
			react.useEffect(() => {
				if (market === null || market.status !== "ready" || state.status !== "ready") return;
				const matched = market.data
					.map((item) => ({
						item,
						entry: state.data.entries.find((candidate) =>
							(candidate.repository && candidate.repository.includes(item.fullName.toLowerCase()))
							|| moduleShortName(candidate.moduleName) === item.fullName.toLowerCase().split("/")[1]),
					}))
					.filter(({ entry }) => entry !== undefined && entry.moduleName !== undefined)
					// 排除官方框架组件：@deepseek-ai/* 且仓库指向 deepseek-harness（框架本体及其配套子包）
					.filter(({ entry }) => !(entry.repository && entry.repository.includes("deepseek-ai/deepseek-harness")
						&& String(entry.moduleName).startsWith("@deepseek-ai/")))
					.slice(0, 6);
				// 框架本体特判：deepseek-harness 仓库 → 查 @deepseek-ai/dsh（框架包）版本，
				// 有新版则卡片显示「框架升级 → vX」（点击走 /framework-upgrade：备份配置 + 升级指引 + 适配）
				const fwItem = market.data.find((item) => item.fullName === "deepseek-ai/deepseek-harness");
				if (fwItem) {
					call("/plugin-console/check-update", { packageName: "@deepseek-ai/dsh" }).then(
						(data) => {
							if (data && data.error === null) {
								const current = state.data.compat?.dshVersion ?? "";
								// 通用 semver 比较（支持 0.1.0-rc.8 → 0.1.1-rc.2 跨 minor 升级；0.1.1-rc.N 不再写死 0.1.0）
								const verNum = (v) => {
									const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)(?:-(?:[a-z]+\.)?(\d+))?$/iu);
									if (!m) return -1;
									const [ , maj, min, pat, rc ] = m;
									// 正式版（无 rc）视为 rc.∞：0.1.1 > 0.1.1-rc.2
									return { maj: parseInt(maj, 10), min: parseInt(min, 10), pat: parseInt(pat, 10), rc: rc === undefined ? Number.POSITIVE_INFINITY : parseInt(rc, 10) };
								};
								const isNewer = (a, b) => {
									if (a === -1 || b === -1) return false;
									if (a.maj !== b.maj) return a.maj > b.maj;
									if (a.min !== b.min) return a.min > b.min;
									if (a.pat !== b.pat) return a.pat > b.pat;
									return a.rc > b.rc;
								};
								// 稳定版 latest 优先；latest 不高于当前而 next（预发布渠道）更高时，目标取 next
								const target = data.latest && isNewer(verNum(data.latest), verNum(current))
									? data.latest
									: (data.next && isNewer(verNum(data.next), verNum(current)) ? data.next : null);
								if (target) setUpdateMap((prev) => ({ ...prev, [fwItem.fullName]: target }));
							}
						},
						() => {},
					);
				}
				if (matched.length === 0) return;
				let done = 0;
				const run = () => {
					if (done >= matched.length) return;
					const { item, entry } = matched[done];
					done += 1;
					call("/plugin-console/check-update", { packageName: entry.moduleName }).then(
						(data) => {
							if (data && data.latest && data.error === null && data.latest !== entry.version) {
								setUpdateMap((prev) => ({ ...prev, [item.fullName]: data.latest }));
							}
						},
						() => {},
					).then(run, run);
				};
				run();
			}, [market, state]);
			// Hub 自身更新检测：只在远程 npm 有更新时显示按钮
			react.useEffect(() => {
				if (state.status !== "ready") return;
				const current = state.data.selfVersion ?? null;
				if (!current) return;
				call("/plugin-console/check-update", { packageName: "@noob-stupid/dsh-plugin-console" }).then(
					(data) => {
						if (data && data.error === null && typeof data.latest === "string" && data.latest !== current) {
							setSelfUpdate({ latest: data.latest });
						} else {
							setSelfUpdate(null);
						}
					},
					() => setSelfUpdate(null),
				);
			}, [state]);
			// 搜索源菜单：点击外部收起
			react.useEffect(() => {
				if (!sourceMenuOpen) return;
				const onDown = (event) => {
					const area = document.getElementById("pc-ghwrap");
					if (area && !area.contains(event.target)) setSourceMenuOpen(false);
				};
				document.addEventListener("mousedown", onDown);
				return () => document.removeEventListener("mousedown", onDown);
			}, [sourceMenuOpen]);
			// 已安装搜索：点击搜索区以外且无内容时立即收起（无延迟）
			react.useEffect(() => {
				if (!installedSearchOpen) return;
				const onDown = (event) => {
					const area = document.getElementById("pc-installed-search-area");
					if (area && !area.contains(event.target) && installedQuery.trim() === "") {
						setInstalledSearchOpen(false);
					}
				};
				document.addEventListener("mousedown", onDown);
				return () => document.removeEventListener("mousedown", onDown);
			}, [installedSearchOpen, installedQuery]);
			const refresh = react.useCallback(() => {
				setState((prev) => ({ ...prev, status: "loading" }));
				call("/plugin-console/state").then(
					(data) => {
						setState({ status: "ready", data });
						// 恢复进行中的安装任务轮询（离开面板再回来也能看到进度）
						for (const job of data.installJobs ?? []) {
							setJobs((prev) => ({ ...prev, [job.jobId]: job }));
							pollJob(job.jobId);
						}
					},
					() => setState({ status: "error" }),
				);
			}, []);
			react.useEffect(() => { refresh(); }, [refresh]);
			const loadDetails = (entry) => {
				if (details !== null && details.entryId === entry.entryId) {
					setDetails(null);
					setUpdateCheck(null);
					return;
				}
				setDetails({ entryId: entry.entryId, status: "loading" });
				setUpdateCheck(null);
				call("/plugin-console/details", { entryId: entry.entryId }).then(
					(data) => setDetails({ entryId: entry.entryId, status: "ready", data }),
					(error) => setDetails({ entryId: entry.entryId, status: "error", error }),
				);
			};
			const checkUpdate = (entry) => {
				const pkgName = entry.moduleName;
				setUpdateCheck({ status: "checking" });
				call("/plugin-console/check-update", { packageName: pkgName }).then(
					(data) => setUpdateCheck({ status: "ready", latest: data.latest ?? null, source: data.source ?? "npm", error: data.error ?? null }),
					(error) => setUpdateCheck({ status: "ready", latest: null, source: "npm", error: friendlyGithubError(error).message }),
				);
			};
			const toggle = (entry, enabled) => {
				setBusy(entry.entryId);
				setMessage(null);
				call("/plugin-console/toggle", { entryId: entry.entryId, enabled }).then(
					() => {
						setMessage(t(enabled ? "toggledOn" : "toggledOff") + "：" + entry.entryId + "。" + t("autoReload"));
						// HMR 应用补丁后自动强刷页面，让客户端插件的挂载/卸载即时可见
						window.setTimeout(() => window.location.reload(), 1500);
					},
					(error) => setMessage(t("failed") + "：" + friendlyGithubError(error).message),
				).finally(() => setBusy(null));
			};
			const search = () => {
				setMarket({ status: "loading" });
				setRepoInfo(null);
				setMarketPage(1);
				// 技能模式：仅 GitHub 源；空查询 → 技能静态索引（秒开），非空 → 服务端三 topic 合并检索
				if (mode === "skills") {
					if (searchSource !== "github" || multiSource) {
						setMarket({ status: "error", error: new Error(t("skillsGithubOnly")) });
						return;
					}
					if (query.trim() === "" && indexData !== null && indexData.loaded) {
						setMarket({ status: "ready", data: indexData.skills.slice(0, indexShown), direct: false, source: "github", fromIndex: true });
						return;
					}
					call("/plugin-console/search", { q: query, page: 1, skills: true }).then(
						(data) => { setMarket({ status: "ready", data: data.items, direct: false, source: "github", skills: true }); },
						(error) => setMarket({ status: "error", error: friendlyGithubError(error) }),
					);
					return;
				}
				// 静态索引浏览：GitHub 源 + 空查询时展示 dsh-plugin topic 全量索引（秒开、零 API 调用）
				if (searchSource === "github" && !multiSource && query.trim() === "" && indexData !== null && indexData.loaded) {
					setMarket({ status: "ready", data: indexData.items.slice(0, indexShown), direct: false, source: "github", fromIndex: true });
					return;
				}
				if (multiSource) {
					// 多源汇总：GitHub + 全部自定义源并行（服务端合并，自带标记）
					call("/plugin-console/search", { q: query, page: 1, multi: true }).then(
						(data) => {
							setMarket({ status: "ready", data: data.items, direct: false, source: "all", multi: true });
						},
						(error) => setMarket({ status: "error", error: friendlyGithubError(error) }),
					);
					return;
				}
				if (searchSource !== "github") {
					// Gitee / 自定义源：走服务端平台检索（浏览器直连通道对这些平台不可靠）
					call("/plugin-console/search", { q: query, page: 1, source: searchSource }).then(
						(data) => {
							setMarket({ status: "ready", data: data.items, direct: false, source: searchSource });
							enrichOfficialBundle(data.items).then((enriched) => {
								setMarket((m) => (m !== null && m.status === "ready" ? { ...m, data: enriched } : m));
							});
						},
						(error) => setMarket({ status: "error", error: friendlyGithubError(error) }),
					);
					return;
				}
				searchFromGithub(query, 1).then(
					(data) => {
						// 秒出直连数据
						setMarket({ status: "ready", data, direct: true });
						// 并行补标记：
						// ① 客户端浏览器直连读根包 package.json（快，官方/聚合标记立即可筛）
						enrichOfficialBundle(data).then((enriched) => {
							setMarket((m) => (m !== null && m.status === "ready" ? { ...m, data: enriched } : m));
						});
						// ② 服务端 curl 双通道 enrich（聚合子包 dsh.bundle 检查 → aggregateInstallable），后台补更精确标记
						call("/plugin-console/enrich", { items: data }).then(
							(r) => { if (r && Array.isArray(r.items)) setMarket((m) => (m !== null && m.status === "ready" ? { ...m, data: r.items } : m)); },
							() => {},
						);
					},
					() => call("/plugin-console/search", { q: query, page: 1 }).then(
						(data) => {
							const items = data.items;
							setMarket({ status: "ready", data: items, direct: false });
							enrichOfficialBundle(items).then((enriched) => {
								setMarket((m) => (m !== null && m.status === "ready" ? { ...m, data: enriched } : m));
							});
						},
						(error) => setMarket({ status: "error", error: friendlyGithubError(error) }),
					),
				);
			};
			const loadMore = () => {
				if (loadingMore || market === null || market.status !== "ready") return;
				const next = marketPage + 1;
				setLoadingMore(true);
				setMarketPage(next);
				if (mode === "skills" && !market.fromIndex) {
					// 技能搜索分页：服务端三 topic 合并（skills: true）
					call("/plugin-console/search", { q: query, page: next, skills: true }).then(
						(data) => {
							const merged = [...market.data, ...data.items];
							const seen = new Set();
							const deduped = [];
							for (const item of merged) {
								if (seen.has(item.fullName)) continue;
								seen.add(item.fullName);
								deduped.push(item);
							}
							setMarket({ status: "ready", data: deduped, direct: false, source: "github", skills: true });
							setLoadingMore(false);
						},
						(error) => {
							setLoadingMore(false);
							setMessage(t("failed") + "：" + friendlyGithubError(error).message);
						},
					);
					return;
				}
				if (market.fromIndex === true && indexData !== null) {
					// 索引浏览：本地继续展示更多（技能模式浏览技能索引段）
					const sourceData = mode === "skills" ? indexData.skills : indexData.items;
					const more = sourceData.slice(0, indexShown + next * 50);
					setMarket({ status: "ready", data: more, direct: false, source: "github", fromIndex: true });
					setIndexShown(indexShown + next * 50);
					setLoadingMore(false);
					return;
				}
				if (multiSource) {
					call("/plugin-console/search", { q: query, page: next, multi: true }).then(
						(data) => {
							setMarket({ status: "ready", data: [...market.data, ...data.items], direct: false, source: "all", multi: true });
							setLoadingMore(false);
						},
						(error) => {
							setLoadingMore(false);
							setMessage(t("failed") + "：" + friendlyGithubError(error).message);
						},
					);
					return;
				}
				if (searchSource !== "github") {
					call("/plugin-console/search", { q: query, page: next, source: searchSource }).then(
						(data) => {
							setMarket({ status: "ready", data: [...market.data, ...data.items], direct: false, source: searchSource });
							setLoadingMore(false);
							enrichOfficialBundle(data.items).then((enriched) => {
								setMarket((m) => (m !== null && m.status === "ready"
									? { ...m, data: [...m.data.slice(0, m.data.length - enriched.length), ...enriched] }
									: m));
							});
						},
						(error) => {
							setLoadingMore(false);
							setMessage(t("failed") + "：" + friendlyGithubError(error).message);
						},
					);
					return;
				}
				searchFromGithub(query, next).then(
					(data) => {
						setMarket({ status: "ready", data: [...market.data, ...data], direct: true });
						setLoadingMore(false);
						// 并行补标记：客户端快速（根包）+ 服务端完整（子包检查）
						enrichOfficialBundle(data).then((enriched) => {
							setMarket((m) => (m !== null && m.status === "ready"
								? { ...m, data: [...m.data.slice(0, m.data.length - enriched.length), ...enriched] }
								: m));
						});
						call("/plugin-console/enrich", { items: data }).then(
							(r) => {
								if (r && Array.isArray(r.items)) {
									setMarket((m) => (m !== null && m.status === "ready"
										? { ...m, data: [...m.data.slice(0, m.data.length - r.items.length), ...r.items] }
										: m));
								}
							},
							() => {},
						);
					},
					() => call("/plugin-console/search", { q: query, page: next }).then(
						(data) => {
							setMarket({ status: "ready", data: [...market.data, ...data.items], direct: false });
							setLoadingMore(false);
							enrichOfficialBundle(data.items).then((enriched) => {
								setMarket((m) => (m !== null && m.status === "ready"
									? { ...m, data: [...m.data.slice(0, m.data.length - enriched.length), ...enriched] }
									: m));
							});
						},
						(error) => {
							setLoadingMore(false);
							setMessage(t("failed") + "：" + friendlyGithubError(error).message);
						},
					),
				);
			};
			const loadSubpackages = (repo, branch) => {
				setSubpackages({ status: "loading" });
				fetchSubpackages(repo, branch).then(
					(list) => setSubpackages({ status: "ready", list }),
					() => call("/plugin-console/subpackages", { repo, branch }).then(
						(data) => setSubpackages({ status: "ready", list: data.subpackages ?? [] }),
						() => setSubpackages({ status: "error" }),
					),
				);
			};
			const inspect = (item) => {
				const repo = item.fullName;
				setRepoInfo({ status: "loading", repo });
				setSubpackages(null);
				if (item.source !== undefined && item.source !== "github") {
					// 非 GitHub 平台：用平台 raw 直接读详情（无 trees/子包能力）
					repoInfoFromPlatform(item).then(
						(data) => setRepoInfo({ status: "ready", repo, data, direct: true, source: item.source }),
						() => setRepoInfo({ status: "error", repo, error: new Error(t("repoError")) }),
					);
					return;
				}
				repoInfoFromGithub(repo, item).then(
					(data) => {
						if (item.hasSkill === true) data.hasSkill = true;
						if (Array.isArray(item.skillTopics)) data.skillTopics = item.skillTopics;
						if (item.hasSuite === true) {
							data.hasSuite = true;
							// 立即本地拼官方安装命令（不等服务端后台补拉），手动安装引导即时可见
							if (!data.installCommand) {
								const short = repo.split("/")[1] ?? repo;
								data.installCommand = "git -c http.sslVerify=false clone --recurse-submodules https://github.com/" + repo + ".git\ncd " + short + "\npowershell -ExecutionPolicy Bypass -File install.ps1";
							}
						}
						setRepoInfo({ status: "ready", repo, data, direct: true });
						if (data.privateRoot || !data.hasPackageJson) loadSubpackages(repo, data.defaultBranch);
						// 浏览器直连只读 package.json/README/SKILL.md：后台补拉服务端增强字段
						// （hasSuite / installCommand 官方安装方式），不阻塞详情显示
						call("/plugin-console/repo", { repo }).then(
							(d) => {
								if (d && d.ok === true) {
									setRepoInfo((prev) => (prev !== null && prev.repo === repo && prev.status === "ready"
										? { ...prev, data: {
											...prev.data,
											hasSuite: d.hasSuite === true,
											installCommand: d.installCommand ?? null,
										} }
										: prev));
								}
							},
							() => {},
						);
					},
					() => call("/plugin-console/repo", { repo }).then(
						(data) => {
							if (item.hasSkill === true) data.hasSkill = true;
							if (Array.isArray(item.skillTopics)) data.skillTopics = item.skillTopics;
							if (item.hasSuite === true) data.hasSuite = true;
							setRepoInfo({ status: "ready", repo, data, direct: false });
							if (data.privateRoot || !data.hasPackageJson) loadSubpackages(repo, data.defaultBranch);
						},
						(error) => setRepoInfo({ status: "error", repo, error: friendlyGithubError(error) }),
					),
				);
			};
			/** 后台安装任务：/install 立即返回 jobId，轮询 /install-status 更新进度。 */
			const jobTimersRef = react.useRef({});
			const stopJobPolling = (jobId) => {
				if (jobTimersRef.current[jobId]) {
					window.clearInterval(jobTimersRef.current[jobId]);
					delete jobTimersRef.current[jobId];
				}
			};
			const pollJob = (jobId) => {
				if (jobTimersRef.current[jobId]) return;
				jobTimersRef.current[jobId] = window.setInterval(() => {
					call("/plugin-console/install-status", { jobId }).then(
						(data) => {
							setJobs((prev) => ({ ...prev, [jobId]: data }));
							// 需要用户授权时（面板页后台/失焦也能看到）：系统通知 + 标题闪烁提示
							if (data.status === "installing" && data.stage === "ai-consent" && aiFallback && !aiRemember && !aiAutoDeclinedRef.current[jobId]) {
								aiAutoDeclinedRef.current[jobId] = true;
								const who = data.packageName ?? data.repo ?? "";
								try {
									const title = t("aiConsentNotifyTitle");
									if ("Notification" in window && Notification.permission === "granted") {
										new Notification(title, { body: who + "：" + t("aiConsentText").slice(0, 80) + "…", tag: "dsh-ai-consent" });
									} else if ("Notification" in window && Notification.permission === "default") {
										Notification.requestPermission().then((p) => {
											if (p === "granted") new Notification(title, { body: who + "：" + t("aiConsentText").slice(0, 80) + "…", tag: "dsh-ai-consent" });
										});
									}
								} catch {}
								try {
									document.title = "⚠ " + t("aiConsentNotifyTitle") + " - " + who;
								} catch {}
							}
							// AI 兜底已关闭：遇到授权等待态自动取消（零费用，不弹窗）
							if (data.status === "installing" && data.stage === "ai-consent" && !aiFallback && !aiAutoDeclinedRef.current[jobId]) {
								aiAutoDeclinedRef.current[jobId] = true;
								aiConsent(jobId, false);
							}
							// 用户勾选"不再提醒"：自动同意 AI 兜底（已预先授权，可能产生费用）
							if (data.status === "installing" && data.stage === "ai-consent" && aiFallback && aiRemember && !aiAutoDeclinedRef.current[jobId]) {
								aiAutoDeclinedRef.current[jobId] = true;
								aiConsent(jobId, true);
							}
							if (data.status !== "installing") {
								stopJobPolling(jobId);
								if (data.status === "done") {
									if (data.kind === "skill") {
										// 技能安装：不写补丁、无需重启/刷新页面；提示 + 刷新已装技能清单
										setMessage(t("skillInstalledMsg") + "：" + (data.skillName ?? "") + "。" + (data.skillNote ?? t("skillInstallNote")));
										call("/plugin-console/skills-installed").then(
											(d) => { if (d && Array.isArray(d.skills)) setInstalledSkills(d.skills); },
											() => {},
										);
									} else if (data.kind === "suite") {
										// 套装安装：保存组件报告；有 bundle 组件需重启，否则刷新页面
										if (Array.isArray(data.suiteReport)) setSuiteReports((prev) => ({ ...prev, [jobId]: data.suiteReport }));
										setMessage(t("suiteInstalledMsg") + "：" + (data.suiteNote ?? ""));
										if ((data.suiteReport ?? []).some((r) => r.type === "bundle" && r.ok)) {
											setRestartHint(true);
										} else {
											setReloadHint(true);
											window.setTimeout(() => window.location.reload(), 2500);
										}
									} else if (data.ai === true) {
										setMessage(t("installed") + "：" + data.packageName + "。" + (data.aiNote ?? t("aiRepaired")));
									} else {
										setMessage(t("installed") + "：" + data.packageName + "（" + (data.entryId ?? "") + "）。" + (data.curlNote ?? (data.bundle ? t("bundleNote") : t("installNote"))) + (data.bundleNote ? "。" + data.bundleNote : ""));
									}
									if (data.kind === "skill") {
										// 技能无需页面刷新
										setInstalling(null);
										setTimeout(refresh, 500);
										return;
									}
									if (data.bundle) {
										setRestartHint(true);
									} else {
										// 安装成功：自动刷新页面，让插件立即出现在列表里（可见的成功反馈）
										setReloadHint(true);
										window.setTimeout(() => window.location.reload(), 2500);
									}
								} else {
									setMessage(t("failed") + "：" + (data.error ?? "未知错误"));
								}
								setInstalling(null);
								setTimeout(refresh, 1500);
							}
						},
						() => {},
					);
				}, 2000);
			};
			/** 本地 AI 兜底授权：调用模型 API 产生费用，必须用户明确同意。 */
			const aiConsent = (jobId, approved) => {
				call("/plugin-console/ai-consent", { jobId, approved }).then(
					() => { if (!approved) setMessage(t("failed") + "：已取消本地 AI 兜底（不会调用模型 API）"); },
					(error) => setMessage(t("failed") + "：" + friendlyGithubError(error).message),
				);
			};
			/** 软件源管理：打开时拉取当前配置。 */
			const openSources = () => {
				setSourcesOpen(true);
				call("/plugin-console/sources").then(
					(data) => {
						setSourcesData(data.sources);
						setSearchSourcesList(data.sources.searchSources ?? []);
						setGiteeClientId(data.sources.gitee?.clientId ?? "");
						// 安全：secret 永不回传（服务端已脱敏）；已配置时留空、保存需重新输入，
						// 未配置时为空表单引导首次填写
						setGiteeClientSecret("");
					},
					(error) => { setSourcesOpen(false); setMessage(t("failed") + "：" + friendlyGithubError(error).message); },
				);
			};
			const saveGiteeSetup = () => {
				// clientId 打码回显（如 abc12345…）：用户未修改时原样传回服务端，服务端识别打码标记保留原配置
				const idValue = giteeClientId.trim();
				if (!idValue || !giteeClientSecret.trim()) {
					setMessage(t("failed") + "：client_id / client_secret 不能为空");
					return;
				}
				if (idValue.endsWith("…")) {
					sourcesAction({ action: "gitee-setup", clientId: "", clientSecret: giteeClientSecret.trim(), keepClientId: true });
				} else {
					sourcesAction({ action: "gitee-setup", clientId: idValue, clientSecret: giteeClientSecret.trim() });
				}
			};
			const startGiteeOauth = () => {
				call("/plugin-console/gitee-oauth-url").then(
					(data) => { if (data && data.url) window.open(data.url, "_blank", "noopener"); },
					(error) => setMessage(t("failed") + "：" + friendlyGithubError(error).message),
				);
			};
			const sourcesAction = (payload, done) => {
				setSourcesBusy(true);
				call("/plugin-console/sources", payload).then(
					(data) => {
						setSourcesData(data.sources);
						setSearchSourcesList(data.sources.searchSources ?? []);
						setMessage(t("sourcesUpdated"));
						if (done) done();
					},
					(error) => setMessage(t("failed") + "：" + friendlyGithubError(error).message),
				).finally(() => setSourcesBusy(false));
			};
			const addSource = () => {
				if (!isAllowedSourceUrl(sourceUrl.trim())) {
					setMessage(t("failed") + "：" + t("invalidSourceUrl"));
					return;
				}
				sourcesAction({ action: "add", name: sourceName.trim(), url: sourceUrl.trim() }, () => { setSourceName(""); setSourceUrl(""); });
			};
			const saveEditReg = () => {
				if (editReg === null) return;
				sourcesAction({ action: "edit", id: editReg.id, name: editReg.name, url: editReg.url }, () => setEditReg(null));
			};
			const addSearchSource = () => {
				if (!isAllowedSourceUrl(searchSourceUrl.trim()) || !searchSourceUrl.includes("{q}")) {
					setMessage(t("failed") + "：" + t("invalidSearchUrl"));
					return;
				}
				// 解析请求头：每行 "名称: 值"
				const headers = searchSourceHeaders.split("\n")
					.map((line) => line.trim())
					.filter((line) => line !== "")
					.map((line) => {
						const idx = line.indexOf(":");
						if (idx <= 0) return null;
						return { name: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
					})
					.filter((h) => h !== null);
				sourcesAction(
					{ action: "add-search", name: searchSourceName.trim(), url: searchSourceUrl.trim(), headers },
					() => { setSearchSourceName(""); setSearchSourceUrl(""); setSearchSourceHeaders(""); },
				);
			};
			const startJob = (repo, packageName, source = "github", kind = "plugin") => {
				// 防并发（与 addLocal 一致）：已有安装/更新进行中时忽略新点击（更新按钮此前可绕过，
				// 反复点击会产生几十个并发任务装同一插件）
				if (installing !== null) {
					setMessage(t("installBusy"));
					return;
				}
				setInstalling(repo || packageName);
				setReloadHint(false);
				setRestartHint(false);
				setMessage(null);
				call("/plugin-console/install", { repo: repo ?? "", packageName, source, kind }).then(
					(data) => {
						if (data && data.jobId) {
							setJobs((prev) => ({
								...prev,
								[data.jobId]: { jobId: data.jobId, repo, source, packageName, kind, status: "installing", stage: "preparing", startedAt: Date.now() },
							}));
							pollJob(data.jobId);
						}
					},
					(error) => {
						setMessage(t("failed") + "：" + friendlyGithubError(error).message);
						setInstalling(null);
					},
				);
			};
			/** 技能安装：git clone 仓库 → 复制 SKILL.md 到 ~/.dsh/skills/<name>/（不写 cordis 补丁、无需重启）。 */
			const startSkillJob = (item) => {
				if (installing !== null) return;
				startJob(item.fullName, null, item.source ?? "github", "skill");
			};
			/** 套装安装：submodule 聚合仓库（照 install.ps1 语义装配子模块组件）。 */
			const startSuiteJob = (item) => {
				if (installing !== null) return;
				startJob(item.fullName, null, item.source ?? "github", "suite");
			};
			// 卸载时清理轮询定时器；页面回到前台时恢复标题（AI 授权提示后）
			react.useEffect(() => {
				const onVisible = () => {
					if (document.visibilityState === "visible") {
						try { document.title = originalTitleRef.current; } catch {}
					}
				};
				document.addEventListener("visibilitychange", onVisible);
				return () => {
					document.removeEventListener("visibilitychange", onVisible);
					for (const timer of Object.values(jobTimersRef.current)) window.clearInterval(timer);
				};
			}, []);
			/** 搜索结果卡片上的"添加到本地"：直接启动安装任务（服务端解析包名与类型），
			 * 点击立即出现进度卡片——不再先浏览器取包名（黑洞期直连失败会拖到 40s 无反馈）。
			 * 技能条目走技能通道，套装条目走套装通道。 */
			const addLocal = (item) => {
				if (installing !== null) return;
				setInstalling(item.fullName);
				setMessage(null);
				if (item.fullName === "deepseek-ai/deepseek-harness") {
					// 框架本体：不提供安装（服务端也会拦截）；升级请用卡片「框架升级」流程
					setMessage(t("frameworkUseUpgrade"));
					setInstalling(null);
					return;
				}
				if (item.hasSkill === true || item.skillTopics !== undefined) {
					// 没有 npm 包但有 SKILL.md：按技能安装（clone → ~/.dsh/skills）
					startSkillJob(item);
					return;
				}
				if (item.hasSuite === true) {
					// submodule 聚合套装：走套装安装通道（clone → 子模块按类型装配）
					startSuiteJob(item);
					return;
				}
				if (item.subpackagePath && typeof item.packageName === "string" && item.packageName !== "") {
					// monorepo 子包：搜索结果带 packageName，按 npm 包名安装
					startJob(item.fullName, item.packageName, item.source ?? "github");
					return;
				}
				startJob(item.fullName, null, item.source ?? "github");
			};
			/** 停用/启用已安装技能（写入官方调用策略 frontmatter，可逆）。 */
			const doToggleSkill = (name, enabled) => {
				setTogglingSkill(name);
				call("/plugin-console/skill-toggle", { name, enabled }).then(
					() => {
						setMessage((enabled ? t("skillEnabledMsg") : t("skillToggledMsg")) + "：" + name);
						setConfirmSkillDelete(null);
						setTogglingSkill(null);
						setInstalledSkills((prev) => prev.map((s) => (s.name === name ? { ...s, disabled: !enabled } : s)));
					},
					(error) => {
						setTogglingSkill(null);
						setMessage(t("failed") + "：" + friendlyGithubError(error).message);
					},
				);
			};
			/** 复制安装命令到剪贴板（navigator.clipboard + 兼容兜底）。 */
			const copyInstallCommand = (cmd) => {
				const done = () => setMessage(t("copiedInstallCmd"));
				const fallback = () => {
					try {
						const ta = document.createElement("textarea");
						ta.value = cmd;
						ta.style.position = "fixed";
						ta.style.opacity = "0";
						document.body.appendChild(ta);
						ta.select();
						const ok = document.execCommand("copy");
						document.body.removeChild(ta);
						if (ok) done();
					} catch {}
				};
				try {
					if (navigator.clipboard && navigator.clipboard.writeText) {
						navigator.clipboard.writeText(cmd).then(done, fallback);
					} else fallback();
				} catch { fallback(); }
			};
			/** 框架升级：Hub 打包备份现有配置 + 版本检测 + 升级脚本（脚本会自行停止/拉起服务，无需手动重启）。 */
			const doFrameworkUpgrade = () => {
				setFrameworkUpgrading(true);
				call("/plugin-console/framework-upgrade", {}).then(
					(data) => {
						setFrameworkUpgrading(false);
						setConfirmFrameworkUpgrade(false);
						if (data && data.ok === true) {
							// 新一轮升级开始：清除上次终态关闭标记（卡片恢复显示）
							try { localStorage.removeItem("pc-fw-dismiss-terminal"); } catch {}
							setMessage(t("frameworkUpgradeDone")
								+ (data.hasUpdate === true ? "：" + (data.current ?? "?") + " → " + (data.target ?? data.latest ?? "?") : (data.registryError ? t("frameworkUpgradeCheckFailed") : t("frameworkUpgradeUpToDate")))
								+ "。备份：" + (data.backupDir ?? "") + "。" + (Array.isArray(data.hints) ? data.hints.join(" ") : ""));
							// 升级脚本会自行停止→升级→拉起服务：不显示手动重启按钮（避免升级中途被干扰）
							setRestartHint(false);
							setReloadHint(false);
							// 启动进度条轮询（服务断开前能看到前几步；重连后自动恢复）
							setFrameworkStatus({ status: "starting", message: t("fwStepBackup") });
							pollFrameworkStatus();
						}
					},
					(error) => {
						setFrameworkUpgrading(false);
						setConfirmFrameworkUpgrade(false);
						setMessage(t("failed") + "：" + friendlyGithubError(error).message);
					},
				);
			};
			/** 删除已安装技能（~/.dsh/skills/<name> 目录），两步确认防误删。 */
			const doRemoveSkill = (name) => {
				call("/plugin-console/skill-remove", { name }).then(
					() => {
						setMessage(t("skillDeletedMsg") + "：" + name);
						setConfirmSkillDelete(null);
						setInstalledSkills((prev) => prev.filter((s) => s.name !== name));
					},
					(error) => setMessage(t("failed") + "：" + friendlyGithubError(error).message),
				);
			};
			const installedQueryNorm = installedQuery.trim().toLowerCase();
			// 当前搜索源的展示名（内置 + 自定义）
			const sourceDisplayName = (source) => source === "github"
				? "GitHub"
				: source === "gitee"
					? "Gitee"
					: ((searchSourcesList !== null ? searchSourcesList.find((s) => s.id === source)?.name : undefined) ?? source);
			const extraIds = new Set((state.status === "ready" ? state.data.patch?.inserts ?? [] : []));
			const extraCount = state.status === "ready" ? state.data.entries.filter((entry) => entry.extra === true || extraIds.has(entry.rowId)).length : 0;
			const rows = state.status === "ready"
				? state.data.entries.filter((entry) => {
					if (extraOnly && !(entry.extra === true || extraIds.has(entry.rowId))) return false;
					if (installedQueryNorm === "") return true;
					return [entry.moduleName, entry.entryId, entry.rowId]
						.some((value) => String(value ?? "").toLowerCase().includes(installedQueryNorm));
				}).map((entry) => {
					const open = details !== null && details.entryId === entry.entryId;
					let detailPanel = null;
					if (open) {
						if (details.status === "loading") {
							detailPanel = el("div", { className: styles.detail },
								el("p", { className: styles.status }, t("loadingDetails")));
						} else if (details.status === "error") {
							detailPanel = el("div", { className: styles.detail },
								el("p", { className: styles.status, "data-error": "true" }, t("failed") + "：" + details.error.message));
						} else {
							const meta = details.data.meta;
							const readme = details.data.readme;
							detailPanel = el("div", { className: styles.detail },
								meta !== null ? el("p", { className: styles.desc }, meta.description ?? t("noDetail")) : null,
								meta !== null && meta.version ? el("div", { className: styles.rowTop },
									el("p", { className: styles.status }, t("versionLabel") + "：" + meta.version),
									el("button", {
										type: "button",
										className: styles.toggle,
										disabled: (updateCheck !== null && updateCheck.status === "checking") || installing === entry.moduleName,
										onClick: () => checkUpdate(entry),
									}, updateCheck !== null && updateCheck.status === "checking" ? t("checkingUpdate") : t("checkUpdate"))) : null,
								updateCheck !== null && updateCheck.status === "ready"
									? (updateCheck.error
										? el("p", { className: styles.status, "data-error": "true" }, t("updateCheckFailed") + "：" + updateCheck.error)
										: (updateCheck.latest && meta !== null && meta.version && updateCheck.latest !== meta.version
											? el("div", null,
												el("div", { className: styles.rowTop },
													el("p", { className: styles.status }, t("updateAvailable") + "：" + meta.version + " → " + updateCheck.latest + (updateCheck.source === "github" ? "（GitHub release）" : "")),
													el("button", {
														type: "button",
														className: styles.toggle,
														disabled: installing === entry.moduleName,
														onClick: () => startJob("", entry.moduleName),
													}, installing === entry.moduleName ? t("installing") : t("updateNow"))),
												Array.isArray(updateCheck.depsOutdated) && updateCheck.depsOutdated.length > 0
													? el("p", { className: styles.status, "data-error": "true" },
														t("depsOutdatedHint") + "：" + updateCheck.depsOutdated.map((d) => `${d.name} ${d.current}→${d.required}`).join("、"))
													: null)
											: el("p", { className: styles.status }, t("upToDate") + (updateCheck.source === "github" ? "（GitHub release 检测）" : ""))))
									: null,
								meta !== null && meta.repository
									? el("p", { className: styles.status }, t("repoLabel") + "：" + String(meta.repository).replace(/^git\+/u, ""))
									: null,
								meta !== null && meta.homepage
									? el("p", { className: styles.status }, t("homepageLabel") + "：" + meta.homepage)
									: null,
								readme !== null && (readme.title || readme.summary)
									? el("div", null,
										el("p", { className: styles.status }, t("readmeLabel") + "："),
										readme.title ? el("strong", null, readme.title + "。") : null,
										readme.summary ? el("p", { className: styles.desc }, readme.summary) : null,
									)
									: meta === null ? el("p", { className: styles.status }, t("noDetail")) : null,
							);
						}
					}
					return el("li", { key: entry.entryId, className: styles.row },
						el("div", { className: styles.rowTop },
							el("strong", { className: styles.name, title: entry.moduleName }, moduleShortName(entry.moduleName)),
							el("span", { className: styles.tag, "data-enabled": entry.enabled ? "true" : "false" },
								t(entry.enabled ? "enabledTag" : "disabledTag")),
							entry.extra === true ? el("span", { className: styles.tag, "data-user": "true" }, t("extraTag")) : null,
							entry.protected ? el("span", { className: styles.tag, "data-user": "true" }, t("protectedTag")) : null,
							entry.userDisabled ? el("span", { className: styles.tag, "data-user": "true" }, t("userDisabledTag")) : null,
							entry.userForced ? el("span", { className: styles.tag, "data-user": "true" }, t("userForcedTag")) : null,
						),
						el("div", { className: styles.meta },
							el("span", { className: styles.phase, "data-phase": entry.fiberPhase ?? "unobserved" },
								phaseLabel(entry.fiberPhase, t)),
							el("code", null, entry.entryId),
						),
						el("div", { className: styles.rowTop, style: { justifyContent: "space-between" } },
							el("div", { className: styles.rowTop },
								el("button", {
									type: "button",
									className: styles.toggle,
									disabled: !entry.toggleable || busy === entry.entryId,
									onClick: () => toggle(entry, !entry.enabled),
								}, busy === entry.entryId ? t("loadingPhase") : t(entry.enabled ? "off" : "on")),
								el("button", {
									type: "button",
									className: styles.toggle,
									onClick: () => loadDetails(entry),
								}, t("details")),
							),
							el("div", { className: styles.rowTop },
								entry.extra === true && entry.rowId !== "plugin-console"
									? el("button", {
										type: "button",
										className: styles.trashBtn,
										title: t("deletePlugin"),
										"aria-label": t("deletePlugin"),
										disabled: deleteBusy === entry.entryId,
										onClick: () => {
											if (confirmDeleteRowId === entry.entryId) {
												setDeleteBusy(entry.entryId);
												call("/plugin-console/uninstall", { entryId: entry.entryId }).then(
													(data) => {
														setConfirmDeleteRowId(null);
														if (data && data.restart === true) {
															setMessage(t("deleteBundleNote") + "：" + (data.packageName ?? "") + (data.uninstallError ? "（包卸载警告：" + data.uninstallError + "）" : ""));
															setRestartHint(true);
														} else {
															setMessage(t("deleteNote") + "：" + (data.packageName ?? "") + (data.uninstallError ? "（包卸载警告：" + data.uninstallError + "）" : ""));
															setTimeout(refresh, 1500);
														}
													},
													(error) => setMessage(t("failed") + "：" + friendlyGithubError(error).message),
												).finally(() => setDeleteBusy(null));
											} else {
												setConfirmDeleteRowId(entry.entryId);
												window.setTimeout(() => setConfirmDeleteRowId((v) => (v === entry.entryId ? null : v)), 3000);
											}
										},
									}, deleteBusy === entry.entryId
										? t("deleting")
										: confirmDeleteRowId === entry.entryId
											? t("confirmDelete")
											: el("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
												el("polyline", { points: "3 6 5 6 21 6" }),
												el("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
												el("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
												el("line", { x1: "14", y1: "11", x2: "14", y2: "17" })))
									: null,
								entry.extra === true && entry.installDate
									? el("span", { className: styles.date }, entry.installDate)
									: null,
							),
						),
						detailPanel,
					);
				})
				: [];
			const marketShown = market === null || market.status !== "ready"
				? []
				: officialOnly
					? market.data.filter((item) => item.official === true || item.aggregateInstallable === true)
					: market.data;
			const marketRows = market === null ? [] : market.status === "loading"
				? [el("p", { key: "m", className: styles.status }, searchSource === "github" ? t("marketLoading") : t("marketLoadingOther").replace("{source}", sourceDisplayName(searchSource)))]
				: market.status === "error"
					? [el("div", { key: "m", className: styles.detail },
						el("p", { className: styles.status, "data-error": "true" }, t("marketError") + "：" + market.error.message),
						el("button", { type: "button", className: styles.toggle, onClick: search }, t("retry")))]
					: market.data.length === 0
						? [el("p", { key: "m", className: styles.status }, searchSource === "gitee" ? t("giteeEmpty") : (mode === "skills" ? t("skillsEmpty") : t("marketEmpty")))]
						: marketShown.length === 0
							? [el("p", { key: "m", className: styles.status },
								officialOnly && market.data.some((item) => item.official === undefined || item.official === null)
									? t("officialChecking")
									: t("marketEmpty"))]
							: marketShown.map((item) => {
							const desc = item.description ?? "";
							const long = desc.length > 90;
							const open = expandedDescs[item.fullName] === true;
							const shown = long && !open ? desc.slice(0, 90) + "…" : desc;
							const installedMatch = state.status === "ready"
								? state.data.entries.find((entry) =>
									(entry.repository && entry.repository.includes(item.fullName.toLowerCase()))
									|| moduleShortName(entry.moduleName) === item.fullName.toLowerCase().split("/")[1])
								: null;
							return el("li", { key: item.fullName, className: styles.item },
								el("div", { className: styles.itemTop },
									el("a", { href: item.htmlUrl, target: "_blank", rel: "noreferrer" }, item.fullName),
									el("span", { className: styles.stars }, "★ " + item.stars),
									item.official === true
										? el("span", { className: styles.tag, "data-user": "true", title: t("officialTitle") }, t("officialBadge"))
										: item.aggregate === true
											? el("span", { className: styles.tag, title: t("aggregateTitle") }, t("aggregateBadge"))
											: null,
									item.hasSkill === true || item.skillTopics !== undefined
										? el("span", { className: styles.tag, "data-skill": "true", title: t("skillTitle") + (Array.isArray(item.skillTopics) && item.skillTopics.length > 0 ? "（" + item.skillTopics.join(" / ") + "）" : "") }, t("skillBadge"))
										: null,
									item.hasSuite === true
										? el("span", { className: styles.tag, "data-suite": "true", title: t("suiteTitle") }, t("suiteBadge"))
										: null,
								),
								desc ? (long
									? (open
										? el("div", { className: styles.descWrap },
											el("div", { className: styles.descTopbar },
												el("button", {
													type: "button",
													onClick: () => setExpandedDescs((prev) => ({ ...prev, [item.fullName]: false })),
												}, t("collapseDesc"))),
											el("p", { className: styles.desc }, desc),
											el("div", { className: styles.descTopbar },
												el("button", {
													type: "button",
													onClick: () => setExpandedDescs((prev) => ({ ...prev, [item.fullName]: false })),
												}, t("collapseDesc"))))
										: el("div", null,
											el("p", { className: styles.desc }, shown),
											el("button", {
												type: "button",
												onClick: () => setExpandedDescs((prev) => ({ ...prev, [item.fullName]: true })),
											}, t("expandDesc"))))
									: el("p", { className: styles.desc }, desc))
								: null,
								el("div", { className: styles.rowTop },
									el("button", {
										type: "button",
										disabled: repoInfo !== null && repoInfo.status === "loading" && repoInfo.repo === item.fullName,
										onClick: () => inspect(item),
									}, t("view")),
									// 技能条目（技能市场模式 / 技能索引数据）：走技能安装通道（clone → ~/.dsh/skills）
									item.skillTopics !== undefined
										? (() => {
											const skillName = item.fullName.split("/")[1];
											const already = installedSkills.some((s) => s.name === skillName);
											return el("button", {
												type: "button",
												className: styles.toggle,
												disabled: installing === item.fullName || already,
												title: already ? t("skillUninstallHint") : undefined,
												onClick: () => startSkillJob(item),
											}, installing === item.fullName ? t("installingLocal") : (already ? t("skillInstalledTag") : t("installSkill")));
										})()
										: item.fullName === "deepseek-ai/deepseek-harness"
											? (updateMap[item.fullName] !== undefined
												? (confirmFrameworkUpgrade
													? el("button", {
														type: "button",
														className: styles.toggle,
														disabled: frameworkUpgrading,
														onClick: doFrameworkUpgrade,
													}, frameworkUpgrading ? t("installingLocal") : t("frameworkUpgradeConfirm"))
													: el("button", {
														type: "button",
														className: styles.toggle,
														disabled: frameworkUpgrading,
														title: t("frameworkUpgradeTitle"),
														onClick: () => setConfirmFrameworkUpgrade(true),
													}, t("frameworkUpgradeBtn") + " → v" + updateMap[item.fullName]))
												: el("button", {
													type: "button",
													className: styles.toggle,
													disabled: true,
													title: t("frameworkUpToDateTitle"),
												}, t("frameworkUpToDate")))
											: updateMap[item.fullName] !== undefined
												? el("button", {
													type: "button",
													className: styles.toggle,
													disabled: installing === item.fullName,
													onClick: () => startJob("", installedMatch.moduleName),
												}, installing === item.fullName ? t("installingLocal") : t("update") + " → v" + updateMap[item.fullName])
												: el("button", {
													type: "button",
													className: styles.toggle,
													disabled: installing === item.fullName,
													onClick: () => addLocal(item),
												}, installing === item.fullName ? t("installingLocal") : (installedMatch !== null && installedMatch !== undefined ? t("update") : t("addLocal"))),
								),
							);
						});
			let detail = null;
			if (repoInfo !== null) {
				if (repoInfo.status === "loading") {
					detail = el("div", { className: styles.detail }, el("p", { className: styles.status }, t("repoLoading")));
				} else if (repoInfo.status === "error") {
					detail = el("div", { className: styles.detail },
						el("p", { className: styles.status, "data-error": "true" }, t("repoError") + "：" + repoInfo.error.message));
				} else {
					const info = repoInfo.data;
					const detailSkillName = info.skill?.name ?? info.skillName ?? repoInfo.repo.split("/")[1];
					const detailSkill = installedSkills.find((s) => s.name === detailSkillName) ?? null;
					const detailSkillInstalled = detailSkill !== null;
					const detailSkillDisabled = detailSkill?.disabled === true;
					detail = el("div", { className: styles.detail },
						el("div", { className: styles.rowTop },
							el("strong", { className: styles.name }, repoInfo.repo),
							info.dshHint ? el("span", { className: styles.tag, "data-user": "true" }, t("dshHint")) : null,
							info.hasSkill === true ? el("span", { className: styles.tag, "data-skill": "true", title: t("skillTitle") }, t("skillBadge")) : null,
							info.hasSuite === true ? el("span", { className: styles.tag, "data-suite": "true", title: t("suiteTitle") }, t("suiteBadge")) : null,
						),
						info.description ? el("p", { className: styles.desc }, info.description) : null,
						info.hasSkill === true && info.skill !== null && (info.skill.name || info.skill.description || info.skill.whenToUse)
							? el("div", null,
								el("p", { className: styles.status }, t("skillMetaLabel") + "："),
								info.skill.name ? el("p", { className: styles.status }, t("skillNameLabel") + "：" + info.skill.name) : null,
								info.skill.description ? el("p", { className: styles.desc }, info.skill.description) : null,
								info.skill.whenToUse ? el("p", { className: styles.status }, t("skillWhenToUseLabel") + "：" + info.skill.whenToUse) : null,
								Array.isArray(info.skillTopics) && info.skillTopics.length > 0
									? el("p", { className: styles.status }, t("skillTopicsLabel") + "：" + info.skillTopics.join(" / "))
									: null,
							)
							: null,
						info.readme !== null && (info.readme.title || info.readme.summary)
							? el("div", null,
								el("p", { className: styles.status }, t("readmeLabel") + "："),
								info.readme.title ? el("strong", null, info.readme.title + "。") : null,
								info.readme.summary ? el("p", { className: styles.desc }, info.readme.summary) : null,
							)
							: null,
						el("p", { className: styles.status },
							info.hasSuite === true && info.hasPackageJson === false
								? t("suiteRepoNote")
								: (info.hasSkill === true && info.hasPackageJson === false
									? t("skillRepoNote")
									: (t("packageName") + "：" + (info.packageName ?? t("noPackage"))))),
						info.installCommand
							? el("div", null,
								el("p", { className: styles.status }, t("officialInstallLabel") + "："),
								el("pre", { className: styles.cmdBlock, style: { margin: "4px 0", padding: "8px 10px", background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: "8px", overflowX: "auto", fontSize: "12px", lineHeight: "18px", whiteSpace: "pre-wrap", wordBreak: "break-all" } }, info.installCommand),
								el("button", { type: "button", className: styles.toggle, onClick: () => copyInstallCommand(info.installCommand) }, t("copyInstallCmd")))
							: null,
						info.packageName !== null && info.packageName !== undefined && state.status === "ready"
							? (() => {
								const entry = state.data.entries.find((candidate) => candidate.moduleName === info.packageName);
								return entry ? el("p", { className: styles.status },
									t("installedAt") + "：" + (entry.installDate ?? "?") + (entry.version ? " · v" + entry.version : "")) : null;
							})()
							: null,
						info.hasSkill === true && detailSkillInstalled
							? el("p", { className: styles.status },
								t("skillDetailInstalled") + "：" + detailSkillName
									+ (detailSkillDisabled ? " · " + t("skillDetailDisabled") : "")
									+ (detailSkill.path ? " · " + t("skillDetailPath") + " " + detailSkill.path : ""))
							: null,
						info.packageName ? el("button", {
							type: "button",
							className: styles.toggle,
							disabled: installing === repoInfo.repo,
							onClick: () => startJob(repoInfo.repo, info.packageName),
						}, installing === repoInfo.repo ? t("installing") : (state.status === "ready" && state.data.entries.some((candidate) => candidate.moduleName === info.packageName) ? t("update") : t("install"))) : null,
						info.hasSkill === true ? el("button", {
							type: "button",
							className: styles.toggle,
							disabled: installing === repoInfo.repo || detailSkillInstalled,
							title: detailSkillInstalled ? t("skillUninstallHint") : undefined,
							onClick: () => startSkillJob({ fullName: repoInfo.repo, source: repoInfo.source ?? "github" }),
						}, installing === repoInfo.repo ? t("installing") : (detailSkillInstalled ? t("skillInstalledTag") : t("installSkill"))) : null,
						info.hasSuite === true && info.hasPackageJson === false ? el("button", {
							type: "button",
							className: styles.toggle,
							disabled: installing === repoInfo.repo,
							title: t("suiteTitle"),
							onClick: () => startSuiteJob({ fullName: repoInfo.repo, source: repoInfo.source ?? "github" }),
						}, installing === repoInfo.repo ? t("installing") : t("suiteInstall")) : null,
						info.hasSkill === true && detailSkillInstalled && !detailSkill.system
							? el("button", {
								type: "button",
								className: styles.toggle,
								disabled: togglingSkill === detailSkillName,
								onClick: () => doToggleSkill(detailSkillName, detailSkillDisabled),
							}, togglingSkill === detailSkillName ? t("installingLocal") : (detailSkillDisabled ? t("skillEnable") : t("skillDisable")))
							: null,
						(info.privateRoot || !info.hasPackageJson) ? el("div", null,
							info.privateRoot ? el("p", { className: styles.status, "data-error": "true" }, t("privateRootHint")) : null,
							el("p", { className: styles.status }, t("subpackagesTitle") + "："),
							subpackages === null ? null
								: subpackages.status === "loading"
									? el("p", { className: styles.status }, t("subpackagesLoading"))
									: subpackages.status === "error"
										? el("p", { className: styles.status, "data-error": "true" }, t("subpackagesError"))
										: subpackages.list.length === 0
											? el("p", { className: styles.status }, t("subpackagesEmpty"))
											: el("ul", { className: styles.market }, subpackages.list.map((sub) =>
												el("li", { key: sub.name, className: styles.item },
													el("div", { className: styles.itemTop },
														el("code", { className: styles.name }, sub.name)),
													el("div", { className: styles.rowTop },
														el("button", {
															type: "button",
															className: styles.toggle,
															disabled: installing === sub.name,
															onClick: () => startJob(repoInfo.repo, sub.name),
														}, installing === sub.name ? t("installing") : t("install")))))))
						: null,
					);
				}
			}
			// 升级卡片显示条件：非 idle 且未被关闭。关闭语义——
			// 终态（done/failed）点叉号 = 永久关闭（localStorage 记录，刷新/重进不再出现）；
			// 非终态（升级进行中）点叉号 = 仅本次会话隐藏，刷新/重进后仍恢复显示（保持开启卡片）
			const fwTerminalDismissed = frameworkStatus !== null
				&& (frameworkStatus.status === "done" || frameworkStatus.status === "failed")
				&& (() => { try { return localStorage.getItem("pc-fw-dismiss-terminal") === frameworkStatus.status; } catch { return false; } })();
			const fwShowCard = frameworkStatus !== null && frameworkStatus.status !== "idle" && !fwStatusDismissed && !fwTerminalDismissed;
			return el("section", { className: styles.section, "aria-busy": state.status === "loading" },
				state.status === "ready" && state.data.compat && !state.data.compat.supported
					? el("p", { className: styles.message, "data-error": "true" }, state.data.compat.notice)
					: null,
				state.status === "ready" && state.data.framework && state.data.framework.upgraded === true && !frameworkNoticeDismissed
					? el("div", { className: styles.messageRow },
						el("p", { className: styles.message }, t("frameworkUpgradeNotice").replace("{from}", state.data.framework.from ?? "?").replace("{to}", state.data.framework.version ?? "?").replace("{dir}", state.data.framework.backupDir ?? "").replace("{patch}", state.data.framework.patchApplied === true ? t("frameworkPatchApplied") : t("frameworkPatchSkipped") + (state.data.framework.patchNote ? "：" + state.data.framework.patchNote : ""))),
						el("button", { type: "button", className: styles.toggle, onClick: () => setFrameworkNoticeDismissed(true) }, t("closeModal")))
					: null,
				fwShowCard && frameworkStatus.status !== "done"
					? el("button", {
						type: "button",
						className: styles.relaunchFloat,
						title: t("relaunchTitle"),
						"aria-label": t("relaunchBtn"),
						onClick: () => {
							call("/plugin-console/framework-relaunch", {}).then(
								(data) => { if (data && data.ok === true) setMessage(t("relaunchDone")); },
								(error) => setMessage(t("failed") + "：" + friendlyGithubError(error).message),
							);
						},
					}, t("relaunchBtn"))
					: null,
				fwShowCard
					? el("div", { className: styles.detail },
						el("div", { className: styles.rowTop },
							el("strong", { className: styles.name }, t("frameworkUpgradeBtn") + " " + (frameworkStatus.status === "done" ? "✓" : (frameworkStatus.status === "failed" ? "✕" : t("installingLocal")))),
							el("button", { type: "button", className: styles.trashBtn, title: t("closeModal"), "aria-label": t("closeModal"), onClick: () => {
								// 终态关闭 = 永久（localStorage 持久化）；非终态关闭 = 会话内临时隐藏
								if (frameworkStatus !== null && (frameworkStatus.status === "done" || frameworkStatus.status === "failed")) {
									try { localStorage.setItem("pc-fw-dismiss-terminal", frameworkStatus.status); } catch {}
								}
								setFwStatusDismissed(true);
							} }, "✕")),
						el("ul", { className: styles.market }, FW_STEPS.map((step, idx) => {
							const cur = FW_STEPS.findIndex((s) => s.key === frameworkStatus.status);
							const state2 = frameworkStatus.status === "done" ? "ok" : (frameworkStatus.status === "failed" ? "fail" : (idx < cur ? "ok" : (idx === cur ? "cur" : "wait")));
							return el("li", { key: step.key, className: styles.item },
								el("div", { className: styles.itemTop },
									el("code", { className: styles.name }, (state2 === "ok" ? "✓ " : state2 === "cur" ? "⟳ " : state2 === "fail" ? "✕ " : "· ") + step.label),
									state2 === "cur" ? el("span", { className: styles.spinner }) : null));
						})),
						frameworkStatus.message ? el("p", { className: styles.status, "data-error": frameworkStatus.status === "failed" ? "true" : undefined }, frameworkStatus.message) : null)
					: null,
				message !== null ? el("div", { className: styles.messageRow }, el("p", { className: styles.message }, message), reloadHint ? el("button", { type: "button", className: styles.toggle, onClick: () => window.location.reload() }, t("reloadPage")) : null, restartHint ? el("button", { type: "button", className: styles.toggle, onClick: () => { setMessage(t("restarting")); call("/plugin-console/restart", {}).then(() => { window.setTimeout(() => window.location.reload(), 12000); }, () => {}); } }, t("restartService")) : null) : null,
				el("div", { className: styles.marketHead },
					el("h3", null, mode === "skills"
						? (searchSource === "github"
							? t("skillsMarketTitle")
							: t("skillsMarketTitleOther").replace("{source}", sourceDisplayName(searchSource)))
						: (searchSource === "github"
							? t("marketTitle")
							: t("marketTitleOther").replace("{source}", sourceDisplayName(searchSource)))),
					el("div", { id: "pc-ghwrap", className: styles.ghwrap },
selfUpdate !== null ? el("button", {
type: "button",
className: styles.ghpill,
title: t("hubUpdateAvailable") + " v" + selfUpdate.latest,
onClick: () => window.open(`https://github.com/Noob-stupid/dsh-plugin-hub/releases/tag/v${selfUpdate.latest}`, "_blank")
}, "⬇ " + t("hubUpdateAvailable") + " v" + selfUpdate.latest) : null,
						el("button", {
							type: "button",
							className: styles.ghpill,
							"data-on": state.status === "ready" && state.data.github && state.data.github.loggedIn ? "true" : "false",
							title: t("searchSourceTitle"),
							"aria-label": t("searchSourceTitle"),
							onClick: () => setSourceMenuOpen((v) => !v),
						},
							searchSource === "github"
								? (state.status === "ready" && state.data.github && state.data.github.loggedIn
									? t("githubLoggedIn") + (state.data.github.login ?? "unknown")
									: t("githubCornerOut"))
								: t("sourceOf") + ((searchSourcesList !== null ? searchSourcesList.find((s) => s.id === searchSource)?.name : undefined)
									?? (searchSource === "gitee" ? "Gitee" : searchSource)),
							" ▾"),
						sourceMenuOpen
							? el("div", { className: styles.sourceMenu },
								(searchSourcesList !== null && searchSourcesList.length > 0
									? searchSourcesList
									: [{ id: "github", name: "GitHub" }, { id: "gitee", name: "Gitee" }]
								).map((s) =>
									el("button", {
										type: "button",
										key: s.id,
										className: styles.sourceOpt,
										"data-active": searchSource === s.id ? "true" : "false",
										onClick: () => {
											setSearchSource(s.id);
											try { localStorage.setItem("pc-search-source", s.id); } catch {}
											setSourceMenuOpen(false);
										},
									}, s.name)))
							: null,
					)),
				el("button", {
					type: "button",
					className: styles.restartBtn,
					title: t("restartService"),
					onClick: () => { setMessage(t("restarting")); call("/plugin-console/restart", {}).then(() => { window.setTimeout(() => window.location.reload(), 12000); }, () => {}); },
				}, t("restartService")),
				el("button", {
					type: "button",
					className: styles.aiToggle,
					"data-active": aiFallback ? "true" : "false",
					title: t("aiFallbackTitle"),
					"aria-label": t("aiFallbackLabel"),
					onClick: () => setAiFallback((v) => {
						const next = !v;
						try { localStorage.setItem("pc-ai-fallback-v2", next ? "on" : "off"); } catch {}
						return next;
					}),
				}, t("aiFallbackLabel")),
				el("button", {
					type: "button",
					className: styles.sourcesFloat,
					title: t("sourcesTitle"),
					"aria-label": t("sourcesBtn"),
					onClick: openSources,
				}, t("sourcesBtn")),
				el("button", {
					type: "button",
					className: styles.modeFloat,
					"data-mode": mode === "skills" ? "true" : "false",
					title: t("modeBtn"),
					"aria-label": t("modeBtn"),
					onClick: () => {
						const next = mode === "plugins" ? "skills" : "plugins";
						setMode(next);
						try { localStorage.setItem("pc-market-mode", next); } catch {}
						setMarket(null);
					},
				}, mode === "skills" ? t("pluginsMode") : t("skillsMode")),
				market !== null && market.status === "ready" && market.data.length > 0
					? el("div", { className: styles.backTopWrap },
						showBackTop
							? el("button", {
								type: "button",
								className: styles.backTop,
								title: t("backToSearch"),
								"aria-label": t("backToSearch"),
								onClick: () => {
									const node = document.getElementById("pc-market-search");
									if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
								},
							}, el("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
								el("polyline", { points: "18 15 12 9 6 15" })))
							: null,
						el("button", {
							type: "button",
							className: styles.backTop,
							title: marketCollapsed ? t("expandResults") : t("collapseResults"),
							"aria-label": marketCollapsed ? t("expandResults") : t("collapseResults"),
							onClick: () => setMarketCollapsed((v) => !v),
						}, el("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
							marketCollapsed
								? [el("polyline", { key: "a", points: "6 9 12 15 18 9" }), el("polyline", { key: "b", points: "6 16 12 22 18 16" })]
								: [el("polyline", { key: "a", points: "18 15 12 9 6 15" }), el("polyline", { key: "b", points: "18 8 12 2 6 8" })])))
					: null,
				el("p", { className: styles.note }, mode === "skills"
					? (searchSource === "github"
						? t("skillsNote")
						: t("skillsGithubOnly"))
					: (searchSource === "github" ? t("direct") : t("directOther").replace("{source}", sourceDisplayName(searchSource)))),
				el("div", { className: styles.search, id: "pc-market-search" },
					el("div", { className: styles.searchInner },
						el("input", {
							type: "search",
							value: query,
							placeholder: mode === "skills"
								? (searchSource === "github"
									? t("skillsSearchPlaceholder")
									: t("skillsGithubOnly"))
								: (searchSource === "github"
									? t("searchPlaceholder")
									: searchSource === "gitee"
										? t("giteeRepoPlaceholder")
										: t("searchPlaceholderOther").replace("{source}", sourceDisplayName(searchSource))),
							"aria-label": t("search"),
							onChange: (event) => setQuery(event.currentTarget.value),
							onKeyDown: (event) => { if (event.key === "Enter") search(); },
						}),
					),
					mode === "plugins"
						? el("button", {
							type: "button",
							className: styles.starBtn,
							"data-active": officialOnly ? "true" : "false",
							title: t("officialTitle"),
							"aria-label": t("officialOnlyToggle"),
							onClick: () => setOfficialOnly((v) => !v),
						}, officialOnly ? "★" : "☆")
						: null,
					mode === "plugins"
						? el("button", {
							type: "button",
							className: styles.starBtn,
							"data-active": multiSource ? "true" : "false",
							title: t("multiSourceTitle"),
							"aria-label": t("multiSourceToggle"),
							onClick: () => setMultiSource((v) => {
								const next = !v;
								try { localStorage.setItem("pc-multi-source", next ? "1" : "0"); } catch {}
								return next;
							}),
						}, multiSource ? "⊞" : "⊟")
						: null,
					el("button", { type: "button", onClick: search }, t("search")),
				),
				!marketCollapsed && marketRows.length > 0 ? el("ul", { className: styles.market }, marketRows) : null,
				!marketCollapsed && market !== null && market.status === "ready" && market.data.length >= 20
					? el("div", { className: styles.descTopbar },
						el("button", {
							type: "button",
							className: styles.toggle,
							disabled: loadingMore,
							onClick: loadMore,
						}, loadingMore ? t("loadingMore") : t("loadMore")))
					: null,
				Object.values(jobs).filter((job) => job.status === "installing").map((job) => {
					if (job.stage === "ai-consent") {
						// 需要用户同意时由最上层模态框负责展示，列表内只留状态行；
						// 已关闭兜底或已勾选"不再提醒"时显示对应说明
						const autoNote = !aiFallback ? t("aiFallbackOff") : (aiRemember ? t("aiRememberNote") : t("consentWaiting"));
						return el("div", { key: job.jobId, className: styles.detail },
							el("div", { className: styles.rowTop },
								el("span", { className: styles.spinner }),
								el("strong", { className: styles.name }, t("installingLocal") + "：" + (job.packageName ?? job.repo))),
							el("p", { className: styles.message }, autoNote));
					}
					const stageKey = job.stage === "preparing" ? "stagePreparing" : job.stage === "configuring" ? "stageConfiguring" : job.stage === "repairing" ? "stageRepairing" : "stageInstalling";
					const elapsed = Math.max(0, Math.round((Date.now() - (job.startedAt ?? Date.now())) / 1000));
					return el("div", { key: job.jobId, className: styles.detail },
						el("div", { className: styles.rowTop },
							el("span", { className: styles.spinner }),
							el("strong", { className: styles.name }, t("installingLocal") + "：" + (job.packageName ?? job.repo))),
						el("p", { className: styles.status },
							t("stageLabel") + "：" + t(stageKey) + " · " + t("elapsed") + " " + elapsed + "s"));
				}),
				Object.entries(suiteReports).map(([jobId, report]) =>
					el("div", { key: "suite-" + jobId, className: styles.detail },
						el("p", { className: styles.status }, t("suiteComponentType") + "："),
						el("ul", { className: styles.market }, report.map((r) =>
							el("li", { key: r.component, className: styles.item },
								el("div", { className: styles.itemTop },
									el("code", { className: styles.name }, r.component),
									r.ok
										? el("span", { className: styles.tag, "data-user": "true" }, t("suiteComponentOk"))
										: el("span", { className: styles.tag, "data-error": "true" }, t("suiteComponentFail"))),
								r.note ? el("p", { className: styles.desc }, r.note) : null))))),
				(state.status === "ready" ? state.data.recentFailures ?? [] : []).filter((job) => !dismissedFailures[job.jobId]).map((job) =>
					el("div", { key: "fail-" + job.jobId, className: styles.detail },
						el("div", { className: styles.rowTop },
							el("span", { className: styles.phase, "data-phase": "failed" }, t("recentFailures")),
							el("strong", { className: styles.name }, job.packageName ?? job.repo),
							el("button", {
								type: "button",
								className: styles.trashBtn,
								title: t("dismissFailure"),
								"aria-label": t("dismissFailure"),
								onClick: () => setDismissedFailures((prev) => ({ ...prev, [job.jobId]: true })),
							}, "✕")),
						el("p", { className: styles.message, "data-error": "true" }, job.error ?? ""),
						el("div", { className: styles.rowTop },
							el("button", { type: "button", className: styles.toggle, onClick: () => startJob(job.repo, job.packageName, job.source ?? "github") }, t("retry")))),
				),
				repoInfo !== null
					? el("aside", { className: styles.floatPanel },
						el("div", { className: styles.descTopbar },
							el("button", { type: "button", className: styles.toggle, onClick: () => setRepoInfo(null) }, "✕")),
						detail)
					: null,
				el("div", { id: "pc-installed-search-area" },
					el("div", { className: styles.installedHead },
						el("h3", null, mode === "skills" ? t("installedSkillsTitle") : t("installedTitle")),
						mode === "plugins"
							? el("button", { type: "button", className: styles.toggle, onClick: () => setInstalledSearchOpen((v) => !v) }, t("search"))
							: null),
					mode === "plugins" && installedSearchOpen
						? el("div", { className: styles.search },
							el("input", {
								type: "search",
								id: "pc-installed-search-input",
								value: installedQuery,
								placeholder: t("searchInstalledPlaceholder"),
								"aria-label": t("searchInstalledPlaceholder"),
								onChange: (event) => setInstalledQuery(event.currentTarget.value),
							}),
							el("button", {
								type: "button",
								className: styles.extraBtn,
								"data-flash": extraFlash ? "true" : "false",
								title: t("extraFilterTitle"),
								"aria-label": t("extraFilterTitle"),
								onClick: () => {
									setExtraOnly((v) => !v);
									setExtraFlash(true);
									window.setTimeout(() => setExtraFlash(false), 1500);
								},
							}, extraOnly ? t("extraFilterAll") : t("extraFilter") + " · " + extraCount),
							)
						: null),
				mode === "skills"
					? (installedSkills.length === 0
						? el("p", { className: styles.status }, t("skillsEmpty"))
						: el("ul", { className: styles.list }, installedSkills.map((sk) =>
							el("li", { key: sk.name, className: styles.row },
								el("div", { className: styles.rowTop },
									el("code", { className: styles.name }, sk.name),
									sk.system === true
										? el("span", { className: styles.tag, "data-system": "true", title: t("skillSystemTitle") }, t("skillSystemTag"))
										: sk.disabled === true
											? el("span", { className: styles.tag, "data-disabled": "true", title: t("skillDisabledTitle") }, t("skillDisabledTag"))
											: el("span", { className: styles.tag, "data-skill": "true", title: t("skillTitle") }, t("skillBadge"))),
								el("div", { className: styles.meta }, sk.path ?? ""),
								el("div", { className: styles.rowTop },
									sk.system === true
										? null
										: el("button", {
											type: "button",
											className: styles.toggle,
											disabled: togglingSkill === sk.name,
											onClick: () => doToggleSkill(sk.name, sk.disabled === true),
										}, togglingSkill === sk.name ? t("installingLocal") : (sk.disabled === true ? t("skillEnable") : t("skillDisable"))),
									sk.system === true
										? null
										: confirmSkillDelete === sk.name
											? el("button", {
												type: "button",
												className: styles.toggle,
												onClick: () => doRemoveSkill(sk.name),
											}, t("skillDeleteConfirm").replace("{name}", sk.name))
											: el("button", {
												type: "button",
												className: styles.trashBtn,
												title: t("skillDelete"),
												"aria-label": t("skillDelete"),
												onClick: () => setConfirmSkillDelete(sk.name),
											}, "✕"))))))
					: (state.status === "loading"
						? el("p", { className: styles.status }, t("loading"))
						: state.status === "error"
							? el("div", { className: styles.detail },
								el("p", { className: styles.status, "data-error": "true" }, t("error")),
								el("button", { type: "button", className: styles.toggle, onClick: refresh }, t("retry")))
							: state.data.entries.length === 0
								? el("p", { className: styles.status }, t("empty"))
								: installedQueryNorm !== "" && rows.length === 0
									? el("p", { className: styles.status }, t("noMatch"))
									: extraOnly && rows.length === 0
										? el("p", { className: styles.status }, t("extraEmpty"))
										: el("ul", { className: styles.list }, rows)),
				showBackTop
					? el("button", {
						type: "button",
						className: styles.refresh,
						title: t("refreshList"),
						"aria-label": t("refreshList"),
						onClick: refresh,
					}, el("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" },
						el("path", { d: "M21 12a9 9 0 1 1-2.64-6.36" }),
						el("polyline", { points: "21 3 21 9 15 9" })))
					: null,
				aiRemember
					? el("div", { className: styles.descTopbar },
						el("button", {
							type: "button",
							className: styles.toggle,
							onClick: () => {
								setAiRemember(false);
								try { localStorage.setItem("pc-ai-remember", "0"); } catch {}
								setMessage(t("aiRememberReset"));
							},
						}, t("aiRememberReset")))
					: null,
				(() => {
					// 最上层模态框：需要 AI 兜底授权时无论如何都让用户看到
					const consentJob = Object.values(jobs).find((job) => job.status === "installing" && job.stage === "ai-consent" && aiFallback && !aiRemember);
					return consentJob === undefined
						? null
						: el("div", { className: styles.modalBackdrop },
							el("div", { className: styles.modalCard },
								el("strong", { className: styles.name }, t("installingLocal") + "：" + (consentJob.packageName ?? consentJob.repo)),
								el("p", { className: styles.message }, t("aiConsentText")),
								el("label", { className: styles.consentRemember },
									el("input", {
										type: "checkbox",
										checked: aiRemember,
										onChange: (event) => {
											const checked = event.currentTarget.checked;
											setAiRemember(checked);
											try { localStorage.setItem("pc-ai-remember", checked ? "1" : "0"); } catch {}
										},
									}),
									t("aiConsentRemember")),
								el("div", { className: styles.rowTop },
									el("button", { type: "button", className: styles.toggle, onClick: () => { try { localStorage.setItem("pc-ai-remember", aiRemember ? "1" : "0"); } catch {} aiConsent(consentJob.jobId, true); } }, t("aiConsentApprove")),
									el("button", { type: "button", className: styles.toggle, onClick: () => aiConsent(consentJob.jobId, false) }, t("aiConsentDecline")))));
				})(),
				sourcesOpen
					? el("div", { className: styles.modalBackdrop },
						el("div", { className: styles.modalCard },
							el("div", { className: styles.rowTop, style: { justifyContent: "space-between" } },
								el("strong", { className: styles.name }, t("sourcesTitle")),
								el("button", { type: "button", className: styles.trashBtn, style: { fontSize: 14, padding: "4px 8px" }, title: t("closeModal"), "aria-label": t("closeModal"), onClick: () => setSourcesOpen(false) }, "✕")),
							el("p", { className: styles.message }, t("sourcesDesc")),
							sourcesData === null
								? el("p", { className: styles.status }, t("loading"))
								: el("div", { style: { flexDirection: "column", gap: "8px", display: "flex" } },
									sourcesData.registries.map((src) =>
										editReg !== null && editReg.id === src.id
											? el("div", { key: src.id, className: styles.rowTop, style: { justifyContent: "space-between" } },
												el("input", { type: "text", value: editReg.name, onChange: (event) => setEditReg({ ...editReg, name: event.currentTarget.value }), style: { flex: 1, minWidth: 80 } }),
												el("input", { type: "text", value: editReg.url, onChange: (event) => setEditReg({ ...editReg, url: event.currentTarget.value }), style: { flex: 2, minWidth: 120 } }),
												el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy, onClick: saveEditReg }, t("saveSource")),
												el("button", { type: "button", className: styles.toggle, onClick: () => setEditReg(null) }, t("cancelEdit")))
											: el("div", { key: src.id, className: styles.rowTop, style: { justifyContent: "space-between" } },
												el("div", { className: styles.rowTop, style: { flex: 1, minWidth: 0 } },
													el("strong", { className: styles.name, style: { flex: "none", maxWidth: "35%" } }, src.name + (src.primary ? "（" + t("sourcePrimary") + "）" : "")),
													el("code", { className: styles.srcUrl }, src.url)),
												el("div", { className: styles.rowTop },
													src.primary ? null : el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy, onClick: () => sourcesAction({ action: "set-primary", id: src.id }) }, t("setPrimary")),
													el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy, onClick: () => setEditReg({ id: src.id, name: src.name, url: src.url }) }, t("editSource"))))),
									el("div", { className: styles.rowTop },
										el("input", { type: "text", placeholder: t("sourceName"), value: sourceName, onChange: (event) => setSourceName(event.currentTarget.value), style: { flex: 1, minWidth: 0 } }),
										el("input", { type: "text", placeholder: t("sourceUrl"), value: sourceUrl, onChange: (event) => setSourceUrl(event.currentTarget.value), style: { flex: 2, minWidth: 0 } }),
										el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy, onClick: addSource }, t("addSource"))),
									el("strong", { className: styles.name }, t("searchSourcesTitle")),
									el("p", { className: styles.message }, t("searchSourcesDesc")),
									(sourcesData.searchSources ?? []).map((s) =>
										el("div", { key: s.id, className: styles.rowTop, style: { justifyContent: "space-between" } },
											el("div", { className: styles.rowTop, style: { flex: 1, minWidth: 0 } },
												el("strong", { className: styles.name, style: { flex: "none", maxWidth: "35%" } }, s.name),
												s.type === "custom" ? el("code", { className: styles.srcUrl }, s.url) : el("span", { className: styles.tag }, "内置"),
												s.type === "custom" && s.headers !== undefined && Object.keys(s.headers).length > 0
													? el("span", { className: styles.tag, title: t("headersPlaceholder") }, "🔒 " + Object.keys(s.headers).length)
													: null),
											s.type === "custom"
												? el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy, onClick: () => sourcesAction({ action: "remove-search", id: s.id }) }, t("removeSource"))
												: null)),
									el("div", { className: styles.rowTop },
										el("input", { type: "text", placeholder: t("sourceName"), value: searchSourceName, onChange: (event) => setSearchSourceName(event.currentTarget.value), style: { flex: 1, minWidth: 0 } }),
										el("input", { type: "text", placeholder: t("searchUrlPlaceholder"), value: searchSourceUrl, onChange: (event) => setSearchSourceUrl(event.currentTarget.value), style: { flex: 2, minWidth: 0 } }),
										el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy, onClick: addSearchSource }, t("addSearchSource"))),
									el("textarea", {
										rows: 2,
										placeholder: t("headersPlaceholder"),
										value: searchSourceHeaders,
										onChange: (event) => setSearchSourceHeaders(event.currentTarget.value),
										style: { width: "100%", boxSizing: "border-box", font: "inherit", resize: "vertical" },
									}),
									el("strong", { className: styles.name }, t("giteeTitle")),
									el("p", { className: styles.message }, t("giteeDesc").replace("{port}", String(window.location.port || "3080"))),
									el("div", { className: styles.rowTop, style: { justifyContent: "space-between" } },
										el("span", { className: styles.tag },
											giteeStatus !== null && giteeStatus.hasToken
												? t("giteeLoggedIn") + (giteeStatus.login || "—")
												: (giteeStatus !== null && giteeStatus.clientConfigured ? t("giteeSetupHint") : t("giteeLoginPrompt")))),
									el("div", { className: styles.rowTop },
										el("input", { type: "text", placeholder: t("giteeClientId"), value: giteeClientId, onChange: (event) => setGiteeClientId(event.currentTarget.value), style: { flex: 1, minWidth: 0 } }),
										el("input", { type: "password", placeholder: t("giteeClientSecret"), value: giteeClientSecret, onChange: (event) => setGiteeClientSecret(event.currentTarget.value), style: { flex: 2, minWidth: 0 } }),
										el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy || !giteeClientId.trim() || !giteeClientSecret.trim(), onClick: saveGiteeSetup }, t("giteeSave"))),
									el("div", { className: styles.rowTop },
										el("button", { type: "button", className: styles.toggle, disabled: giteeStatus !== null && !giteeStatus.clientConfigured, onClick: startGiteeOauth }, t("giteeLoginBtn")),
										giteeStatus !== null && giteeStatus.hasToken
											? el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy, onClick: () => sourcesAction({ action: "gitee-clear" }) }, t("giteeClear"))
											: null)),
							el("div", { className: styles.rowTop },
								el("button", { type: "button", className: styles.toggle, disabled: sourcesBusy, onClick: () => sourcesAction({ action: "reset" }) }, t("resetSources")),
								el("button", { type: "button", className: styles.toggle, onClick: () => setSourcesOpen(false) }, t("closeModal")))))
					: null,
			);
		}
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "plugin-console: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "console",
				order: 20,
				label: () => t("tab"),
				locale: NS,
				inject: () => ({}),
			}, PluginConsoleTab));
		}
		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
