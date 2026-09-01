> **English**: [README.md](README.md) | **中文**: [README.zh.md](README.zh.md)

---

<img width="1170" height="609" alt="image" src="https://github.com/user-attachments/assets/b802d606-14ba-4151-9956-ff642ed12b0a" />

# DSH Plugin Hub (dsh-plugin-hub)

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
[![GitHub stars](https://img.shields.io/github/stars/Noob-stupid/dsh-plugin-hub?style=flat-square&logo=github)](https://github.com/Noob-stupid/dsh-plugin-hub/stargazers)
[![License](https://img.shields.io/github/license/Noob-stupid/dsh-plugin-hub?style=flat-square)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/Noob-stupid/dsh-plugin-hub?style=flat-square)](https://github.com/Noob-stupid/dsh-plugin-hub/commits/main)
[![Registry CI](https://img.shields.io/github/actions/workflow/status/Noob-stupid/dsh-plugin-hub/registry.yml?label=registry%20CI&style=flat-square)](https://github.com/Noob-stupid/dsh-plugin-hub/actions/workflows/registry.yml)
[![topic: dsh-plugin](https://img.shields.io/badge/topic-dsh_plugin-4D6BFE?style=flat-square)](https://github.com/topics/dsh-plugin)
[![npm version](https://img.shields.io/npm/v/@noob-stupid/dsh-plugin-console?style=flat-square)](https://www.npmjs.com/package/@noob-stupid/dsh-plugin-console)
[![npm downloads](https://img.shields.io/npm/dm/@noob-stupid/dsh-plugin-console?style=flat-square)](https://www.npmjs.com/package/@noob-stupid/dsh-plugin-console)
[![GitHub Release](https://img.shields.io/github/v/release/Noob-stupid/dsh-plugin-hub?style=flat-square)](https://github.com/Noob-stupid/dsh-plugin-hub/releases)[![dsh.so security](https://www.dsh.so/badge/dsh-plugin-hub.svg)](https://www.dsh.so/artifact/dsh-plugin-hub)
[![dsh.so install](https://www.dsh.so/badge/install/dsh-plugin-hub.svg)](https://www.dsh.so/artifact/dsh-plugin-hub)



> ## 🎉 v0.3.24 — AI Empower released (2026-08-31)
>
> Give the Plugin Console a package name or GitHub repo: the local AI reads its docs,
> drafts a **deployment plan** (install / write config / start service / health check),
> and — after your confirmation — executes it safely. Server-type components get an
> automatic control card (start/stop/status/open + dropdown). An OpenViking template
> deploys a local memory server in one flow.
>
> **Install:**
> ```bash
> npm i -g @noob-stupid/dsh-plugin-console
> # or in DSH: dsh plugin --profile web add @noob-stupid/dsh-plugin-console
> ```
> **Try it:** Plugin Console → **AI 赋能** button → enter e.g. `OpenViking` → confirm the plan.
>
> Feedback: [GitHub Issues](https://github.com/Noob-stupid/dsh-plugin-hub/issues).
A **plugin management panel** for the DeepSeek Harness (DSH) Web GUI: one-click
enable/disable of installed plugins, a **multi-source plugin marketplace**
(GitHub / Gitee / custom sources) with one-click install, an **auto-collected
static plugin & skill index** refreshed by CI every 6 hours, skill install/disable,
suite one-click assembly, and **one-click framework upgrade** (online install with
auto-rollback).

> ## 🎯 One-click framework upgrade (v0.3.13 highlight)
>
> Open the "Plugin Console" panel → **Plugin Marketplace** → the
> `deepseek-ai/deepseek-harness` card → click **"Framework Upgrade → vX"**:
> **backup config & framework (rollback point) → online install (service stays up) →
> version verification → auto-rollback on failure → auto-restart**.
>
> After upgrade, framework packages are **auto-relinked** (fixes pnpm top-level link
> staleness that caused mixed versions, e.g. an old model plugin missing vision models).
> Tested: 0.1.0-rc.8 → **0.1.1-rc.2** end-to-end automatic, rollback-safe.

<!-- TOC -->
- [Highlights](#highlights)
- [One-click install](#one-click-install)
- [Usage](#usage)
- [Features](#features)
- [How it works](#how-it-works)
- [Compatibility](#compatibility)
- [Project layout](#project-layout)
- [HTTP endpoints](#http-endpoints)
- [Local AI fallback & consent dialog](#local-ai-fallback--consent-dialog)
- [Framework patch (cordis.patch.yml parse tolerance)](#framework-patch-cordispatchyml-parse-tolerance)
- [Security](#security)
- [Disclaimer](#disclaimer)
- [Known limitations](#known-limitations)
- [Help](#help)
- [Ecosystem & discoverability](#ecosystem--discoverability)
- [Support](#support)
- [Changelog](#changelog)
- [License](#license)
<!-- /TOC -->

---

## Highlights

| | Benefit | Detail |
|---|---|---|
| 🧩 | **Plugin & skill hub** | Auto-collected index of `dsh-plugin` topic repos (**500+** by stars) plus a **Skills tab** (`agent-skills` ∪ `claude-skills` ∪ `dsh-skill`, up to 300) — browse, search, one-click install, no GitHub API calls |
| 🤖 | **Auto-collection CI** | GitHub Actions reruns `build-index` every 6 hours (manual trigger available); authors just add the `dsh-plugin` / `agent-skills` / `claude-skills` / `dsh-skill` topic — no application needed |
| ⚡ | **Instant, rate-limit-free** | The index is served as a static `marketplace/index.json` via jsDelivr CDN (10-min host cache); terminal users make **zero GitHub API calls** |
| 🔄 | **Version detection & one-click update** | Installed entries are matched against npm `dist-tags.latest` automatically; cards show **「更新 → vX」**; subpackage mismatch warnings prevent mixed-version breakage |
| 🔀 | **Multi-source** | GitHub / Gitee (direct-repo mode) / custom search sources (URL template + header auth + private http); `⊞` merges GitHub + all custom sources in parallel |
| 🔒 | **Safe by default** | Loopback-only routes; AI fallback behind an explicit cost-consent modal; infrastructure rows are toggle-protected |

> **For plugin authors**: add the `dsh-plugin` topic to your repo — the official
> [topic list](https://github.com/topics/dsh-plugin) is how both the ecosystem and this
> hub discover you. For skills, add `agent-skills` / `claude-skills` / `dsh-skill`.

---

## One-click install

### Option 1: official command (recommended)

The plugin declares a `dsh.bundle` manifest, so a single command installs and enables it:

```sh
# npm release (recommended: prebuilt, no git / build authorization needed)
dsh plugin --profile web add @noob-stupid/dsh-plugin-console

# or install from GitHub source (needs git; allowBuilds authorization on first add)
dsh plugin --profile web add github:Noob-stupid/dsh-plugin-hub
```

Uninstall / reinstall (update):

```sh
dsh plugin --profile web remove @noob-stupid/dsh-plugin-console
dsh plugin --profile web add @noob-stupid/dsh-plugin-console
```

Then restart the dsh service → refresh the page → Settings → Plugins → Plugin Console.

### Option 2: deploy script (fallback when network is restricted)

Windows (PowerShell):

```powershell
git clone https://github.com/Noob-stupid/dsh-plugin-hub "$env:TEMP\dsh-plugin-console" 2>$null; & "$env:TEMP\dsh-plugin-console\deploy.ps1"
```

Linux / macOS:

```bash
git clone https://github.com/Noob-stupid/dsh-plugin-hub /tmp/dsh-plugin-console 2>/dev/null; bash /tmp/dsh-plugin-console/deploy.sh
```

The script copies the plugin into `$DSH_HOME/profiles/<profile>/node_modules/` and
idempotently appends an enable entry to `cordis.patch.yml`. Afterwards:

1. Restart the dsh service (host code changes need a process restart; CLI restarts the
   process, the desktop client exits and reopens);
2. Refresh the page → Settings → Plugins → **Plugin Console**.

### Option 3: hand it to an AI in one sentence

> Install the DSH plugin hub (dsh-plugin-hub): run `dsh plugin --profile web add @noob-stupid/dsh-plugin-console` (npm release); if there is no dsh CLI, clone https://github.com/Noob-stupid/dsh-plugin-hub to `~/.dsh/profiles/web/node_modules/` and register it in `cordis.patch.yml` (id: plugin-console, name: @noob-stupid/dsh-plugin-console). Restart dsh web afterwards.

Requires: DSH ≥ 0.1.0-rc.6 (web profile, with `dsh-client-modules` / `dsh-host-plugin-inventory`).

---

## Usage

1. Restart DSH → open the Web GUI → **Settings → Plugins → Plugin Console**.
2. **Installed list**: toggle plugins on/off (HMR applies within ~1s), search by name/id,
   expand details (version, repository, README summary).
3. **Marketplace**: empty query on the GitHub source opens the static index (instant);
   type a query to search live. Switch sources via the login pill (GitHub / Gitee / custom);
   `⊞` merges all sources; `★` filters to `dsh plugin add`-installable packages.
4. **Skills tab**: switch 插件/技能 next to the search box to browse and install skills
   (cloned into `~/.dsh/skills/<name>/`).
5. **Install**: click 添加到本地 → the chain runs in the background (safe to leave the page);
   「检测更新」/「更新 → vX」 appear automatically for installed entries.

---

## Features

### Installed plugins (one-click toggle + details)

- **Shows only third-party plugins by default** (extra/non-bundled), tagged
  "Third-party" with a delete entry; click "All" to see the full list (1.5s flash feedback);
- Lists every plugin entry (name, load state, enabled state); search by name/id;
- Disable = append `- id: X` + `disabled: true` to the user patch layer, effective via HMR;
- Enable = remove that entry; bundle-layer rows disabled by default are overridden with
  `disabled: false`;
- Tags "Patch-disabled / Patch-forced" distinguish user patch state;
- **Infrastructure protection**: host transport/hmr/storage/settings chain plugins
  (70+ rows) are marked "Protected" and cannot be toggled — disabling them would break HMR;
- **Details panel**: version, repository/homepage links and a README summary for each plugin;
- **Version check**: 检测更新 reads npm `dist-tags.latest` (curl channel, works even when
  node networking is blocked) and warns about subpackages that need syncing (depsOutdated).

### Framework one-click upgrade (deepseek-harness card)

- The **deepseek-harness** card shows **「框架升级 → vX」** when a newer framework version is
  available (stable `latest` preferred; `next` channel when `latest` equals the installed
  version); clicking runs the full flow: backup config + framework snapshot (rollback point)
  → **online install** (service stays up, page never disconnects) → version verification →
  **auto-restart to apply**;
- **Real-time progress**: a `DSH-Upgrade` console window pops up showing live pnpm download
  progress; the in-panel progress card shows the waiting time;
- **Upgrade protection**: failed installs **auto-rollback** (robocopy, backup verified before
  upgrade), version check catches fake success, 15-min hard timeout, stall detection
  (no debug-log updates → auto switch registry), global trap fallback, and 15-min stale-state
  cleanup — the framework is never left broken;
- **pnpm channel**: npm-cli.js freezes at startup in the schtasks task environment (0-byte
  debug log, no network requests ever sent); upgrades use `corepack pnpm` (starts in ~0.4s,
  installed rc.8 in 11.5s) against the **npmmirror (China) registry**, with
  `dangerouslyAllowAllBuilds` so native modules (node-pty/koffi) compile;
- **Runtime bin resolution**: under the pnpm layout `@deepseek-ai/dsh` is a Junction — the
  relaunch step resolves `bin.js` at runtime (follows the Junction to the current version)
  instead of using a path baked in at script-generation time;
- **Card dismiss semantics**: terminal states (done/failed) are permanently dismissed on ✕
  (persisted); in-progress dismissal is session-only and the card returns after a refresh.

### Marketplace (multi-source)

- **Source switcher**: click the login pill to switch between **GitHub / Gitee / custom
  sources** (persisted); title, loading text, placeholder and note all follow the source;
- **GitHub**: default query `dsh-plugin`, browser-direct with server fallback;
- **Gitee**: official search API is retired, so it uses **direct-repo mode** — enter
  `owner/repo` (Chinese paths and full URLs supported) to find and install a repository;
- **Custom sources**: add in Source Manager (URL template with `{q}`/`{page}` placeholders),
  optional **header auth** (e.g. `Authorization: Bearer ...`), and **local/private http URLs**;
- **Multi-source summary**: the `⊞` toggle searches GitHub + all custom sources in parallel,
  merging results with source labels;
- **★ official filter**: shows only packages installable via `dsh plugin add` — root packages
  with a `dsh.bundle` manifest (official) or aggregate repos whose **subpackage carries
  `dsh.bundle`** (subpackage-installable); markers are enriched by the server (curl dual-channel)
  with a client-side fallback;
- **Type badges**: 官方 / 聚合 / 技能 (repo contains SKILL.md) recognized automatically.

### Static index market (plugin & skill tabs)

> **Hybrid architecture**: browsing uses the static index (instant, zero GitHub API calls),
> searching uses live channels (GitHub search API / multi-source parallel) — they complement
> each other: a brand-new repo can be found by live search even before it enters the index.

- Empty query on the GitHub source shows the **static index** (`marketplace/index.json`,
  jsDelivr CDN + 10-min host cache): 500+ plugins by stars, instant, **zero GitHub API calls**;
- **插件 / 技能 tabs** next to the search box: the skills tab lists auto-collected
  `agent-skills` ∪ `claude-skills` ∪ `dsh-skill` repos (up to 300);
- **Auto version check**: installed entries in the market are checked against npm
  `dist-tags.latest` in the background — cards turn into **「更新 → vX」** buttons;
- **Skill install**: skill entries install by git-clone into `~/.dsh/skills/<name>/`
  (frontmatter `name` wins over repo name; SKILL.md found at repo root or first-level
  subdirectory). Installed skills show a grey 「已装」 badge.

### Source Manager

The floating "Sources" button (right of the title row, semi-transparent) opens the manager:

![Source Manager](https://github.com/user-attachments/assets/ef712900-65ae-4f6f-9584-bacdd8d34ea1)

- **Install sources (registry)**: add / inline edit / set primary / restore defaults;
  private and intranet addresses supported; **deletion is protected** (install-critical);
- **Search sources**: built-in GitHub, Gitee + custom search sources (add/remove, `🔒` shows
  header count);
- **Gitee login (optional)**: direct mode needs no login; login only raises rate limits —
  create a third-party app (gitee.com → Data management → Third-party apps, scopes
  user_info, projects), fill client_id / client_secret, save, then authorize.

---

## How it works

### Toggle semantics

The DSH web profile is composed of a bundle patch layer plus the user patch layer
(`$DSH_HOME/profiles/web/cordis.patch.yml`); patches are **per-key overrides**.
Toggling a plugin just appends/removes two YAML lines:

```yaml
- id: plugin-entry-id
  disabled: true
```

The config watcher (HMR) recomposes within ~1s — no restart needed except for host code.

### Install chain

```
configured registries (primary→backup, default npmmirror → npmjs)
  → curl manual install        (node networking blocked: tarball into node_modules)
  → git channel                (GitHub via proxy+direct, Gitee via its platform)
  → EPERM stale-dir cleanup retry
  → repository subpackage expansion (aggregate packages first)
  → local AI fallback          (behind an explicit cost-consent modal)
```

Skills install directly by `git clone --depth 1` → copy SKILL.md bundle into
`~/.dsh/skills/<name>/` (no npm, no patch, no restart).

### Data sources

```
GitHub Actions (every 6h, repo token)
  └─ scripts/build-index.cjs: pages topic:dsh-plugin (500 by stars) + skills topics (300)
       └─ commits marketplace/index.json back to main
            └─ host reads it via jsDelivr CDN (10-min cache) → instant market, zero API calls
                 └─ live search still uses the GitHub search API (browser-direct + server channel)
```

### Version detection & installed recognition

- **Installed recognition**: match installed entries by `repository` field or module name
  against market items (repo name → package name mapping);
- **Version detection**: `check-update` reads npm `dist-tags.latest` via curl; for aggregate
  packages it also compares subpackage declared vs actual versions (depsOutdated) to prevent
  mixed-version startup conflicts.

---

## Compatibility

- Supports the **DSH 0.1.0 series** (`0.1.0-rc.6` and siblings).
- The panel reads the running `@deepseek-ai/dsh-web-app` version: after a breaking upgrade
  (0.2 / 1.0) a compatibility warning appears instead of silent failure.
- Likely breaking seams: patch semantics, `webServer.register`, loader entry shape,
  `dsh.client` bundle format, `settings.plugins.tab` slot.
- Deploy scripts do not check versions; the in-panel warning is authoritative.

---

## Project layout

```
lib/index.js       Host plugin (/plugin-console/* routes + patch I/O + multi-source search + install)
lib/client.js      Browser bundle (ModuleLoader format, settings tab)
scripts/build-index.cjs        Index builder (plugins --limit 500 / skills --skills --limit 300)
scripts/apply-framework-patch.cjs   Framework patch (issue #5, idempotent)
.github/workflows/registry.yml Auto-collection CI (every 6h + manual dispatch)
marketplace/index.json         Generated static index (jsDelivr CDN)
deploy.ps1 / deploy.sh   One-click deploy scripts (Windows / Linux·macOS)
test-harness.mjs   Logic self-test (state/toggle/validation/loopback; search SKIP by network)
```
<img width="1878" height="945" alt="image" src="https://github.com/user-attachments/assets/b26f2f19-0ba4-4be7-9ca1-b3fd4c51a7a8" />

---

## HTTP endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/plugin-console/state` | GET | Plugin list + patch state + compat + running install jobs |
| `/plugin-console/toggle` | POST | Enable/disable an entry (writes user patch layer) |
| `/plugin-console/uninstall` | POST | Remove entry + uninstall package (bundle-aware) |
| `/plugin-console/search` | POST | Multi-source search (github/gitee/custom, `multi` merge) |
| `/plugin-console/repo` | POST | Repo metadata: package.json, private root, dsh hint, **hasSkill** |
| `/plugin-console/enrich` | POST | Server-side type markers (official/aggregate/skill) |
| `/plugin-console/install` | POST | Install (plugin or `kind: skill`), returns a job id |
| `/plugin-console/install-status` | POST | Poll an install job |
| `/plugin-console/check-update` | POST | npm latest version + subpackage mismatch check |
| `/plugin-console/market-index` | POST | Static index (jsDelivr CDN, 10-min cache) |
| `/plugin-console/skills-installed` | GET | Installed skills under `~/.dsh/skills` |
| `/plugin-console/sources` | GET/POST | Registry & search-source manager, Gitee OAuth setup |
| `/plugin-console/gitee-oauth-url` / `gitee-oauth-callback` | GET | Gitee OAuth flow |
| `/plugin-console/ai-consent` | POST | Approve/cancel the AI-fallback step |
| `/plugin-console/restart` | POST | Watchdog-safe self-restart (panel button equivalent) |

---

## Local AI fallback & consent dialog

Installation goes through a **deterministic channel chain**:
`configured sources (primary→backup) → curl manual install → git channel → EPERM cleanup retry
→ repository subpackage expansion`. Only when all deterministic channels fail does the
**local AI fallback** take over.

**What it is**: a local AI subagent takes over the install — it diagnoses like a human
(inspects repo structure, finds subpackages/aggregate packages, cleans leftovers), installs
with the right package manager and writes the config. **Note: this step calls a DeepSeek API
model and may incur API costs.**

**Consent dialog (cost transparency)**:

1. After all deterministic channels fail, the task enters "waiting for authorization" and a
   top-most modal appears:
   - explicitly states "will call a DeepSeek API model, may incur API costs"
   - offers **Approve, continue** / **Cancel** (Cancel = zero cost)
   - auto-cancels after 10 minutes
2. The modal offers **"Don't ask again"** (auto-approve) — restorable at the bottom of the
   marketplace page.
3. The floating **"AI fallback"** toggle can disable the feature entirely: deterministic
   failures cancel the install, **never calling a model API (zero cost)**.

---

## Framework patch (cordis.patch.yml parse tolerance)

**Problem (issue #5)**: if `cordis.patch.yml` contains a top-level `[]` placeholder plus
later entries (two YAML root nodes), DSH fails at startup:
`end of the stream or a document separator is expected`.

**Fix location**: `parsePatchList` in the DSH framework `dsh-app-boot` — on parse failure,
top-level empty-array placeholder lines are dropped (treated as no-op) and parsing retries;
normal files, pure `[]` files, and indented sub-arrays are unaffected.

**Apply** (re-run after every DSH upgrade, which overwrites framework files):

```bash
node scripts/apply-framework-patch.cjs
```

The script locates `dsh-app-boot/lib/index.js` in the npx cache, skips when already patched
(idempotent), and keeps a `.bak-issue5` backup on first apply.

---

## Security

- All routes are loopback-only;
- GitHub metadata is used only to discover public plugins; npm installs keep full TLS
  validation against the registry;
- GitHub search is browser-direct; Gitee/custom source requests and headers (including
  credentials) are handled server-side only and never shipped to the browser;
- Custom source URLs accept https and local/private http only (127.0.0.1, localhost,
  10.x, 192.168.x, 172.16-31.x, etc.);
- Skills are plain files (SKILL.md + assets) — installing a skill does **not** execute code;
  the git clone comes from the repo you chose, review the repo before installing.

---

## Disclaimer

- The marketplace lists third-party repositories from GitHub; each plugin is developed and
  maintained by its own author and has **no affiliation with DeepSeek Harness or this hub**.
- This hub makes **no warranty** about any plugin's quality, reliability, security, license
  compliance or compatibility. Listing is **not an endorsement** — install means you have
  reviewed and accepted the risk. Read the repo source and README before installing.
- This hub is provided AS-IS; neither the hub nor its developers are liable for any damage
  (data loss, system damage, privacy leaks) caused by installing or using third-party plugins.

---

## Known limitations

- Host code changes require a **service restart** (the panel's restart button is
  watchdog-safe); client changes just need a page refresh;
- Live GitHub search depends on GitHub reachability (browser-direct + server fallback;
  during network-blackout windows retry later);
- Version detection works for npm-published packages; skill-type repos have no version concept;
- The static index is capped (500 plugins / 300 skills per build); authors bump their star
  count or wait for the 6h CI cycle to enter the index;
- Skills are discovered by `dsh-skill-filesystem` — if the current profile does not enable
  that plugin, installed skills stay dormant until it is enabled and DSH restarted.

---

## Help

- **Panel missing**: restart dsh → refresh → Settings → Plugins → Plugin Console.
- **Toggle does nothing**: infrastructure rows are "Protected" (by design); normal toggles
  take effect via HMR within 1-3s.
- **Compatibility warning**: a breaking upstream release arrived; see Compatibility.
- **Search empty/fails**: GitHub uses browser-direct (falls back to the server channel);
  Gitee is direct-repo mode (enter `owner/repo`); check custom-source URL/headers; retry
  during network blackout windows.
- **★ filter empty**: ★ shows only `dsh plugin add`-installable packages (official +
  subpackage-bundle aggregates); markers are backfilled in 1-3s — no false "none" report.
- **Install fails**: confirm the repo has package.json and the package is published; npm
  failures fall back to git install; switch the primary source if npmmirror is unstable.
- **Skill not found by DSH**: enable `@deepseek-ai/dsh-skill-filesystem` in the profile
  (`cordis.yml`) and restart; skills live in `~/.dsh/skills/<name>/`.

---

## Ecosystem & discoverability

- Listed on [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) (the community main list) and [DSH Directory](https://dsh.directory);
- This hub's own auto-collection index (500+ plugins / 300 skills, refreshed by CI every 6h) includes **any** repo tagged `dsh-plugin` / `agent-skills` / `claude-skills` / `dsh-skill` — tag your repo and it appears in the market automatically, no application needed;
- If you build DSH plugins, this panel is your distribution channel: one-click install for every user of the hub.

## Support

If this panel saves you time or makes DSH more fun to use:

- ⭐ **Star this repo** — it directly helps more DSH users find it;
- Share it with DSH users or in DSH communities;
- Submit your own plugin (tag it `dsh-plugin`) to grow the ecosystem;
- Found a bug or want a feature? [Open an issue](https://github.com/Noob-stupid/dsh-plugin-hub/issues).

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## License

MIT
