### Framework upgrade safety & plugin adapt gate (v0.3.25)

> Origin: the 2026-09-04 DSH `0.1.1-rc.2 → 0.1.2-rc.1` incident — the upgrade script ran in
> the wrong working directory, overwrote the new CLI into the old `.pnpm` entry, left a
> mixed-version tree, and the service could not start. This version makes upgrade safety
> and plugin compatibility detection first-class console mechanisms.

**Upgrade safety trio**

1. **Framework root detection**: locates the real install root (the top-level `node_modules`
   containing `.pnpm`), fixing the `require.resolve`-returns-`.pnpm`-realpath root cause
   (relink no-op / new package overwriting the old tree); refuses to upgrade when the root
   cannot be identified (service stays running);
2. **Full-tree checkpoint before upgrade**: mirrors every `@deepseek-ai` version package in
   `.pnpm` + the top-level scope + `lock.yaml`
   (under `~/.dsh/plugin-console/framework-backups/<version>/fw-tree/`);
3. **Automatic full-tree rollback + retry**: install failure or relaunch failure restores
   the pre-upgrade tree and relaunches automatically — no more "please run it manually"
   dead-ends; after rollback, relink/repair steps are skipped to avoid damaging the
   restored tree a second time.

**One-click rollback**: after an upgrade the framework card shows a **「回滚到上一版」** button
(`/plugin-console/framework-rollback`): stop service → restore full tree → relaunch →
health check, state visible throughout.

**Plugin adapt gate (compatibility detection)**

- After an upgrade, plugin entries recorded in `~/.dsh/plugin-console/compat-pending.json`
  are **force-disabled**; the enable button is locked and the server rejects `/toggle` with
  409 (unbypassable). The enabled-button label itself shows「待适配」as the state hint;
- The **details** panel explains the flow: **Check update → Update & adapt**;
- **Post-update auto-verification**: scans the latest `package.json` for an explicit
  `dsh.engines.framework` / `engines.dsh` declaration plus `@deepseek-ai/*` dependency
  ranges (built-in zero-dependency semver engine — strict npm prerelease rules for
  dependencies, loose for explicit declarations); if the version changed and no
  incompatibility was found, the `disabled` block is **removed automatically** and the row
  unlocks; aggregator updates validate all synced subpackages too;
- **AI Empower pre-check**: during planning the server pre-checks the registry's latest
  declaration and adapt-gate hits, injects them into the subagent prompt (the plan must
  explain the conclusion to the user) and marks it on the plan panel (red for incompatible).
