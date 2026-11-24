---
title: <svelte:options>
---

```svelte
<svelte:options option={value} />
```

`<svelte:options>` 元素提供了一个指定组件级编译器选项的位置，这些选项在[编译器章节](svelte-compiler#compile) 中有详细说明。可用的选项有：

- `runes={true}` — 强制组件进入_符文模式_（参见[遗留 API](legacy-overview) 章节）
- `runes={false}` — 强制组件进入_遗留模式_
- `namespace="..."` — 该组件将被使用的命名空间，可以是 "html"（默认）、"svg" 或 "mathml"
- `customElement={...}` — 将该组件编译为自定义元素时使用的[选项](custom-elements#Component-options)。如果传入一个字符串，它会作为 `tag` 选项使用
- `css="injected"` — 组件会将样式以内联方式注入：在服务端渲染期间，它作为 `<style>` 标签被注入到 `head` 中；在客户端渲染期间，它通过 JavaScript 加载
- `customRenderer="..."` — 提供该组件渲染所用[自定义渲染器](custom-renderers)的模块。使用 `customRenderer={null}` 可以改用 DOM 渲染，而不是默认渲染器。需要启用 `experimental.customRenderer` 编译器选项

> [!LEGACY] 已弃用的选项
> Svelte 4 还包含以下选项。它们在 Svelte 5 中已被弃用，并且在符文模式下不起作用。
>
> - `immutable={true}` — 你从不使用可变数据，因此编译器可以简单地做引用相等性检查来判断值是否发生了变化
> - `immutable={false}` — 默认值。Svelte 对于可变对象是否发生变化会更为保守
> - `accessors={true}` — 为组件的 props 添加 getter 和 setter
> - `accessors={false}` — 默认值

```svelte
<svelte:options customElement="my-custom-element" />
```
