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
