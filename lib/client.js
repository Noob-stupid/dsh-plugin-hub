window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-plugin-console",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region styles
		const css = ".pc_section{width:100%;max-width:760px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:14px;display:flex}.pc_section h3{margin:0;font-size:13px;font-weight:600;line-height:20px}.pc_message{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px;margin:0}.pc_messageRow{display:flex;align-items:center;gap:10px}.pc_spinner{width:14px;height:14px;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-state-business-primary);border-radius:50%;animation:pcspin 1s linear infinite;flex:none}@keyframes pcspin{to{transform:rotate(360deg)}}.pc_message[data-error=true]{color:var(--dsw-alias-state-error-primary)}.pc_list{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0;padding:0;list-style:none;display:grid}.pc_row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;min-width:0;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_rowTop{align-items:center;gap:8px;display:flex}.pc_name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}.pc_tag{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 8px;font-size:11px;line-height:16px;flex:none}.pc_tag[data-enabled=true]{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}.pc_tag[data-user=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.pc_meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;gap:6px;display:flex;align-items:center}.pc_phase[data-phase=failed]{color:var(--dsw-alias-state-error-primary)}.pc_phase[data-phase=active]{color:var(--dsw-alias-state-success-primary)}.pc_toggle{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:4px 12px;align-self:flex-start}.pc_toggle:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}.pc_toggle:disabled{opacity:.5;cursor:default}.pc_search{gap:8px;display:flex}.pc_search input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);height:34px;flex:1;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;padding:0 12px;font-size:13px}.pc_search input:focus-visible{border-color:var(--dsw-alias-state-business-primary)}.pc_search button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);font:inherit;cursor:pointer;border-radius:8px;padding:0 14px;font-size:13px}.pc_search button:hover{border-color:var(--dsw-alias-state-business-primary)}.pc_market{flex-direction:column;gap:10px;margin:0;padding:0;list-style:none;display:flex}.pc_item{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;min-width:0;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_itemTop{align-items:center;gap:8px;display:flex}.pc_itemTop a{color:var(--dsw-alias-state-business-primary);font-size:13px;font-weight:600;text-decoration:none;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pc_stars{color:var(--dsw-alias-label-tertiary);font-size:11px;flex:none}.pc_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0}.pc_item button{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:3px 10px;align-self:flex-start;font-size:12px}.pc_item button:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}.pc_item button:disabled{opacity:.5;cursor:default}.pc_detail{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;padding:10px 12px;flex-direction:column;gap:6px;display:flex}.pc_status{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:0}.pc_note{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin:0}.pc_marketHead{display:flex;align-items:center;justify-content:space-between;gap:10px}.pc_descWrap{flex-direction:column;display:flex}.pc_installedHead{display:flex;align-items:center;gap:10px}.pc_backTopWrap{position:fixed;top:56px;right:20px;z-index:100;display:flex;flex-direction:column;gap:8px}.pc_backTop{width:34px;height:34px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:rgba(22,27,34,.72);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);cursor:pointer;backdrop-filter:blur(4px);opacity:.7}.pc_backTop:hover{opacity:1;border-color:var(--dsw-alias-state-business-primary)}.pc_descTopbar{display:flex;justify-content:flex-end;margin:2px 0}.pc_ghpill{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 10px;font-size:11px;line-height:18px}.pc_ghpill[data-on=true]{border-color:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-state-success-primary)}.pc_extraBtn{opacity:.45;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:0 0;font:inherit;cursor:pointer;border-radius:6px;padding:4px 10px;font-size:12px;line-height:16px;flex:none;transition:opacity .15s ease}.pc_extraBtn:hover{opacity:.8}.pc_extraBtn[data-active=true]{opacity:1;border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}";
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
					searchInstalledPlaceholder: "搜索已安装插件（名称或 id）",
			extraFilter: "额外",
			extraFilterTitle: "只看额外插件（非 dsh 自带）",
			extraEmpty: "没有额外的插件（非 dsh 自带）。",
			noMatch: "没有匹配的插件。",
			loadMore: "加载更多",
			loadingMore: "加载中…",
			backToSearch: "回到搜索",
			collapseResults: "收起搜索结果",
			expandResults: "展开搜索结果",
			reloadPage: "刷新页面",
			stageLabel: "阶段",
			stagePreparing: "准备中",
			stageInstalling: "下载安装中（可离开本页，后台继续）",
			stageConfiguring: "写入启用配置",
			elapsed: "已用时",
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
			githubCornerOut: "Not signed in to GitHub",
					searchInstalledPlaceholder: "Search installed plugins (name or id)",
			extraFilter: "Extra",
			extraFilterTitle: "Show only extra plugins (not bundled with dsh)",
			extraEmpty: "No extra (non-bundled) plugins.",
			noMatch: "No matching plugins.",
			loadMore: "Load more",
			loadingMore: "Loading…",
			backToSearch: "Back to search",
			collapseResults: "Collapse results",
			expandResults: "Expand results",
			reloadPage: "Reload page",
			stageLabel: "Stage",
			stagePreparing: "Preparing",
			stageInstalling: "Downloading & installing (safe to leave this page)",
			stageConfiguring: "Writing enable config",
			elapsed: "Elapsed",
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
		/** raw 文件多通道竞速：官方直连 + 常见 gh 镜像，谁先成功用谁。 */
		const RAW_CANDIDATES = [
			(repo, branch, file) => `${GITHUB_RAW}/${repo}/${branch}/${file}`,
			(repo, branch, file) => `https://ghproxy.net/https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
			(repo, branch, file) => `https://ghfast.top/https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
			(repo, branch, file) => `https://mirror.ghproxy.com/https://raw.githubusercontent.com/${repo}/${branch}/${file}`,
		];
		async function fetchRawText(repo, branch, file) {
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
			const pkgText = await fetchRawText(repo, branch, "package.json");
			if (pkgText !== null) {
				try { pkg = JSON.parse(pkgText); } catch {}
			}
			const readmeText = await fetchRawText(repo, branch, "README.md");
			if (readmeText !== null) readme = summarizeReadmeText(readmeText);
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
				dshHint: pkg !== null && (
					typeof pkg.name === "string" && /(^|-)dsh[-/]/u.test(pkg.name)
					|| pkg.peerDependencies !== undefined && pkg.peerDependencies["@deepseek-ai/cordis"] !== undefined
					|| Array.isArray(pkg.keywords) && pkg.keywords.includes("dsh-plugin")
				),
			};
		}
		/** 只取仓库的 npm 包名与 private 标记（跳过 README 与 api.github.com，供"添加到本地"快捷路径使用）。 */
		async function fetchPackageName(repo, seedBranch) {
			const branch = typeof seedBranch === "string" && seedBranch ? seedBranch : "main";
			const pkgText = await fetchRawText(repo, branch, "package.json");
			if (pkgText !== null) {
				try {
					const pkg = JSON.parse(pkgText);
					if (pkg && typeof pkg.name === "string") return { name: pkg.name, private: pkg.private === true };
				} catch {}
			}
			return null;
		}
		/** monorepo 子包列表：git trees 递归列出 packages 目录下的 package.json，逐个取 npm 包名（上限 24 个）。 */
		async function fetchSubpackages(repo, branch) {
			const data = await githubFetch(`https://api.github.com/repos/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
			const paths = (data.tree ?? []).filter((node) => node.type === "blob" && /^packages\/[^/]+\/package\.json$/u.test(node.path)).map((node) => node.path);
			if (paths.length === 0) return [];
			const out = [];
			for (const path of paths.slice(0, 24)) {
				const text = await fetchRawText(repo, branch, path);
				if (text === null) continue;
				try {
					const pkg = JSON.parse(text);
					if (pkg && typeof pkg.name === "string") out.push({ dir: path.split("/")[1], name: pkg.name });
				} catch {}
			}
			return out;
		}
		function PluginConsoleTab({ t }) {
			const [state, setState] = react.useState({ status: "loading" });
			const [busy, setBusy] = react.useState(null);
			const [message, setMessage] = react.useState(null);
			const [reloadHint, setReloadHint] = react.useState(false);
			const [jobs, setJobs] = react.useState({});
			const [query, setQuery] = react.useState("");
			const [market, setMarket] = react.useState(null);
			const [marketPage, setMarketPage] = react.useState(1);
			const [loadingMore, setLoadingMore] = react.useState(false);
			const [repoInfo, setRepoInfo] = react.useState(null);
			const [subpackages, setSubpackages] = react.useState(null);
			const [installing, setInstalling] = react.useState(null);
			const [details, setDetails] = react.useState(null);
			const [expandedDescs, setExpandedDescs] = react.useState({});
			const [installedQuery, setInstalledQuery] = react.useState("");
			const [installedSearchOpen, setInstalledSearchOpen] = react.useState(false);
			const [extraOnly, setExtraOnly] = react.useState(false);
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
					(error) => setMessage(t("failed") + "：" + friendlyGithubError(error).message),
				).finally(() => setBusy(null));
			};
			const search = () => {
				setMarket({ status: "loading" });
				setRepoInfo(null);
				setMarketPage(1);
				searchFromGithub(query, 1).then(
					(data) => setMarket({ status: "ready", data, direct: true }),
					() => call("/plugin-console/search", { q: query, page: 1 }).then(
						(data) => setMarket({ status: "ready", data: data.items, direct: false }),
						(error) => setMarket({ status: "error", error: friendlyGithubError(error) }),
					),
				);
			};
			const loadMore = () => {
				if (loadingMore || market === null || market.status !== "ready") return;
				const next = marketPage + 1;
				setLoadingMore(true);
				setMarketPage(next);
				searchFromGithub(query, next).then(
					(data) => {
						setMarket({ status: "ready", data: [...market.data, ...data], direct: true });
						setLoadingMore(false);
					},
					() => call("/plugin-console/search", { q: query, page: next }).then(
						(data) => {
							setMarket({ status: "ready", data: [...market.data, ...data.items], direct: false });
							setLoadingMore(false);
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
					() => setSubpackages({ status: "error" }),
				);
			};
			const inspect = (item) => {
				const repo = item.fullName;
				setRepoInfo({ status: "loading", repo });
				setSubpackages(null);
				repoInfoFromGithub(repo, item).then(
					(data) => {
						setRepoInfo({ status: "ready", repo, data, direct: true });
						if (data.privateRoot) loadSubpackages(repo, data.defaultBranch);
					},
					() => call("/plugin-console/repo", { repo }).then(
						(data) => {
							setRepoInfo({ status: "ready", repo, data, direct: false });
							if (data.privateRoot) loadSubpackages(repo, data.defaultBranch);
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
							if (data.status !== "installing") {
								stopJobPolling(jobId);
								if (data.status === "done") {
									setMessage(t("installed") + "：" + data.packageName + "（" + (data.entryId ?? "") + "）。" + (data.bundle ? t("bundleNote") : t("installNote")));
									setReloadHint(true);
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
			const startJob = (repo, packageName) => {
				setInstalling(repo);
				setReloadHint(false);
				setMessage(null);
				call("/plugin-console/install", { repo, packageName }).then(
					(data) => {
						if (data && data.jobId) {
							setJobs((prev) => ({
								...prev,
								[data.jobId]: { jobId: data.jobId, repo, packageName, status: "installing", stage: "preparing", startedAt: Date.now() },
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
			// 卸载时清理轮询定时器
			react.useEffect(() => () => {
				for (const timer of Object.values(jobTimersRef.current)) window.clearInterval(timer);
			}, []);
			/** 搜索结果卡片上的"添加到本地"：浏览器直连取包名 → 启动后台安装任务，失败回退宿主取包名。 */
			const addLocal = (item) => {
				if (installing !== null) return;
				setInstalling(item.fullName);
				setMessage(null);
				const installWith = (info) => {
					if (info === null || info === undefined || !info.name) {
						setMessage(t("failed") + "：" + t("needPackage"));
						setInstalling(null);
						return;
					}
					if (info.private === true) {
						setMessage(t("failed") + "：" + t("privateRootHint") + "；请点" + t("view") + "，在详情里选择子包安装");
						setInstalling(null);
						return;
					}
					startJob(item.fullName, info.name);
				};
				fetchPackageName(item.fullName, item.defaultBranch).then(
					installWith,
					() => call("/plugin-console/repo", { repo: item.fullName }).then(
						(data) => installWith({ name: data.packageName, private: data.privateRoot === true }),
						(error) => {
							setMessage(t("failed") + "：" + friendlyGithubError(error).message);
							setInstalling(null);
						},
					),
				);
			};
			const installedQueryNorm = installedQuery.trim().toLowerCase();
			const extraIds = new Set((state.status === "ready" ? state.data.patch?.inserts ?? [] : []));
			const extraCount = state.status === "ready" ? state.data.entries.filter((entry) => extraIds.has(entry.rowId)).length : 0;
			const rows = state.status === "ready"
				? state.data.entries.filter((entry) => {
					if (extraOnly && !extraIds.has(entry.rowId)) return false;
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
							}, t("details")),
						),
						detailPanel,
					);
				})
				: [];
			const marketRows = market === null ? [] : market.status === "loading"
				? [el("p", { key: "m", className: styles.status }, t("marketLoading"))]
				: market.status === "error"
					? [el("div", { key: "m", className: styles.detail },
						el("p", { className: styles.status, "data-error": "true" }, t("marketError") + "：" + market.error.message),
						el("button", { type: "button", className: styles.toggle, onClick: search }, t("retry")))]
					: market.data.length === 0
						? [el("p", { key: "m", className: styles.status }, t("marketEmpty"))]
						: market.data.map((item) => {
							const desc = item.description ?? "";
							const long = desc.length > 90;
							const open = expandedDescs[item.fullName] === true;
							const shown = long && !open ? desc.slice(0, 90) + "…" : desc;
							return el("li", { key: item.fullName, className: styles.item },
								el("div", { className: styles.itemTop },
									el("a", { href: item.htmlUrl, target: "_blank", rel: "noreferrer" }, item.fullName),
									el("span", { className: styles.stars }, "★ " + item.stars),
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
									el("button", {
										type: "button",
										className: styles.toggle,
										disabled: installing === item.fullName,
										onClick: () => addLocal(item),
									}, installing === item.fullName ? t("installingLocal") : t("addLocal")),
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
							onClick: () => startJob(repoInfo.repo, info.packageName),
						}, installing === repoInfo.repo ? t("installing") : t("install")) : null,
						info.privateRoot ? el("div", null,
							el("p", { className: styles.status, "data-error": "true" }, t("privateRootHint")),
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
			return el("section", { className: styles.section, "aria-busy": state.status === "loading" },
				state.status === "ready" && state.data.compat && !state.data.compat.supported
					? el("p", { className: styles.message, "data-error": "true" }, state.data.compat.notice)
					: null,
				message !== null ? el("div", { className: styles.messageRow }, el("p", { className: styles.message }, message), reloadHint ? el("button", { type: "button", className: styles.toggle, onClick: () => window.location.reload() }, t("reloadPage")) : null) : null,
				el("div", { className: styles.marketHead },
					el("h3", null, t("marketTitle")),
					el("span", { className: styles.ghpill, "data-on": state.status === "ready" && state.data.github && state.data.github.loggedIn ? "true" : "false" },
						state.status === "ready" && state.data.github && state.data.github.loggedIn
							? t("githubLoggedIn") + (state.data.github.login ?? "unknown")
							: t("githubCornerOut"))),
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
				el("p", { className: styles.note }, t("direct")),
				el("div", { className: styles.search, id: "pc-market-search" },
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
					const stageKey = job.stage === "preparing" ? "stagePreparing" : job.stage === "configuring" ? "stageConfiguring" : "stageInstalling";
					const elapsed = Math.max(0, Math.round((Date.now() - (job.startedAt ?? Date.now())) / 1000));
					return el("div", { key: job.jobId, className: styles.detail },
						el("div", { className: styles.rowTop },
							el("span", { className: styles.spinner }),
							el("strong", { className: styles.name }, t("installingLocal") + "：" + (job.packageName ?? job.repo))),
						el("p", { className: styles.status },
							t("stageLabel") + "：" + t(stageKey) + " · " + t("elapsed") + " " + elapsed + "s"));
				}),
				(state.status === "ready" ? state.data.recentFailures ?? [] : []).map((job) =>
					el("div", { key: "fail-" + job.jobId, className: styles.detail },
						el("div", { className: styles.rowTop },
							el("span", { className: styles.phase, "data-phase": "failed" }, t("recentFailures")),
							el("strong", { className: styles.name }, job.packageName ?? job.repo)),
						el("p", { className: styles.message, "data-error": "true" }, job.error ?? ""),
						el("div", { className: styles.rowTop },
							el("button", { type: "button", className: styles.toggle, onClick: () => startJob(job.repo, job.packageName) }, t("retry")))),
				),
				!marketCollapsed ? detail : null,
				el("div", { id: "pc-installed-search-area" },
					el("div", { className: styles.installedHead },
						el("h3", null, t("installedTitle")),
						el("button", { type: "button", className: styles.toggle, onClick: () => setInstalledSearchOpen((v) => !v) }, t("search"))),
					installedSearchOpen
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
								"data-active": extraOnly ? "true" : "false",
								title: t("extraFilterTitle"),
								"aria-label": t("extraFilterTitle"),
								onClick: () => setExtraOnly((v) => !v),
							}, extraOnly ? t("extraFilter") + " · " + extraCount : t("extraFilter")),
							)
						: null),
				state.status === "loading"
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
