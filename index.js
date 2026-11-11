import z from '@deepseek-ai/schemastery';

export const name = 'dsh-sidebar-fold-native';

/**
 * 持久化在用户 Profile cordis.patch.yml 中的折叠配置（跨端口、跨浏览器同步，volatile 热更新不重启插件）。
 */
export const Config = z.object({
  folded: z.boolean().default(true).volatile(),
  excluded: z.array(z.string()).default([]).volatile(),
  /** 展开后无操作自动收回的总开关 */
  autoCollapse: z.boolean().default(true).volatile(),
  /** 自动收回的延迟（毫秒）；0 = 不自动收，其余夹在 1000–30000 */
  autoCollapseDelayMs: z.number().step(1).min(0).max(30000).default(5000).volatile(),
  /** 点开分组里任意入口后立即收回 */
  collapseOnEntryClick: z.boolean().default(true).volatile(),
  /** 指针离开侧栏区域时收回（容易误收，默认关） */
  collapseOnPointerLeave: z.boolean().default(false).volatile(),
});

/**
 * 左侧插件折叠（Sidebar plugin fold）
 *
 * 核心行为在 client.js：将官方「插件」行变为可折叠分组标题行，点击行尾箭头即可收起/展开
 * 分组内的插件面板入口；展开后按 autoCollapse / autoCollapseDelayMs 自动收回，
 * 点开入口或指针离开侧栏也能立即收回；「设置 → 左侧插件入口」及插件详情页提供逐项开关。
 *
 * Host 侧声明 volatile Config 并关闭自动生成通用表单（由 client.js 渲染原生排版设置页）。
 */
export function apply(ctx) {
  ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
  });
}

export default { name, Config, apply };
