# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/) 与 [语义化版本](https://semver.org/)。

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
