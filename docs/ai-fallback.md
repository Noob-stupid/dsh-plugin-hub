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
