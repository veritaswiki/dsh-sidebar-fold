# dsh-sidebar-fold — Fold DSH sidebar plugin entries

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node >= 20](https://img.shields.io/badge/node-%3E%3D20-339933.svg)](https://nodejs.org/en/download)
<!-- npm: first publish pending; uncomment once the package is on the registry.
[![npm version](https://img.shields.io/npm/v/dsh-sidebar-fold-native.svg)](https://www.npmjs.com/package/dsh-sidebar-fold-native)
-->

Folds the plugin entries in the DSH sidebar into the **Plugins** row: a small arrow at the right edge opens the group, **the group then collapses itself again**, and the settings page decides which entries belong to it and how soon it folds back.

**Presentation only — no plugin is modified.**

## Features

- **Arrow on the row** — the official Plugins row gets a chevron at its right edge (▾ / ▸); clicking it folds or unfolds the group, while clicking anywhere else on the row still opens the plugins page as usual. Folded, the sidebar keeps only Plugins and More.
- **Auto-collapse** — after opening the group it folds itself back on three triggers: ① N ms without interaction (default 5000 ms, adjustable 1000–30000, `0` = off); ② opening any entry in the group (immediate, no waiting for the timeout); ③ the pointer leaving the sidebar (optional, off by default). Pointer movement or a keypress while open restarts the countdown.
- **Per-entry switches** — `Settings → Sidebar plugin entries` holds the fold toggle, the four fold-behaviour rows, and the list of entries in the group: switch one off and it always stays in the sidebar on its own. Batch buttons for "group all" / "group none" plus "restore defaults".
- **Same page from the plugin detail** — opening `dsh-sidebar-fold-native` in the plugin manager shows the very same configuration page.
- **No folding in the icon rail** — when the sidebar collapses to an icon rail, folding and click interception are skipped; the rail is already compact.
- Folded by default, works right after install.

## What it does — and what it does not

Only three things:

1. renders a tiny `<style>` block that hides the rows inside the group;
2. intercepts clicks on the right-most 30px of the Plugins row during the document capture phase, toggling the fold instead of navigating;
3. runs one `setTimeout` for the auto-collapse, cleared and re-armed on every pointer/key event, and cleared when the group folds, the plugin unmounts, or the sidebar becomes an icon rail.

It does not inject into, rewrite, or proxy any plugin; adds no sidebar entry; opens no menu. The `<style>` disappears on uninstall. Colors, font sizes and dividers come only from host theme tokens (`--dsw-alias-*`) — no hard-coded colors, no Harness Client packages imported.

## Install

This is a DSH (Cordis) bundle; two ways to install it.

### A. Through `plugin_manager` (recommended)

Ask the agent in DSH to install `dsh-sidebar-fold-native`; it calls `plugin_manager`:

- `action: "install_bundle"`, `target` = an install spec:
  - local clone: `file:/abs/path/to/dsh-sidebar-fold`
  - or the repository: `github:veritaswiki/dsh-sidebar-fold`
- then `action: "set_bundle"` to enable it.

> The npm package is named `dsh-sidebar-fold-native` because the unscoped `dsh-sidebar-fold` on npm belongs to another author; the repository keeps its name.

### B. Manually attach to a profile

1. Put the repository anywhere (referred to as `/abs/path/to/dsh-sidebar-fold`).
2. Edit the profile's `package.json` (`~/.dsh/profiles/<profile>/package.json`):
   - add `"dsh-sidebar-fold-native": "link:/abs/path/to/dsh-sidebar-fold"` to `dependencies`
   - add `"dsh-sidebar-fold-native"` to the `dsh.profile.bundles` array
3. Install dependencies in the profile directory (DSH also does this on its next start).

### Dependencies

`index.js` needs `@deepseek-ai/schemastery` for host-side Config validation. **DSH ships that package, so no separate install is needed** — `package.json` declares it under `peerDependencies` with the range `>=3.19.0-0`, an explicit prerelease branch without which harness rc builds are silently excluded. This repository does not vendor `node_modules`.

## Version coupling and fail-open behavior

- Folding relies on the sidebar rendering panel rows as `[class*="_panelList"] > button[aria-label="…"]`, plus `_root` / `_collapsed` / `data-sidebar-collapsed` markers describing the sidebar shape. The selectors were verified against **DSH 0.2.2-rc.1**; `engines.dsh` is declared as `>=0.2.2-rc.1`.
- **Fail-open**: if a DSH upgrade changes that DOM, the worst case is that **folding stops hiding entries** (the arrow may remain, or disappear too). It does not throw, does not block clicks, and does not corrupt configuration. Every read is wrapped in try/catch and falls back to the default behavior (no folding).
- If folding breaks after an upgrade, the only places to adapt are the `SIDEBAR_SCOPE` constant and the `foldRules()` / `chevronRules()` functions in `client.js`.

## Configuration

The Schemastery `Config` in `index.js` (every key is `volatile()`, so hot reloads do not restart the plugin):

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `folded` | boolean | `true` | Current folded state; starts folded right after install |
| `excluded` | string[] | `[]` | Entry ids that stay out of the group |
| `autoCollapse` | boolean | `true` | Fold the group back after a while |
| `autoCollapseDelayMs` | number | `5000` | Idle milliseconds before folding; `0` disables it, otherwise clamped to 1000–30000 |
| `collapseOnEntryClick` | boolean | `true` | Fold immediately after opening an entry in the group |
| `collapseOnPointerLeave` | boolean | `false` | Fold when the pointer leaves the sidebar area (may fold too eagerly, off by default) |

## Persistence

The fold state and the "entries outside the group" list are **written twice**:

| Location | Role |
| --- | --- |
| Host Config (profile Cordis config, fields `folded` / `excluded` / `autoCollapse` / `autoCollapseDelayMs` / `collapseOnEntryClick` / `collapseOnPointerLeave`) | source of truth, shared across ports and browsers |
| `localStorage` (`dsh.sidebar-fold.folded` / `.excluded` / `.behavior`) | first-frame flicker guard; read-only fallback when Host Config is unavailable |

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

- **It depends on the host's sidebar DOM.** Folding locates rows through `[class*="_panelList"] > button[aria-label="…"]`, verified against **DSH 0.2.2-rc.1**; a major host redesign (renaming `_panelList`, changing the row button, or dropping the `_collapsed` / `data-sidebar-collapsed` markers) makes folding stop working.
- **Failure is fail-open, not a crash.** The worst case is that entries stop being hidden (the arrow may disappear too): nothing throws, clicks are not blocked, and no configuration is corrupted. Every read is wrapped in try/catch and falls back to "do not fold".
- **Presentation layer only.** It does not inject into, rewrite, or proxy any plugin, adds no sidebar entry and opens no menu; the `<style>` block disappears on uninstall and plugin behavior itself is untouched.
- **No folding in the icon rail.** When the sidebar collapses to an icon rail, folding and click interception are skipped entirely (rows narrower than 80px are ignored); the rail is already compact.
- Entries are matched by row title (`aria-label`); two entries with an identical title fold together (rare).
- The 30px hot zone at the right edge of the Plugins row overlaps the host's own click target and is resolved during the document capture phase; a heavily customized theme may shift it.
- Order in the settings page follows the sidebar slot `order`.
- **Auto-collapse depends on pointer/keyboard events.** While the group is open only `pointermove` and `keydown` restart the countdown; a touch-only interaction that produces no pointer movement will not, so the group still folds after the delay. "Pointer left the sidebar" is judged from the sidebar container rectangle, so a heavily customized theme that resizes that container can skew it.

## Development and checks

```bash
node --check index.js
node --check client.js
node scripts/sanitize-check.mjs
```

`scripts/sanitize-check.mjs` is the sanitization gate: no absolute home paths, no private package scope, no loopback addresses — any hit exits with code 1. CI runs exactly these steps (syntax + sanitization) and does not publish to npm.

## License

MIT © 2026 veritaswiki
