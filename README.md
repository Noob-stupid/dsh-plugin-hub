> **English**: [README.md](README.md) | **中文**: [README.zh.md](README.zh.md)

---

<img width="1170" height="609" alt="image" src="https://github.com/user-attachments/assets/b802d606-14ba-4151-9956-ff642ed12b0a" />

# DSH Plugin Hub (dsh-plugin-hub)

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

A **plugin management panel** for the DeepSeek Harness (DSH) Web GUI: one-click
enable/disable of installed plugins, plus a **multi-source plugin marketplace**
(GitHub / Gitee / custom sources) with one-click install.

- Host side: loopback HTTP routes (state / toggle / search / repo / install / sources),
  reading/writing the profile user patch layer `cordis.patch.yml`, applied live by DSH HMR;
- Browser side: Settings → Plugins → **Plugin Console** tab (toggle list + multi-source marketplace);
- GitHub source uses **browser-direct** (falls back to the server channel when GitHub is
  unreachable); Gitee and custom sources use the server channel.

## One-click install

### Option 1: official command (recommended)

The plugin declares a `dsh.bundle` manifest, so a single command installs and enables it:

```sh
dsh plugin --profile web add github:Noob-stupid/dsh-plugin-hub
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

Requires: DSH ≥ 0.1.0-rc.6 (web profile, with `dsh-client-modules` / `dsh-host-plugin-inventory`).

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
- **Details panel**: version, repository/homepage links and a README summary for each plugin.

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
- "Add locally" installs through the current source (registry first, git fallback) and writes
  the enable entry.

### Source Manager

The floating "Sources" button (right of the title row, semi-transparent) opens the manager:

- **Install sources (registry)**: add / inline edit / set primary / restore defaults;
  private and intranet addresses supported; **deletion is protected** (install-critical);
- **Search sources**: built-in GitHub, Gitee + custom search sources (add/remove, `🔒` shows
  header count);
- **Gitee login (optional)**: direct mode needs no login; login only raises rate limits —
  create a third-party app (gitee.com → Data management → Third-party apps, scopes
  user_info, projects), fill client_id / client_secret, save, then authorize.

## How it works

The DSH web profile is composed of a bundle patch layer plus the user patch layer
(`$DSH_HOME/profiles/web/cordis.patch.yml`); patches are **per-key overrides**.
Toggling a plugin just appends/removes two YAML lines:

```yaml
- id: plugin-entry-id
  disabled: true
```

The config watcher (HMR) recomposes within ~1s — no restart needed except for host code.

**Install chain**: configured registries in primary→backup order (default npmmirror → npmjs) →
**curl manual install** (when node networking is blocked, curl downloads the tarball into
node_modules) → git channel (GitHub via proxy+direct, Gitee via its platform) → Windows
EPERM stale-dir cleanup retry → subpackage expansion (aggregate first) → **local AI fallback**.

## Compatibility

- Supports the **DSH 0.1.0 series** (`0.1.0-rc.6` and siblings).
- The panel reads the running `@deepseek-ai/dsh-web-app` version: after a breaking upgrade
  (0.2 / 1.0) a compatibility warning appears instead of silent failure.
- Likely breaking seams: patch semantics, `webServer.register`, loader entry shape,
  `dsh.client` bundle format, `settings.plugins.tab` slot.
- Deploy scripts do not check versions; the in-panel warning is authoritative.

## Project layout

```
lib/index.js       Host plugin (/plugin-console/* routes + patch I/O + multi-source search + npm install)
lib/client.js      Browser bundle (ModuleLoader format, settings tab)
scripts/apply-framework-patch.cjs   Framework patch (issue #5, idempotent)
deploy.ps1 / deploy.sh   One-click deploy scripts (Windows / Linux·macOS)
test-harness.mjs   Logic self-test (state/toggle/validation/loopback; search SKIP by network)
```
<img width="1878" height="945" alt="image" src="https://github.com/user-attachments/assets/b26f2f19-0ba4-4be7-9ca1-b3fd4c51a7a8" />

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

## Security

- All routes are loopback-only;
- GitHub metadata is used only to discover public plugins; npm installs keep full TLS
  validation against the registry;
- GitHub search is browser-direct; Gitee/custom source requests and headers (including
  credentials) are handled server-side only and never shipped to the browser;
- Custom source URLs accept https and local/private http only (127.0.0.1, localhost,
  10.x, 192.168.x, 172.16-31.x, etc.).

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

## License

MIT
