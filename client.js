window.__ModuleLoader__.load({
  id: 'dsh-sidebar-fold-native',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /** 本插件的包标识（同步用于 plugins.bundle.config） */
    const PKG_ID = 'dsh-sidebar-fold-native';
    /** 本插件的 locale 命名空间与 Host Config 命名空间 */
    const NS = 'sidebar-fold';
    /** 折叠开关的本地缓存键（'1' = 折叠，首帧防闪烁与只读兜底） */
    const FOLDED_KEY = 'dsh.sidebar-fold.folded';
    /** 被移出折叠分组的入口 id 列表（默认空：新入口默认收进分组） */
    const EXCLUDED_KEY = 'dsh.sidebar-fold.excluded';
    /** 官方「插件」入口：分组的标题行，永远单独显示 */
    const OFFICIAL_PANEL = 'plugins';
    /** 行尾箭头的点击热区（像素），只有点在「插件」行最右侧这一小段才折叠 */
    const HIT_ZONE = 30;
    /** 行宽小于这个值时说明侧栏在图标轨道，不接管点击 */
    const RAIL_WIDTH = 80;
    /** 折叠行为（自动收回等）的本地缓存键 */
    const BEHAVIOR_KEY = 'dsh.sidebar-fold.behavior';
    /** 自动收回的默认延迟；0 = 不自动收 */
    const AUTO_COLLAPSE_DEFAULT_MS = 5000;
    /** 自动收回延迟的可调范围（0 之外） */
    const AUTO_COLLAPSE_MIN_MS = 1000;
    const AUTO_COLLAPSE_MAX_MS = 30000;
    /** 折叠行为默认值（「恢复默认」也用它） */
    const BEHAVIOR_DEFAULTS = {
      autoCollapse: true,
      autoCollapseDelayMs: AUTO_COLLAPSE_DEFAULT_MS,
      collapseOnEntryClick: true,
      collapseOnPointerLeave: false,
    };

    const zh = {
      'settings.label': '左侧插件入口',
      'settings.lead': '把不常用的插件入口收进「插件」这一行的折叠区：只折叠展示，不改变任何插件本身；展开后按下面的设置自动收回。',
      'settings.fold.title': '折叠插件入口',
      'settings.fold.desc': '折叠后侧栏只留「插件」「更多」两行；点「插件」行最右侧的箭头也能直接折叠或展开。',
      'settings.group.title': '收进分组的入口',
      'settings.group.hint': '关掉某一项后，它始终单独显示在侧栏，不参与折叠。',
      'settings.group.all': '全部收进',
      'settings.group.none': '全部移出',
      'settings.group.empty': '侧栏里还没有其他插件入口。',
      'settings.behavior.title': '折叠行为',
      'settings.behavior.auto': '自动收回',
      'settings.behavior.auto.desc': '展开后一段时间没有操作就自动收回，不用再手动点箭头。',
      'settings.behavior.delay': '收回延迟',
      'settings.behavior.delay.desc': '多久没有操作就收回；填 0 表示不自动收（可调范围 1000–30000 毫秒）。',
      'settings.behavior.delay.unit': '毫秒',
      'settings.behavior.click': '点击入口后立即收回',
      'settings.behavior.click.desc': '点开分组里的任意入口后马上收起，不等延迟。',
      'settings.behavior.leave': '鼠标移出侧栏时收回',
      'settings.behavior.leave.desc': '指针离开侧栏区域就收起；容易误收，默认关闭。',
      'settings.behavior.reset': '恢复默认',
      'settings.behavior.reset.desc': '把折叠行为与「收进分组的入口」一起复位到默认值。',
      'settings.note': '侧栏收成图标轨道时不做折叠，图标本身就是紧凑形态。',
    };

    const en = {
      'settings.label': 'Sidebar plugin entries',
      'settings.lead':
        'Keep rarely used plugin entries inside the fold on the Plugins row — presentation only, no plugin changes; an opened group collapses itself again as configured below.',
      'settings.fold.title': 'Fold plugin entries',
      'settings.fold.desc':
        'Folded leaves Plugins and More in the sidebar; the arrow at the right edge of the Plugins row folds it too.',
      'settings.group.title': 'Entries in the group',
      'settings.group.hint': 'Switch an entry off to keep it in the sidebar on its own, never folded.',
      'settings.group.all': 'Group all',
      'settings.group.none': 'Group none',
      'settings.group.empty': 'No other plugin entry in the sidebar yet.',
      'settings.behavior.title': 'Fold behaviour',
      'settings.behavior.auto': 'Auto-collapse',
      'settings.behavior.auto.desc': 'Folds the group back after a while without interaction, so you rarely fold it by hand.',
      'settings.behavior.delay': 'Collapse delay',
      'settings.behavior.delay.desc': 'Idle time before collapsing; 0 keeps it open (range 1000–30000 ms).',
      'settings.behavior.delay.unit': 'ms',
      'settings.behavior.click': 'Collapse after opening an entry',
      'settings.behavior.click.desc': 'Folds immediately once you click an entry inside the group.',
      'settings.behavior.leave': 'Collapse when the pointer leaves the sidebar',
      'settings.behavior.leave.desc': 'Folds as soon as the pointer leaves the sidebar area; may fold too eagerly, off by default.',
      'settings.behavior.reset': 'Restore defaults',
      'settings.behavior.reset.desc': 'Resets the fold behaviour and the entry list to their defaults.',
      'settings.note': 'Folding is skipped while the sidebar is a collapsed icon rail.',
    };

    // 行尾箭头：16px 的 chevron，用 mask 上色，跟随行本身的文字色。
    const CHEVRON_MASK =
      'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")';

    // 只跟随宿主主题 token：字号、行高、分割线、开关样式都对齐 DSH 自己的设置页。
    const CSS = `
.sf-page{max-width:720px;display:flex;flex-direction:column;gap:20px;color:var(--dsw-alias-label-primary)}
.sf-lead{margin:0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.sf-row{
  display:flex;align-items:center;justify-content:space-between;gap:24px;
  padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);
}
.sf-row:last-child{border-bottom:0}
.sf-row-main{min-width:0}
.sf-row-title{font-size:14px;line-height:20px;color:var(--dsw-alias-label-primary)}
.sf-row-desc{margin-top:4px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.sf-sect{display:flex;flex-direction:column}
.sf-sect-head{display:flex;align-items:center;gap:12px;padding:0 0 2px}
.sf-sect-title{margin:0;flex:1;font-size:12px;font-weight:500;line-height:18px;color:var(--dsw-alias-label-secondary)}
.sf-links{display:flex;align-items:center;gap:12px;flex:none}
.sf-link{
  appearance:none;-webkit-appearance:none;background:transparent;border:0;padding:0;margin:0;
  font:inherit;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);
  cursor:pointer;border-radius:4px;
}
.sf-link:hover{color:var(--dsw-alias-label-primary)}
.sf-link:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color);outline-offset:2px}
.sf-switch{
  box-sizing:border-box;position:relative;flex:0 0 auto;
  width:36px;height:20px;padding:2px;border:0;border-radius:999px;
  background:var(--dsw-alias-border-l3,var(--dsw-alias-border-l2));
  cursor:pointer;-webkit-appearance:none;appearance:none;
  transition:background-color .12s ease;
}
.sf-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}
.sf-switch:focus-visible{
  outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color);
  outline-offset:2px;
}
.sf-thumb{
  display:block;width:16px;height:16px;border-radius:50%;
  background:var(--dsw-alias-label-primary-foreground,transparent);
  transition:transform .12s ease;
}
.sf-switch[aria-checked="true"] .sf-thumb{transform:translateX(16px)}
.sf-inline{display:flex;align-items:center;gap:6px;flex:none}
.sf-input{
  box-sizing:border-box;width:88px;height:28px;padding:0 8px;
  border:1px solid var(--dsw-alias-border-l2);border-radius:6px;
  background:transparent;color:var(--dsw-alias-label-primary);
  font:inherit;font-size:12px;line-height:18px;text-align:right;
}
.sf-input:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color);outline-offset:1px}
.sf-input:disabled{opacity:.55;cursor:not-allowed}
.sf-unit{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.sf-empty{padding:16px 0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.sf-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
`;

    // ---------------------------------------------------------------- 状态 ----
    const listeners = new Set();
    const memory = { folded: true, excluded: [], behavior: { ...BEHAVIOR_DEFAULTS } };
    let hostForm = null;
    /** 自动收回的唯一计时器句柄：任何一次改动都先清后设，绝不留残留。 */
    let autoCollapseTimer = null;

    /** 清掉自动收回计时器（折叠、卸载、切图标轨道、关掉自动收回时都要调用）。 */
    function clearAutoCollapseTimer() {
      if (autoCollapseTimer === null) return;
      try {
        window.clearTimeout(autoCollapseTimer);
      } catch (err) {
        /* ignore */
      }
      autoCollapseTimer = null;
    }

    /** 把任意来源（Host Config / localStorage / 设置页输入）的折叠行为归一化到合法范围。 */
    function normalizeBehavior(raw) {
      const src = raw !== null && typeof raw === 'object' ? raw : {};
      const delayRaw = Number(src.autoCollapseDelayMs);
      let delay = BEHAVIOR_DEFAULTS.autoCollapseDelayMs;
      if (Number.isFinite(delayRaw)) {
        if (delayRaw <= 0) delay = 0;
        else delay = Math.min(AUTO_COLLAPSE_MAX_MS, Math.max(AUTO_COLLAPSE_MIN_MS, Math.round(delayRaw)));
      }
      return {
        autoCollapse: typeof src.autoCollapse === 'boolean' ? src.autoCollapse : BEHAVIOR_DEFAULTS.autoCollapse,
        autoCollapseDelayMs: delay,
        collapseOnEntryClick:
          typeof src.collapseOnEntryClick === 'boolean' ? src.collapseOnEntryClick : BEHAVIOR_DEFAULTS.collapseOnEntryClick,
        collapseOnPointerLeave:
          typeof src.collapseOnPointerLeave === 'boolean'
            ? src.collapseOnPointerLeave
            : BEHAVIOR_DEFAULTS.collapseOnPointerLeave,
      };
    }

    function readBehavior() {
      if (hostForm !== null) {
        try {
          const snap = hostForm.getSnapshot();
          if (snap && snap.status === 'ready' && snap.value && typeof snap.value === 'object') {
            const value = snap.value;
            if (
              typeof value.autoCollapse === 'boolean' ||
              typeof value.autoCollapseDelayMs === 'number' ||
              typeof value.collapseOnEntryClick === 'boolean' ||
              typeof value.collapseOnPointerLeave === 'boolean'
            ) {
              return normalizeBehavior(value);
            }
          }
        } catch (err) {
          /* ignore */
        }
      }
      try {
        const raw = window.localStorage.getItem(BEHAVIOR_KEY);
        if (raw !== null) return normalizeBehavior(JSON.parse(raw));
      } catch (err) {
        /* 同上 */
      }
      return { ...memory.behavior };
    }

    function setBehavior(patch) {
      const next = normalizeBehavior({ ...readBehavior(), ...(patch !== null && typeof patch === 'object' ? patch : {}) });
      memory.behavior = next;
      persist(BEHAVIOR_KEY, JSON.stringify(next));
      if (hostForm !== null) {
        for (const key of Object.keys(BEHAVIOR_DEFAULTS)) {
          try {
            hostForm.set(key, next[key]);
          } catch (err) {
            /* ignore */
          }
        }
      }
      // 关掉自动收回或把延迟调成 0 时，立刻清掉在跑的计时器
      if (!next.autoCollapse || next.autoCollapseDelayMs <= 0) clearAutoCollapseTimer();
      emit();
    }

    /** 「恢复默认」：折叠行为 + 参与列表 + 折叠状态一起回到出厂值。 */
    function resetToDefaults() {
      clearAutoCollapseTimer();
      setBehavior({ ...BEHAVIOR_DEFAULTS });
      setExcluded([]);
      setFolded(true);
    }

    function readFolded() {
      if (hostForm !== null) {
        try {
          const snap = hostForm.getSnapshot();
          if (snap && snap.status === 'ready' && snap.value && typeof snap.value.folded === 'boolean') {
            return snap.value.folded;
          }
        } catch (err) {
          /* ignore */
        }
      }
      try {
        const raw = window.localStorage.getItem(FOLDED_KEY);
        if (raw === '1') return true;
        if (raw === '0') return false;
      } catch (err) {
        /* localStorage 不可用时用内存值 */
      }
      return memory.folded;
    }

    function readExcluded() {
      if (hostForm !== null) {
        try {
          const snap = hostForm.getSnapshot();
          if (snap && snap.status === 'ready' && snap.value && Array.isArray(snap.value.excluded)) {
            return snap.value.excluded.filter((id) => typeof id === 'string');
          }
        } catch (err) {
          /* ignore */
        }
      }
      try {
        const raw = window.localStorage.getItem(EXCLUDED_KEY);
        if (raw !== null) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.filter((id) => typeof id === 'string');
        }
      } catch (err) {
        /* 同上 */
      }
      return memory.excluded;
    }

    function emit() {
      for (const listener of listeners) {
        try {
          listener();
        } catch (err) {
          /* 单个订阅者异常不影响其他订阅者 */
        }
      }
    }

    function persist(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (err) {
        /* 忽略：内存值仍然生效 */
      }
    }

    function bindHostForm(ctx) {
      try {
        const forms = ctx.configForms || (typeof ctx.get === 'function' ? ctx.get('configForms') : null);
        if (!forms || typeof forms.get !== 'function') return () => {};
        const form = forms.get(NS);
        hostForm = form;
        const syncFromHost = () => {
          try {
            const snap = form.getSnapshot();
            if (snap && snap.status === 'ready' && snap.value) {
              if (typeof snap.value.folded === 'boolean') {
                memory.folded = snap.value.folded;
                persist(FOLDED_KEY, snap.value.folded ? '1' : '0');
              }
              if (Array.isArray(snap.value.excluded)) {
                const clean = snap.value.excluded.filter((id) => typeof id === 'string');
                memory.excluded = clean;
                persist(EXCLUDED_KEY, JSON.stringify(clean));
              }
              emit();
            }
          } catch (err) {
            /* ignore */
          }
        };
        const off = form.subscribe(syncFromHost);
        syncFromHost();
        return () => {
          if (hostForm === form) hostForm = null;
          if (typeof off === 'function') off();
        };
      } catch (err) {
        return () => {};
      }
    }

    function setFolded(next) {
      const val = Boolean(next);
      memory.folded = val;
      persist(FOLDED_KEY, val ? '1' : '0');
      if (hostForm !== null) {
        try {
          hostForm.set('folded', val);
        } catch (err) {
          /* ignore */
        }
      }
      emit();
    }

    function setExcluded(next) {
      const clean = Array.isArray(next) ? next.filter((id) => typeof id === 'string') : [];
      memory.excluded = clean;
      persist(EXCLUDED_KEY, JSON.stringify(clean));
      if (hostForm !== null) {
        try {
          hostForm.set('excluded', clean);
        } catch (err) {
          /* ignore */
        }
      }
      emit();
    }

    function useFoldState() {
      const [snapshot, setSnapshot] = React.useState(() => ({
        folded: readFolded(),
        excluded: readExcluded(),
        behavior: readBehavior(),
      }));

      React.useEffect(() => {
        const refresh = () => setSnapshot({ folded: readFolded(), excluded: readExcluded(), behavior: readBehavior() });
        listeners.add(refresh);
        const onStorage = (event) => {
          if (event.key === FOLDED_KEY || event.key === EXCLUDED_KEY || event.key === BEHAVIOR_KEY) refresh();
        };
        window.addEventListener('storage', onStorage);
        return () => {
          listeners.delete(refresh);
          window.removeEventListener('storage', onStorage);
        };
      }, []);

      return snapshot;
    }

    // ------------------------------------------------------- 面板入口清单 ----
    function resolveLabel(ctx, raw, fallbackId) {
      let val = typeof raw === 'function' ? raw() : raw;
      if (val !== null && typeof val === 'object') {
        if (ctx.locale && typeof ctx.locale.resolveText === 'function') {
          try {
            val = ctx.locale.resolveText(val);
          } catch (err) {
            val = val.zh || val.en || fallbackId;
          }
        } else {
          val = val.zh || val.en || fallbackId;
        }
      }
      if (val === undefined || val === null || val === '') return String(fallbackId);
      return String(val);
    }

    /** 侧栏的面板清单来自 sidebar.panellist 插槽；按 order 排序并随注册/语言变化重建。 */
    function usePanelEntries(ctx) {
      const read = React.useCallback(() => {
        let rows = [];
        try {
          rows = ctx.slots
            .entriesOfSlot('sidebar.panellist')
            .map(({ options }) => {
              const id = String(options.id);
              const order = typeof options.order === 'number' ? options.order : 0;
              return {
                id,
                order,
                label: resolveLabel(ctx, options.label, id),
              };
            })
            .sort((a, b) => a.order - b.order);
        } catch (err) {
          rows = [];
        }
        return rows;
      }, [ctx]);

      const [rows, setRows] = React.useState(read);

      React.useEffect(() => {
        const refresh = () => setRows(read());
        let offSlots = () => {};
        let offLocale = () => {};
        try {
          offSlots = ctx.slots.subscribe('sidebar.panellist', refresh);
        } catch (err) {
          /* 插槽订阅失败时保留首帧清单 */
        }
        try {
          if (ctx.locale) offLocale = ctx.locale.subscribe(refresh);
        } catch (err) {
          /* 同上 */
        }
        refresh();
        return () => {
          try {
            offSlots();
          } catch (err) {
            /* ignore */
          }
          try {
            offLocale();
          } catch (err) {
            /* ignore */
          }
        };
      }, [ctx, read]);

      return rows;
    }

    /** 可以收进分组的入口：排除官方「插件」入口。 */
    function groupCandidates(rows) {
      return rows.filter((row) => row.id !== OFFICIAL_PANEL);
    }

    function groupedEntries(rows, excluded) {
      return groupCandidates(rows).filter((row) => !excluded.includes(row.id));
    }

    // ------------------------------------------------------------ 折叠 CSS ----
    function escapeAttr(value) {
      return String(value)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/[\n\r\f]/g, ' ');
    }

    const SIDEBAR_SCOPE = ':not([data-sidebar-collapsed="true"]) [class*="_root"]:not([class*="_collapsed"])';

    /** 折叠规则：只隐藏分组里的入口行；「插件」行与「更多」不受影响；图标轨道不隐藏。 */
    function foldRules(entries) {
      if (entries.length === 0) return '';
      const selectors = entries.map(
        (entry) => `${SIDEBAR_SCOPE} [class*="_panelList"] > button[aria-label="${escapeAttr(entry.label)}"]`
      );
      return selectors.join(',') + '{display:none !important}';
    }

    /** 行尾箭头：挂在官方「插件」行的右端，方向跟随折叠状态；无可折叠项时不显示。 */
    function chevronRules(label, folded, hasCandidates) {
      if (label === null || !hasCandidates) return '';
      const selector = `${SIDEBAR_SCOPE} [class*="_panelList"] > button[aria-label="${escapeAttr(label)}"]`;
      return (
        `${selector}::after{content:"";flex:none;width:16px;height:16px;margin-left:auto;` +
        `background:currentColor;opacity:.45;` +
        `-webkit-mask:${CHEVRON_MASK} no-repeat center/16px 16px;mask:${CHEVRON_MASK} no-repeat center/16px 16px;` +
        `transition:transform .12s ease;` +
        (folded ? 'transform:rotate(-90deg);' : '') +
        `}` +
        `${selector}:hover::after{opacity:.8}`
      );
    }

    function StyleTag(props) {
      return h('style', { 'data-sidebar-fold': '' }, CSS + (props.rules === undefined ? '' : props.rules));
    }

    // ------------------------------------------------------ 侧栏折叠引擎 ----
    /**
     * 常驻在 shell.overlay 里的无渲染组件：负责折叠 CSS、以及「插件」行右侧箭头的点击。
     * 「插件」行本身是宿主的面板按钮，点击右侧热区时在 document 捕获阶段截住，
     * 只切换折叠，不触发面板跳转；点行内其他位置仍然是正常的打开插件页。
     */
    function SidebarFoldEngine(props) {
      const ctx = props.ctx;
      const state = useFoldState();
      const rows = usePanelEntries(ctx);
      const candidates = groupCandidates(rows);
      const entries = groupedEntries(rows, state.excluded);
      const official = rows.find((row) => row.id === OFFICIAL_PANEL);
      const officialLabel = official === undefined ? null : official.label;
      const hasCandidates = candidates.length > 0;
      const rules =
        (state.folded ? foldRules(entries) : '') +
        chevronRules(officialLabel, state.folded, hasCandidates);

      React.useEffect(() => {
        if (officialLabel === null || !hasCandidates) return undefined;
        const selector = `${SIDEBAR_SCOPE} [class*="_panelList"] > button[aria-label="${escapeAttr(officialLabel)}"]`;
        const syncAria = () => {
          try {
            const btn = document.querySelector(selector);
            if (btn) {
              btn.setAttribute('data-sf-header', 'true');
              btn.setAttribute('data-sf-folded', state.folded ? 'true' : 'false');
            }
          } catch (err) {
            /* ignore */
          }
        };
        syncAria();
        const onCapture = (event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          const target = event.target;
          if (target === null || typeof target !== 'object' || typeof target.closest !== 'function') return;
          const row = target.closest(selector);
          if (row === null) return;
          const rect = row.getBoundingClientRect();
          if (rect.width < RAIL_WIDTH) return;
          if (typeof event.clientX !== 'number' || event.clientX <= 0) return;
          if (event.clientX < rect.right - HIT_ZONE) return;
          event.preventDefault();
          event.stopPropagation();
          setFolded(!readFolded());
        };
        document.addEventListener('click', onCapture, true);
        return () => {
          document.removeEventListener('click', onCapture, true);
          try {
            const btn = document.querySelector(selector);
            if (btn) {
              btn.removeAttribute('data-sf-header');
              btn.removeAttribute('data-sf-folded');
            }
          } catch (err) {
            /* ignore */
          }
        };
      }, [officialLabel, hasCandidates, state.folded]);

      // ---- 自动收回 ----
      // 只在「已展开」时排计时器；指针移动 / 键盘操作重置，点分组入口或指针离开侧栏立即收回。
      // 收起、关掉开关、延迟为 0、切到图标轨道、组件卸载时一律先清计时器，不留残留。
      React.useEffect(() => {
        const behavior = state.behavior;
        const delay = behavior.autoCollapseDelayMs;
        if (state.folded || !behavior.autoCollapse || !(delay > 0) || officialLabel === null) {
          clearAutoCollapseTimer();
          return undefined;
        }

        const headerSelector = `${SIDEBAR_SCOPE} [class*="_panelList"] > button[aria-label="${escapeAttr(officialLabel)}"]`;
        const entrySelector = entries
          .map((entry) => `${SIDEBAR_SCOPE} [class*="_panelList"] > button[aria-label="${escapeAttr(entry.label)}"]`)
          .join(',');

        /** 侧栏容器矩形：用来判断还在不在侧栏里，以及是不是图标轨道。 */
        const sidebarRect = () => {
          try {
            const btn = document.querySelector(headerSelector);
            const root = btn === null || btn === undefined ? null : btn.closest('[class*="_root"]');
            if (root === null) return null;
            return root.getBoundingClientRect();
          } catch (err) {
            return null;
          }
        };

        /**
         * 先清后设：任何一次操作都把自动收回重新计时。
         * 这里刻意不做 DOM 查询——pointermove 会高频调用它；图标轨道由下面的
         * ResizeObserver 负责清计时器，到点回调里再兜底判一次。
         */
        const arm = () => {
          clearAutoCollapseTimer();
          autoCollapseTimer = window.setTimeout(() => {
            autoCollapseTimer = null;
            const now = sidebarRect();
            // 到点时已在图标轨道就不收（轨道本身没有折叠形态）
            if (now !== null && now.width > 0 && now.width < RAIL_WIDTH) return;
            setFolded(true);
          }, delay);
        };

        const leaveSidebar = (event) => {
          if (!behavior.collapseOnPointerLeave) return false;
          const rect = sidebarRect();
          if (rect === null || rect.width <= 0) return false;
          const outside =
            event.clientX < rect.left - 8 ||
            event.clientX > rect.right + 8 ||
            event.clientY < rect.top - 8 ||
            event.clientY > rect.bottom + 8;
          if (!outside) return false;
          clearAutoCollapseTimer();
          setFolded(true);
          return true;
        };

        const onPointerMove = (event) => {
          if (leaveSidebar(event)) return;
          arm();
        };

        const onKeyDown = () => {
          arm();
        };

        // 点了分组里的入口 = 用户已经跳走，立刻收回，不等超时
        const onEntryClick = (event) => {
          if (!behavior.collapseOnEntryClick || entrySelector === '') return;
          const target = event.target;
          if (target === null || typeof target !== 'object' || typeof target.closest !== 'function') return;
          let hit = null;
          try {
            hit = target.closest(entrySelector);
          } catch (err) {
            hit = null;
          }
          if (hit === null) return;
          clearAutoCollapseTimer();
          setFolded(true);
        };

        // 侧栏切到图标轨道（或从轨道展开回来）时立刻清掉计时器：轨道里不该有自动收回在跑
        let railObserver = null;
        try {
          const header = document.querySelector(headerSelector);
          const root = header === null || header === undefined ? null : header.closest('[class*="_root"]');
          if (root !== null && typeof ResizeObserver === 'function') {
            railObserver = new ResizeObserver(() => {
              const rect = sidebarRect();
              if (rect !== null && rect.width > 0 && rect.width < RAIL_WIDTH) clearAutoCollapseTimer();
            });
            railObserver.observe(root);
          }
        } catch (err) {
          railObserver = null;
        }

        arm();
        document.addEventListener('pointermove', onPointerMove, true);
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('click', onEntryClick, true);

        return () => {
          clearAutoCollapseTimer();
          document.removeEventListener('pointermove', onPointerMove, true);
          document.removeEventListener('keydown', onKeyDown, true);
          document.removeEventListener('click', onEntryClick, true);
          if (railObserver !== null) {
            try {
              railObserver.disconnect();
            } catch (err) {
              /* ignore */
            }
          }
        };
      }, [
        state.folded,
        state.behavior.autoCollapse,
        state.behavior.autoCollapseDelayMs,
        state.behavior.collapseOnEntryClick,
        state.behavior.collapseOnPointerLeave,
        officialLabel,
        entries.map((entry) => entry.label).join('|'),
      ]);

      return h(StyleTag, { rules });
    }

    // ------------------------------------------------------------- 图标与开关 ----
    function SectionIcon(props) {
      const size = props && typeof props.size === 'number' ? props.size : 16;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': 'true',
          style: { display: 'block', flex: 'none' },
        },
        h('rect', {
          x: 2,
          y: 2.5,
          width: 12,
          height: 11,
          rx: 2.2,
          stroke: 'currentColor',
          strokeWidth: 1.3,
        }),
        h('path', {
          d: 'M4.5 6h4M4.5 8.5h4M4.5 11h7',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M10 6.2l1.4 1.4 1.4-1.4',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        })
      );
    }

    function Switch(props) {
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          className: 'sf-switch',
          'aria-checked': props.checked ? 'true' : 'false',
          'aria-label': props.label,
          onClick: props.onChange,
        },
        h('span', { className: 'sf-thumb' })
      );
    }

    /**
     * 毫秒数输入：本地编辑、失焦或回车才提交，避免每敲一个字符就写一次 Host Config。
     * 提交前统一走 normalizeBehavior()，非数字/空值直接还原，0 视作「不自动收」。
     */
    function DelayField(props) {
      const [draft, setDraft] = React.useState(String(props.value));

      React.useEffect(() => {
        setDraft(String(props.value));
      }, [props.value]);

      const commit = () => {
        if (draft.trim() === '') {
          setDraft(String(props.value));
          return;
        }
        const parsed = Number(draft);
        if (!Number.isFinite(parsed)) {
          setDraft(String(props.value));
          return;
        }
        const next = normalizeBehavior({ ...readBehavior(), autoCollapseDelayMs: parsed });
        props.onCommit(next.autoCollapseDelayMs);
        setDraft(String(next.autoCollapseDelayMs));
      };

      return h(
        'div',
        { className: 'sf-inline' },
        h('input', {
          type: 'number',
          className: 'sf-input',
          min: 0,
          max: AUTO_COLLAPSE_MAX_MS,
          step: 500,
          value: draft,
          disabled: props.disabled === true,
          'aria-label': props.label,
          onChange: (event) => setDraft(event.target.value),
          onBlur: commit,
          onKeyDown: (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            commit();
          },
        }),
        h('span', { className: 'sf-unit' }, props.unit)
      );
    }

    // ------------------------------------------------------------ 设置页 ----
    function SettingsPage(props) {
      const ctx = props.ctx;
      const t = props.t;
      const state = useFoldState();
      const behavior = state.behavior;
      const rows = usePanelEntries(ctx);
      const candidates = groupCandidates(rows);

      const toggleEntry = (id) => {
        if (state.excluded.includes(id)) {
          setExcluded(state.excluded.filter((entry) => entry !== id));
          return;
        }
        setExcluded(state.excluded.concat([id]));
      };

      return h(
        'div',
        { className: 'sf-page' },
        h('p', { className: 'sf-lead' }, t('settings.lead')),
        h(
          'div',
          { className: 'sf-sect' },
          h(
            'div',
            { className: 'sf-row' },
            h(
              'div',
              { className: 'sf-row-main' },
              h('div', { className: 'sf-row-title' }, t('settings.fold.title')),
              h('div', { className: 'sf-row-desc' }, t('settings.fold.desc'))
            ),
            h(Switch, {
              checked: state.folded,
              label: t('settings.fold.title'),
              onChange: () => setFolded(!state.folded),
            })
          )
        ),
        h(
          'div',
          { className: 'sf-sect' },
          h(
            'div',
            { className: 'sf-sect-head' },
            h('h2', { className: 'sf-sect-title' }, t('settings.behavior.title'))
          ),
          h(
            'div',
            { className: 'sf-row' },
            h(
              'div',
              { className: 'sf-row-main' },
              h('div', { className: 'sf-row-title' }, t('settings.behavior.auto')),
              h('div', { className: 'sf-row-desc' }, t('settings.behavior.auto.desc'))
            ),
            h(Switch, {
              checked: behavior.autoCollapse,
              label: t('settings.behavior.auto'),
              onChange: () => setBehavior({ autoCollapse: !behavior.autoCollapse }),
            })
          ),
          h(
            'div',
            { className: 'sf-row' },
            h(
              'div',
              { className: 'sf-row-main' },
              h('div', { className: 'sf-row-title' }, t('settings.behavior.delay')),
              h('div', { className: 'sf-row-desc' }, t('settings.behavior.delay.desc'))
            ),
            h(DelayField, {
              value: behavior.autoCollapseDelayMs,
              unit: t('settings.behavior.delay.unit'),
              label: t('settings.behavior.delay'),
              disabled: !behavior.autoCollapse,
              onCommit: (value) => setBehavior({ autoCollapseDelayMs: value }),
            })
          ),
          h(
            'div',
            { className: 'sf-row' },
            h(
              'div',
              { className: 'sf-row-main' },
              h('div', { className: 'sf-row-title' }, t('settings.behavior.click')),
              h('div', { className: 'sf-row-desc' }, t('settings.behavior.click.desc'))
            ),
            h(Switch, {
              checked: behavior.collapseOnEntryClick,
              label: t('settings.behavior.click'),
              onChange: () => setBehavior({ collapseOnEntryClick: !behavior.collapseOnEntryClick }),
            })
          ),
          h(
            'div',
            { className: 'sf-row' },
            h(
              'div',
              { className: 'sf-row-main' },
              h('div', { className: 'sf-row-title' }, t('settings.behavior.leave')),
              h('div', { className: 'sf-row-desc' }, t('settings.behavior.leave.desc'))
            ),
            h(Switch, {
              checked: behavior.collapseOnPointerLeave,
              label: t('settings.behavior.leave'),
              onChange: () => setBehavior({ collapseOnPointerLeave: !behavior.collapseOnPointerLeave }),
            })
          ),
          h(
            'div',
            { className: 'sf-row' },
            h(
              'div',
              { className: 'sf-row-main' },
              h('div', { className: 'sf-row-title' }, t('settings.behavior.reset')),
              h('div', { className: 'sf-row-desc' }, t('settings.behavior.reset.desc'))
            ),
            h(
              'button',
              { type: 'button', className: 'sf-link', onClick: resetToDefaults },
              t('settings.behavior.reset')
            )
          )
        ),
        h(
          'div',
          { className: 'sf-sect' },
          h(
            'div',
            { className: 'sf-sect-head' },
            h('h2', { className: 'sf-sect-title' }, t('settings.group.title')),
            candidates.length > 0
              ? h(
                  'div',
                  { className: 'sf-links' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-link',
                      onClick: () => setExcluded([]),
                    },
                    t('settings.group.all')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'sf-link',
                      onClick: () => setExcluded(candidates.map((row) => row.id)),
                    },
                    t('settings.group.none')
                  )
                )
              : null
          ),
          h('p', { className: 'sf-note' }, t('settings.group.hint')),
          candidates.length === 0
            ? h('div', { className: 'sf-empty' }, t('settings.group.empty'))
            : candidates.map((row) =>
                h(
                  'div',
                  { className: 'sf-row', key: row.id },
                  h(
                    'div',
                    { className: 'sf-row-main' },
                    h('div', { className: 'sf-row-title' }, row.label)
                  ),
                  h(Switch, {
                    checked: !state.excluded.includes(row.id),
                    label: row.label,
                    onChange: () => toggleEntry(row.id),
                  })
                )
              )
        ),
        h('p', { className: 'sf-note' }, t('settings.note'))
      );
    }

    // ------------------------------------------------------------ 注册 ----
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'sidebar-fold: dictionaries');
        ctx.effect(() => bindHostForm(ctx), 'sidebar-fold: host config form');
        // 插件被卸载时兜底清掉自动收回计时器（组件 effect 的 cleanup 之外再保一层）
        ctx.effect(() => () => clearAutoCollapseTimer(), 'sidebar-fold: auto-collapse timer');

        const t = ctx.locale.bind(NS);

        // 无渲染的折叠引擎：常驻 overlay，负责 CSS 与「插件」行右侧箭头的点击。
        ctx.slots.inject('shell.overlay', () =>
          ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'sidebar-fold-engine',
              order: 900,
              label: () => t('settings.label'),
            },
            (props) => h(SidebarFoldEngine, { ...props, ctx, t })
          )
        );

        // 设置弹窗左栏专属图标（避免退化为与「通用设置」相同的默认齿轮）。
        ctx.slots.inject('settings.section.icon', () =>
          ctx.slots.register(
            {
              name: 'settings.section.icon',
              id: NS,
            },
            (props) => h(SectionIcon, props)
          )
        );

        // 选择哪些入口收进分组：放在设置页里（和 DSH 其它设置同一处）。
        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: NS,
              order: 40,
              label: () => t('settings.label'),
            },
            (props) => h(SettingsPage, { ...props, ctx, t })
          )
        );

        // 同时注册到插件管理详情页（点击已安装插件「左侧插件折叠」时直接展示同一配置页）。
        ctx.slots.inject('plugins.bundle.config', () =>
          ctx.slots.register(
            {
              name: 'plugins.bundle.config',
              key: PKG_ID,
            },
            (props) => h(SettingsPage, { ...props, ctx, t })
          )
        );
      },
    };
  },
});
