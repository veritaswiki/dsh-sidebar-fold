# dsh-sidebar-fold — Fold DSH sidebar plugin entries

Folds the plugin entries in the DSH sidebar into the **Plugins** row: a small arrow at the right edge of that row expands / collapses the group, and the settings page picks entry by entry which ones belong to it.

**Presentation only — no plugin is modified.**

## Features

- **Arrow on the row** — the official Plugins row gets a chevron at its right edge (▾ / ▸); clicking it folds or unfolds the group, while clicking anywhere else on the row still opens the plugins page as usual. Folded, the sidebar keeps only Plugins and More.
- **Per-entry switches** — `Settings → Sidebar plugin entries` holds the fold toggle plus the list of entries in the group: switch one off and it always stays in the sidebar on its own. Batch buttons for "group all" / "group none".
- **Same page from the plugin detail** — opening `dsh-sidebar-fold` in the plugin manager shows the very same configuration page.
- **No folding in the icon rail** — when the sidebar collapses to an icon rail, folding and click interception are skipped; the rail is already compact.
- Folded by default, works right after install.

## What it does — and what it does not

Only two things:

1. renders a tiny `<style>` block that hides the rows inside the group;
2. intercepts clicks on the right-most 30px of the Plugins row during the document capture phase, toggling the fold instead of navigating.

It does not inject into, rewrite, or proxy any plugin; adds no sidebar entry; opens no menu. The `<style>` disappears on uninstall. Colors, font sizes and dividers come only from host theme tokens (`--dsw-alias-*`) — no hard-coded colors, no Harness Client packages imported.

## Install

This is a DSH (Cordis) bundle; two ways to install it.

### A. Through `plugin_manager` (recommended)

Ask the agent in DSH to install `dsh-sidebar-fold`; it calls `plugin_manager`:

- `action: "install_bundle"`, `target` = an install spec:
  - local clone: `file:/abs/path/to/dsh-sidebar-fold`
  - or the repository: `github:veritaswiki/dsh-sidebar-fold`
- then `action: "set_bundle"` to enable it.

> The first release is **not published to the npm registry**, so it is not searchable on npm.

### B. Manually attach to a profile

1. Put the repository anywhere (referred to as `/abs/path/to/dsh-sidebar-fold`).
2. Edit the profile's `package.json` (`~/.dsh/profiles/<profile>/package.json`):
   - add `"dsh-sidebar-fold": "link:/abs/path/to/dsh-sidebar-fold"` to `dependencies`
   - add `"dsh-sidebar-fold"` to the `dsh.profile.bundles` array
3. Install dependencies in the profile directory (DSH also does this on its next start).

### Dependencies

`index.js` needs `@deepseek-ai/schemastery` for host-side Config validation. **DSH ships that package, so no separate install is needed** — the `dependencies` entry just states the relationship. This repository does not vendor `node_modules`.

## Version coupling and fail-open behavior

- Folding relies on the sidebar rendering panel rows as `[class*="_panelList"] > button[aria-label="…"]`, plus `_root` / `_collapsed` / `data-sidebar-collapsed` markers describing the sidebar shape. The selectors were verified against **DSH 0.2.2-rc.1**; `engines.dsh` is declared as `>=0.2.2-rc.1`.
- **Fail-open**: if a DSH upgrade changes that DOM, the worst case is that **folding stops hiding entries** (the arrow may remain, or disappear too). It does not throw, does not block clicks, and does not corrupt configuration. Every read is wrapped in try/catch and falls back to the default behavior (no folding).
- If folding breaks after an upgrade, the only places to adapt are the `SIDEBAR_SCOPE` constant and the `foldRules()` / `chevronRules()` functions in `client.js`.

## Persistence

The fold state and the "entries outside the group" list are **written twice**:

| Location | Role |
| --- | --- |
| Host Config (profile Cordis config, fields `folded` / `excluded`) | source of truth, shared across ports and browsers |
| `localStorage` (`dsh.sidebar-fold.folded` / `dsh.sidebar-fold.excluded`) | first-frame flicker guard; read-only fallback when Host Config is unavailable |

Host Config is read first and both are written together. It is declared `volatile()`, so hot reloads do not restart the plugin.

Note: `localStorage` follows the page origin (port); changing ports means a new origin, so that cache returns to the folded default — the Host Config copy still applies.

## Files

| File | Purpose |
| --- | --- |
| `package.json` | bundle manifest: `dsh.bundle.patch` + `dsh.client` (web, immediate) |
| `cordis.patch.yml` | inserts the `sidebar-fold` loader row (`insert.name` must equal the package name) |
| `index.js` | host side: volatile `Config`, disables the auto-generated generic form |
| `client.js` | all client logic: fold engine, row arrow, settings page |
| `locale/zh.json`, `locale/en.json` | title and description for the plugin manager |
| `icon.svg` | plugin icon |

## Known limitations

- Entries are matched by row title (`aria-label`); two entries with an identical title fold together (rare).
- The 30px hot zone at the right edge of the Plugins row overlaps the host's own click target and is resolved during the document capture phase; a heavily customized theme may shift it.
- Order in the settings page follows the sidebar slot `order`.

## Development and checks

```bash
node --check index.js
node --check client.js
node scripts/sanitize-check.mjs
```

`scripts/sanitize-check.mjs` is the sanitization gate: no absolute home paths, no private package scope, no loopback addresses — any hit exits with code 1. CI runs exactly these steps (syntax + sanitization) and does not publish to npm.

## License

MIT © 2026 veritaswiki
