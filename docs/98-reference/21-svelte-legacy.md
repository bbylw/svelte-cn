---
title: svelte/legacy
---

该模块提供在迁移过程中使用的各种函数，因为某些特性无法与新的特性一一对应地替换。所有导入都被标记为已弃用，应当随着时间推移逐步迁移掉。

## 导出

- `SvelteComponent` / `SvelteComponentTyped` — 旧版组件基类
- `createEventDispatcher` — 创建事件分发器
- `onMount` / `onDestroy` / `beforeUpdate` / `afterUpdate` — 生命周期钩子
- `tick` — 等待下一次 DOM 更新
- `getContext` / `setContext` / `hasContext` / `getAllContexts` — 上下文读写
- `createRawSnippet` — 创建不响应依赖的 snippet

> [!WARNING]
> 这些 API 仅用于从 Svelte 4 迁移，新代码应使用 runes（`$state`、`$effect`、`$props` 等）。
