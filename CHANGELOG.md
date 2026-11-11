# Changelog

## [0.2.0] - 2026-11-11

### Added

- **自动收回**：展开分组后自己收回去，三个触发条件——
  ① `autoCollapseDelayMs`（默认 `5000` 毫秒）内无操作；② 点开分组里任意入口立即收回；③ 指针离开侧栏（可选，默认关）。
  展开期间 `pointermove` / `keydown` 都会重置计时（先清后设）；收起、卸载、切到图标轨道时一律清掉计时器。
- 设置页新增「折叠行为 / Fold behaviour」分区：自动收回开关、收回延迟（毫秒，1000–30000，0 = 不收）、
  点击入口后立即收回、指针移出收回，以及「恢复默认」。
- Host Config 新增 4 个 `volatile()` 键：`autoCollapse` / `autoCollapseDelayMs` / `collapseOnEntryClick` / `collapseOnPointerLeave`。

### Changed

- 设置页信息层级重排为三段：折叠总开关 / 折叠行为 / 收进分组的入口，每段一行说明 + 控件。
- `client.js` 与 `index.js` 在两个工作副本（发布源与本地 dev 副本）之间逐字一致，仅包名字符串不同。

### Fixed

- **修好 0.1.0 的包名不一致（装不上的根因）**：`package.json` 已是 `dsh-sidebar-fold-native`，
  但 `cordis.patch.yml` 的 `insert.name`、`index.js` 的 `export const name`、`client.js` 的模块 `id` 与 `PKG_ID`
  还是旧的 `@veritaswiki/dsh-sidebar-fold`。Loader 按包名解析模块，四处不一致会让插件装上后加载失败；
  本版四处统一为 `dsh-sidebar-fold-native`。

## [0.1.0] - 2026-11-11

First public release.

> Version note: earlier iterations used internal sequence numbers (the sections below). The public series restarts here at 0.1.0; internal numbers are not carried over.


本项目遵循 [Keep a Changelog](https://keepachangelog.com/) 与 [语义化版本](https://semver.org/)。

## [Unreleased]

## [1.1.0] - 2026-11-10

运行时行为与 1.0.0 完全一致（`client.js` / `index.js` 除包名字符串外逐字未变）；本版是打包与发布层。

### Changed

- 包名改为 `@veritaswiki/dsh-sidebar-fold`：`package.json` 的 `name`、`index.js` 的 `name` 导出、
  `client.js` 的模块 id 与 `PKG_ID`、`cordis.patch.yml` 的 `insert.name` 四处逐字一致。
  原因：npm 上不带 scope 的 `dsh-sidebar-fold` 已被其他作者占用。
- `@deepseek-ai/schemastery` 从 `dependencies` 移到 `peerDependencies`，范围写成 `>=3.19.0-0`（带显式预发布分支），
  否则 harness 的 rc 版本会被静默排除。

### Added

- `publishConfig: { "access": "public", "provenance": true }`，为后续 npm 发布准备（本版尚未发包）。
- `assets/icon-180.png`：由 `icon.svg` 渲染的 180×180 位图（awesome 条目只收位图）。
- `engines.node: ">=20"`，与 CI 使用的 Node 版本对齐。
- `files` 补 `README.en.md`、`CHANGELOG.md`、`LICENSE`、`assets/icon-180.png`。
- `scripts/sanitize-check.mjs` 扩展 needle：私钥、本机 home 路径、私有包前缀（拼接写法，避免本文件自报家门）、Tailscale 100.x 段、
  内网网关名、云厂商标识、API key 与 GitHub token 前缀。
- README（中英）补 badge 行与「已知限制 / Known limitations」：依赖宿主侧栏 DOM 结构、失效时 fail-open、
  只处理展示层、图标轨道（rail）态不折叠。

## [1.0.0] - 2026-11-10

首个公开版本。

### Added

- 「插件」行行尾箭头：点击折叠 / 展开插件入口分组；折叠后侧栏只留「插件」「更多」两行。
- `设置 → 左侧插件入口` 配置页：折叠总开关、「收进分组的入口」逐项开关，以及「全部收进 / 全部移出」。
- 插件管理详情页复用同一个配置页（`plugins.bundle.config`）。
- 状态双写：Host Config（`folded` / `excluded`，`volatile()`）+ `localStorage`（首帧防闪烁与只读兜底）。
- 侧栏收成图标轨道时自动跳过折叠与点击接管。
- `locale/zh.json`、`locale/en.json` 提供插件名与描述。

### Changed

- 公开包名统一为 `dsh-sidebar-fold`：`package.json` 的 `name`、`index.js` 的 `name` 导出、
  `client.js` 的模块 id 与 `PKG_ID`、`cordis.patch.yml` 的 `insert.name` 全部逐字一致。
- 依赖 `@deepseek-ai/schemastery` 由 DSH 自带，不再随包 vendored `node_modules`。
- 补齐开源元数据：`license`、`keywords`、`repository`、`homepage`、`bugs`、`engines.dsh`。

### Notes

- 折叠选择器按 DSH 0.2.2-rc.1 实测（`[class*="_panelList"] > button[aria-label]`）。
  宿主 DOM 结构变化时 **fail-open**：最坏情况是不再隐藏入口，不报错、不挡点击、不损坏配置。
- 只折叠展示，不改变任何插件本身。
