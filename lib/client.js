window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-plugin-console",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region styles
		const css = ".pc_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.pc_section h3{margin:0;font-size:13px;font-weight:600;line-height:20px}.pc_message{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;margin:0}.pc_message[data-error=true]{color:var(--dsw-alias-state-error-primary)}.pc_list{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0;padding:0;list-style:none;display:grid}.pc_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;min-width:0;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_rowTop{align-items:center;gap:8px;display:flex}.pc_name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}.pc_tag{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 8px;font-size:11px;line-height:16px;flex:none}.pc_tag[data-enabled=true]{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}.pc_tag[data-user=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.pc_meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;gap:6px;display:flex;align-items:center}.pc_phase[data-phase=failed]{color:var(--dsw-alias-state-error-primary)}.pc_phase[data-phase=active]{color:var(--dsw-alias-state-success-primary)}.pc_toggle{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:4px 12px;align-self:flex-start}.pc_toggle:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}.pc_toggle:disabled{opacity:.5;cursor:default}.pc_search{gap:8px;display:flex}.pc_search input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);height:34px;flex:1;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;padding:0 12px;font-size:13px}.pc_search input:focus-visible{border-color:var(--dsw-alias-state-business-primary)}.pc_search button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);font:inherit;cursor:pointer;border-radius:8px;padding:0 14px;font-size:13px}.pc_search button:hover{border-color:var(--dsw-alias-state-business-primary)}.pc_market{flex-direction:column;gap:10px;margin:0;padding:0;list-style:none;display:flex}.pc_item{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;min-width:0;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_itemTop{align-items:center;gap:8px;display:flex}.pc_itemTop a{color:var(--dsw-alias-state-business-primary);font-size:13px;font-weight:600;text-decoration:none;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pc_stars{color:var(--dsw-alias-label-tertiary);font-size:11px;flex:none}.pc_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0}.pc_item button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:3px 10px;align-self:flex-start;font-size:12px}.pc_item button:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}.pc_item button:disabled{opacity:.5;cursor:default}.pc_detail{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_status{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0}.pc_note{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin:0}";
		const tagId = "@deepseek-ai/dsh-plugin-console/PluginConsoleTab.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-plugin-console";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const styles = {
			section: "pc_section",
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
			search: "搜索",
			searchPlaceholder: "搜索 GitHub 上的 dsh-plugin 插件（留空使用默认关键词）",
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
			marketError: "搜索失败",
			marketEmpty: "没有找到相关项目。",
			repoLoading: "正在读取仓库信息…",
			repoError: "读取仓库信息失败",
			packageName: "npm 包名",
			dshHint: "疑似 DSH 插件",
			noPackage: "该仓库没有 package.json，无法安装",
			installed: "已安装并启用",
			installNote: "HMR 正在生效；若插件带界面，请刷新页面",
			direct: "（浏览器直连 GitHub；若你的浏览器打不开 GitHub，将自动回退到服务端通道）",
			details: "详情",
			hideDetails: "收起详情",
			noDetail: "该插件没有提供说明信息。",
			versionLabel: "版本",
			repoLabel: "仓库",
			homepageLabel: "主页",
			readmeLabel: "说明摘要",
			loadingDetails: "正在读取详情…",
		};
		const en = {
			tab: "Plugin console",
			loading: "Reading plugins…",
			error: "Plugins are temporarily unavailable.",
			retry: "Retry",
			installedTitle: "Installed plugins",
			marketTitle: "Plugin market (GitHub)",
			search: "Search",
			searchPlaceholder: "Search dsh-plugin projects on GitHub (empty = default query)",
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
			marketError: "Search failed",
			marketEmpty: "No matching projects.",
			repoLoading: "Reading repository…",
			repoError: "Failed to read repository",
			packageName: "npm package",
			dshHint: "Looks like a DSH plugin",
			noPackage: "This repository has no package.json, cannot install",
			installed: "Installed and enabled",
			installNote: "HMR is applying; refresh the page if the plugin ships UI",
			direct: "(The browser calls GitHub directly; the server channel is used as fallback.)",
			details: "Details",
			hideDetails: "Hide details",
			noDetail: "No description provided for this plugin.",
			versionLabel: "Version",
			repoLabel: "Repository",
			homepageLabel: "Homepage",
			readmeLabel: "Readme summary",
			loadingDetails: "Reading details…",
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
		async function githubFetch(url) {
			const response = await fetch(url, { headers: { accept: "application/vnd.github+json" } });
			if (response.status === 403) throw new Error("GitHub 匿名接口限流已用尽，请稍后再试");
			if (!response.ok) throw new Error("GitHub 请求失败 (HTTP " + response.status + ")");
			return response.json();
		}
		/** 浏览器直连 GitHub 搜索；失败抛错由调用方回退到服务端通道。 */
		async function searchFromGithub(q) {
			const query = (q ?? "").trim() || "dsh-plugin";
			const data = await githubFetch(`${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`);
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
		/** 浏览器直连读取仓库元数据 + package.json + README 摘要。 */
		async function repoInfoFromGithub(repo) {
			const meta = await githubFetch(`${GITHUB_API}/repos/${encodeURIComponent(repo)}`);
			const branch = meta.default_branch ?? "main";
			let pkg = null;
			let readme = null;
			try {
				const raw = await fetch(`${GITHUB_RAW}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/package.json`);
				if (raw.ok) pkg = await raw.json();
			} catch {}
			try {
				const raw = await fetch(`${GITHUB_RAW}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/README.md`);
				if (raw.ok) readme = summarizeReadmeText(await raw.text());
			} catch {}
			return {
				repo,
				defaultBranch: branch,
				description: meta.description ?? "",
				stars: meta.stargazers_count ?? 0,
				packageName: pkg !== null && typeof pkg.name === "string" ? pkg.name : null,
				packageDescription: pkg !== null && typeof pkg.description === "string" ? pkg.description : null,
				hasPackageJson: pkg !== null,
				readme,
				dshHint: pkg !== null && (
					typeof pkg.name === "string" && /(^|-)dsh[-/]/u.test(pkg.name)
					|| pkg.peerDependencies !== undefined && pkg.peerDependencies["@deepseek-ai/cordis"] !== undefined
					|| Array.isArray(pkg.keywords) && pkg.keywords.includes("dsh-plugin")
				),
			};
		}
		function PluginConsoleTab({ t }) {
			const [state, setState] = react.useState({ status: "loading" });
			const [busy, setBusy] = react.useState(null);
			const [message, setMessage] = react.useState(null);
			const [query, setQuery] = react.useState("");
			const [market, setMarket] = react.useState(null);
			const [repoInfo, setRepoInfo] = react.useState(null);
			const [installing, setInstalling] = react.useState(null);
			const [details, setDetails] = react.useState(null);
			const refresh = react.useCallback(() => {
				setState((prev) => ({ ...prev, status: "loading" }));
				call("/plugin-console/state").then(
					(data) => setState({ status: "ready", data }),
					() => setState({ status: "error" }),
				);
			}, []);
			react.useEffect(() => { refresh(); }, [refresh]);
			const loadDetails = (entry) => {
				if (details !== null && details.entryId === entry.entryId) {
					setDetails(null);
					return;
				}
				setDetails({ entryId: entry.entryId, status: "loading" });
				call("/plugin-console/details", { entryId: entry.entryId }).then(
					(data) => setDetails({ entryId: entry.entryId, status: "ready", data }),
					(error) => setDetails({ entryId: entry.entryId, status: "error", error }),
				);
			};
			const toggle = (entry, enabled) => {
				setBusy(entry.entryId);
				setMessage(null);
				call("/plugin-console/toggle", { entryId: entry.entryId, enabled }).then(
					() => {
						setMessage(t(enabled ? "toggledOn" : "toggledOff") + "：" + entry.entryId);
						setTimeout(refresh, 1500);
					},
					(error) => setMessage(t("failed") + "：" + error.message),
				).finally(() => setBusy(null));
			};
			const search = () => {
				setMarket({ status: "loading" });
				setRepoInfo(null);
				searchFromGithub(query).then(
					(data) => setMarket({ status: "ready", data, direct: true }),
					() => call("/plugin-console/search", { q: query }).then(
						(data) => setMarket({ status: "ready", data: data.items, direct: false }),
						(error) => setMarket({ status: "error", error }),
					),
				);
			};
			const inspect = (repo) => {
				setRepoInfo({ status: "loading", repo });
				repoInfoFromGithub(repo).then(
					(data) => setRepoInfo({ status: "ready", repo, data, direct: true }),
					() => call("/plugin-console/repo", { repo }).then(
						(data) => setRepoInfo({ status: "ready", repo, data, direct: false }),
						(error) => setRepoInfo({ status: "error", repo, error }),
					),
				);
			};
			const install = (repo, packageName) => {
				setInstalling(repo);
				setMessage(null);
				call("/plugin-console/install", { repo, packageName }).then(
					(data) => {
						setMessage(t("installed") + "：" + data.packageName + "（" + data.entryId + "）。" + t("installNote"));
						setTimeout(refresh, 2000);
					},
					(error) => setMessage(t("failed") + "：" + error.message),
				).finally(() => setInstalling(null));
			};
			const rows = state.status === "ready"
				? state.data.entries.map((entry) => {
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
								meta !== null && meta.version ? el("p", { className: styles.status }, t("versionLabel") + "：" + meta.version) : null,
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
							entry.protected ? el("span", { className: styles.tag, "data-user": "true" }, t("protectedTag")) : null,
							entry.userDisabled ? el("span", { className: styles.tag, "data-user": "true" }, t("userDisabledTag")) : null,
							entry.userForced ? el("span", { className: styles.tag, "data-user": "true" }, t("userForcedTag")) : null,
						),
						el("div", { className: styles.meta },
							el("span", { className: styles.phase, "data-phase": entry.fiberPhase ?? "unobserved" },
								phaseLabel(entry.fiberPhase, t)),
							el("code", null, entry.entryId),
						),
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
							}, open ? t("hideDetails") : t("details")),
						),
						detailPanel,
					);
				})
				: [];
			const marketRows = market === null ? [] : market.status === "loading"
				? [el("p", { key: "m", className: styles.status }, t("marketLoading"))]
				: market.status === "error"
					? [el("p", { key: "m", className: styles.status, "data-error": "true" }, t("marketError") + "：" + market.error.message)]
					: market.data.length === 0
						? [el("p", { key: "m", className: styles.status }, t("marketEmpty"))]
						: market.data.map((item) => el("li", { key: item.fullName, className: styles.item },
							el("div", { className: styles.itemTop },
								el("a", { href: item.htmlUrl, target: "_blank", rel: "noreferrer" }, item.fullName),
								el("span", { className: styles.stars }, "★ " + item.stars),
							),
							item.description ? el("p", { className: styles.desc }, item.description) : null,
							el("button", {
								type: "button",
								disabled: repoInfo !== null && repoInfo.status === "loading" && repoInfo.repo === item.fullName,
								onClick: () => inspect(item.fullName),
							}, t("view")),
						));
			let detail = null;
			if (repoInfo !== null) {
				if (repoInfo.status === "loading") {
					detail = el("div", { className: styles.detail }, el("p", { className: styles.status }, t("repoLoading")));
				} else if (repoInfo.status === "error") {
					detail = el("div", { className: styles.detail },
						el("p", { className: styles.status, "data-error": "true" }, t("repoError") + "：" + repoInfo.error.message));
				} else {
					const info = repoInfo.data;
					detail = el("div", { className: styles.detail },
						el("div", { className: styles.rowTop },
							el("strong", { className: styles.name }, repoInfo.repo),
							info.dshHint ? el("span", { className: styles.tag, "data-user": "true" }, t("dshHint")) : null,
						),
						info.description ? el("p", { className: styles.desc }, info.description) : null,
						info.readme !== null && (info.readme.title || info.readme.summary)
							? el("div", null,
								el("p", { className: styles.status }, t("readmeLabel") + "："),
								info.readme.title ? el("strong", null, info.readme.title + "。") : null,
								info.readme.summary ? el("p", { className: styles.desc }, info.readme.summary) : null,
							)
							: null,
						el("p", { className: styles.status },
							t("packageName") + "：" + (info.packageName ?? t("noPackage"))),
						info.packageName ? el("button", {
							type: "button",
							className: styles.toggle,
							disabled: installing === repoInfo.repo,
							onClick: () => install(repoInfo.repo, info.packageName),
						}, installing === repoInfo.repo ? t("installing") : t("install")) : null,
					);
				}
			}
			return el("section", { className: styles.section, "aria-busy": state.status === "loading" },
				state.status === "ready" && state.data.compat && !state.data.compat.supported
					? el("p", { className: styles.message, "data-error": "true" }, state.data.compat.notice)
					: null,
				message !== null ? el("p", { className: styles.message }, message) : null,
				el("h3", null, t("marketTitle")),
				el("p", { className: styles.note }, t("direct")),
				el("div", { className: styles.search },
					el("input", {
						type: "search",
						value: query,
						placeholder: t("searchPlaceholder"),
						"aria-label": t("search"),
						onChange: (event) => setQuery(event.currentTarget.value),
						onKeyDown: (event) => { if (event.key === "Enter") search(); },
					}),
					el("button", { type: "button", onClick: search }, t("search")),
				),
				marketRows.length > 0 ? el("ul", { className: styles.market }, marketRows) : null,
				detail,
				el("h3", null, t("installedTitle")),
				state.status === "loading"
					? el("p", { className: styles.status }, t("loading"))
					: state.status === "error"
						? el("div", { className: styles.detail },
							el("p", { className: styles.status, "data-error": "true" }, t("error")),
							el("button", { type: "button", className: styles.toggle, onClick: refresh }, t("retry")))
						: state.data.entries.length === 0
							? el("p", { className: styles.status }, t("empty"))
							: el("ul", { className: styles.list }, rows),
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
