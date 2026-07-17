---
title: <svelte:component>
---

在 runes 模式中，如果 `MyComponent` 的值发生变化，`<MyComponent>` 会重新渲染。示例请参阅 [Svelte 5 迁移指南](/docs/svelte/v5-migration-guide#svelte:component-is-no-longer-necessary)。

在 legacy 模式中则不会——我们必须使用 `<svelte:component>`，它会在其 `this` 表达式的值发生变化时销毁并重新创建组件实例：

```svelte
<svelte:component this={MyComponent} />
```

如果 `this` 为假值，则不渲染任何组件。
