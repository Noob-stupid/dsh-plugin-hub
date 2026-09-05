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
