# dsh-sidebar-fold — 左侧插件折叠

把 DSH 左侧栏里的插件入口折叠进「插件」这一行的分组里：行尾一个小箭头切换展开 / 折叠，设置页里逐项决定哪些入口进分组。

**只折叠展示，不改变任何插件本身。**

## 功能

- **行尾箭头折叠 / 展开** —— 官方「插件」行最右侧多一个小箭头（▾ / ▸），点它就是展开 / 折叠分组；点行内其他位置仍然照常打开插件页。折叠后侧栏只留「插件」「更多」两行。
- **设置页逐项开关** —— `设置 → 左侧插件入口` 里有折叠总开关，以及「收进分组的入口」列表：逐项开关决定哪些入口参与折叠、哪些始终单独显示，另有「全部收进 / 全部移出」。
- **插件详情页复用同一页** —— 在插件管理里点开 `dsh-sidebar-fold`，看到的是同一个配置页。
- **图标轨道不折叠** —— 侧栏收成图标轨道（rail）时不折叠、不接管点击，图标本身就是紧凑形态。
- 默认折叠，装完即生效。

## 它做了什么、不做什么

只做两件事：

1. 生成一小段 `<style>`，隐藏分组内的入口行；
2. 在 document 捕获阶段截住「插件」行右侧 30px 热区的点击，只切换折叠，不触发面板跳转。

不注入、不改写、不代理任何插件；不新增侧栏入口；不弹菜单。卸载后那段 `<style>` 随之消失。颜色 / 字号 / 分割线只取自宿主主题 token（`--dsw-alias-*`），不硬编码色值，也不引用任何 Harness Client 包。

## 安装

本插件是 DSH（Cordis）bundle，两种装法。

### 方式 A：让 Agent 用 `plugin_manager` 安装（推荐）

在 DSH 里对 Agent 说「装 `dsh-sidebar-fold`」，它会调 `plugin_manager`：

- `action: "install_bundle"`，`target` 填安装 spec：
  - 已 clone 到本地：`file:/abs/path/to/dsh-sidebar-fold`
  - 或 GitHub 上的仓库：`github:veritaswiki/dsh-sidebar-fold`
- 装完 `action: "set_bundle"` 启用。

> 本仓库首版**没有发布到 npm registry**，所以在 npm 上搜不到它。

### 方式 B：手动挂到 profile

1. 把仓库放在任意目录（下面记作 `/abs/path/to/dsh-sidebar-fold`）。
2. 编辑 profile 的 `package.json`（`~/.dsh/profiles/<profile>/package.json`）：
   - `dependencies` 里加 `"dsh-sidebar-fold": "link:/abs/path/to/dsh-sidebar-fold"`
   - `dsh.profile.bundles` 数组里加 `"dsh-sidebar-fold"`
3. 在 profile 目录安装依赖（DSH 下次启动时也会自行安装）。

### 依赖说明

`index.js` 需要 `@deepseek-ai/schemastery`（Host 侧 Config 校验）。**DSH 自带这个包，正常安装不需要另装**；`package.json` 的 `dependencies` 只是把这个依赖关系写明。本仓库不带 `node_modules`。

## 版本耦合与 fail-open

- 折叠依赖 DSH 侧栏把面板行渲染成 `[class*="_panelList"] > button[aria-label="…"]`，并依赖外层 `_root` / `_collapsed` / `data-sidebar-collapsed` 标记侧栏形态。这套选择器按 **DSH 0.2.2-rc.1** 实测；`package.json` 的 `engines.dsh` 记为 `>=0.2.2-rc.1`。
- **fail-open**：DSH 升级若改掉上述 DOM 结构，最坏情况是**折叠不再隐藏**（箭头仍在，或连箭头也不显示），**不会报错、不会挡住点击、不会损坏任何配置**。所有读取都用 try/catch 包住，失败即退回默认行为（不折叠）。
- 升级后若发现折叠失效，适配点只有 `client.js` 里的 `SIDEBAR_SCOPE` 常量与 `foldRules()` / `chevronRules()` 两个函数。

## 持久化

折叠状态与「移出分组的入口」列表**双写**：

| 位置 | 角色 |
| --- | --- |
| Host Config（profile 的 Cordis 配置，字段 `folded` / `excluded`） | 权威来源，跨端口、跨浏览器同步 |
| `localStorage`（`dsh.sidebar-fold.folded` / `dsh.sidebar-fold.excluded`） | 首帧防闪烁；Host Config 不可用时的只读兜底 |

读取时优先 Host Config，写入时两边同时写。Host Config 用 `volatile()` 声明，热更新不重启插件。

注意：`localStorage` 跟页面来源（端口）走，换端口等于换来源，那份缓存会回默认折叠——但 Host Config 那份仍然生效。

## 文件

| 文件 | 作用 |
| --- | --- |
| `package.json` | bundle 清单：`dsh.bundle.patch` + `dsh.client`（web，立即加载） |
| `cordis.patch.yml` | 插入 `sidebar-fold` Loader 行（`insert.name` 必须等于包名） |
| `index.js` | Host 侧：声明 volatile `Config`、关掉自动生成的通用表单 |
| `client.js` | 客户端全部逻辑：折叠引擎、行尾箭头、设置页 |
| `locale/zh.json`、`locale/en.json` | 插件管理页标题与描述 |
| `icon.svg` | 插件图标 |

## 已知限制

- 分组按「行标题」（`aria-label`）匹配；两个入口标题完全相同会把它们一起收起（罕见）。
- 「插件」行右侧 30px 是折叠热区，与宿主原本的点击区域重叠，靠 document 捕获阶段处理；若自定义主题改动了行内布局，热区可能偏。
- 设置页里的顺序 = 侧栏插槽的 `order`。

## 开发与检查

```bash
node --check index.js
node --check client.js
node scripts/sanitize-check.mjs
```

`scripts/sanitize-check.mjs` 是脱敏门禁：本机绝对路径、私有包前缀、回环地址一律不许出现，命中即退出码 1。CI 只跑这三步（语法检查 + 脱敏门禁），不发布 npm。

## License

MIT © 2026 veritaswiki
