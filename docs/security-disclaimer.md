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
