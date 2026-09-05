## Compatibility

- Supports the **DSH 0.1.0 series** (`0.1.0-rc.6` and siblings).
- The panel reads the running `@deepseek-ai/dsh-web-app` version: after a breaking upgrade
  (0.2 / 1.0) a compatibility warning appears instead of silent failure.
- **Plugin adapt gate (v0.3.25)**: third-party plugins incompatible with the current
  framework are force-disabled after an upgrade (enable locked); run 「Check update」to
  upgrade the plugin first — it unlocks automatically after the auto-verification passes.
  See 「Framework upgrade safety & plugin adapt gate」.
- Likely breaking seams: patch semantics, `webServer.register`, loader entry shape,
  `dsh.client` bundle format, `settings.plugins.tab` slot.
- Deploy scripts do not check versions; the in-panel warning is authoritative.
