---
title: 最佳实践
skill: true
name: svelte-core-bestpractices
description: Guidance on writing fast, robust, modern Svelte code. Load this skill whenever in a Svelte project and asked to write/edit or analyze a Svelte component or module. Covers reactivity, event handling, styling, integration with libraries and more.
---

<!-- llm-ignore-start -->
This document outlines some best practices that will help you write fast, robust Svelte apps. It is also available as a `svelte-core-bestpractices` skill for your agents.
<!-- llm-ignore-end -->

## `$state`

只对那些应当_具有响应性_的变量使用 `$state` 符文——换句话说，就是那些会导致 `$effect`、`$derived` 或模板表达式更新的变量。其他所有变量都可以是普通变量。

对象和数组（`$state({...})` 或 `$state([...])`）会被深度转换为响应式，这意味着对它们的修改会触发更新。这有一个权衡：作为细粒度响应性的代价，这些对象必须被代理，而这会带来性能开销。如果你处理的是只会被重新赋值（而不是被修改）的大型对象，请改用 `$state.raw`。例如，API 响应通常就是这种情况。

## `$derived`

要从状态中计算某个值，请使用 `$derived` 而不是 `$effect`：

```js
// @errors: 2451
let num = 0;
// ---cut---
// do this
let square = $derived(num * num);

// don't do this
let square;

$effect(() => {
	square = num * num;
});
```

> [!NOTE] `$derived` 接收的是一个_表达式_，而_不是_函数。如果你需要使用函数（例如表达式比较复杂），请使用 `$derived.by`。

派生值是可写的——你可以像 `$state` 一样对它们赋值，唯一的区别是它们会在表达式变化时重新求值。

如果派生表达式是一个对象或数组，它会原样返回——它_不会_被深度转换为响应式。不过，在极少数你需要这样做的情况下，可以在 `$derived.by` 内部使用 `$state`。

## `$effect`

effect 是一种逃生舱口，应当尽量避免使用。特别是，要避免在 effect 内部更新状态。

- 如果你需要将状态同步到一个外部库（例如 D3），通常使用 [`{@attach ...}`](@attach) 会更整洁
- 如果你需要在响应用户交互时运行某些代码，请将代码直接放在事件处理器中，或者酌情使用[函数绑定](bind#Function-bindings)
- 如果你需要记录值以便调试，请使用 [`$inspect`]($inspect)
- 如果你需要观察 Svelte 之外的某些东西，请使用 [`createSubscriber`](svelte-reactivity#createSubscriber)

绝不要将 effect 的内容包裹在 `if (browser) {...}` 或类似语句中——effect 不会在服务端运行。

## `$props`

把 props 当作它们_会_发生变化来对待。例如，依赖于 props 的值通常应当使用 `$derived`：

```js
// @errors: 2451
let { type } = $props();

// do this
let color = $derived(type === 'danger' ? 'red' : 'green');

// don't do this — `color` will not update if `type` changes
let color = type === 'danger' ? 'red' : 'green';
```

## `$inspect.trace`

`$inspect.trace` 是一个用于响应性的调试工具。如果某个东西没有正确地更新，或者运行得比它应该运行的次数更多，你可以将 `$inspect.trace(label)` 作为 `$effect` 或 `$derived.by`（或它们调用的任何函数）的第一行，来追踪它们的依赖关系，并找出是哪个依赖触发了更新。

## 事件

任何以 `on` 开头的元素属性都会被当作事件监听器：

```svelte
<button onclick={() => {...}}>click me</button>

<!-- attribute shorthand also works -->
<button {onclick}>...</button>

<!-- so do spread attributes -->
<button {...props}>...</button>
```

如果你需要向 `window` 或 `document` 附加监听器，可以使用 `<svelte:window>` 和 `<svelte:document>`：

```svelte
<svelte:window onkeydown={...} />
<svelte:document onvisibilitychange={...} />
```

避免使用 `onMount` 或 `$effect` 来做这件事。

## 代码片段

[代码片段](snippet) 是一种定义可复用标记片段的方式，可以通过 [`{@render ...}`](@render) 标签来实例化，或者作为 props 传递给组件。它们必须在模板内部声明。

```svelte
{#snippet greeting(name)}
  <p>hello {name}!</p>
{/snippet}

{@render greeting('world')}
```

> [!NOTE] 在组件顶层声明的代码片段（即不在元素或代码块内部）可以在 `<script>` 中被引用。一个不引用组件状态的代码片段在 `<script module>` 中也可用，这种情况下它可以被导出供其他组件使用。

## Each 块

优先使用[带 key 的 each 块](each#Keyed-each-blocks)——这能让 Svelte 以"手术式"地插入或删除条目，而不是更新属于现有条目的 DOM，从而提升性能。

> [!NOTE] key _必须_唯一地标识该对象。不要使用索引作为 key。

如果你需要修改条目（例如使用 `bind:value={item.count}`），请避免解构。

## 在 CSS 中使用 JavaScript 变量

如果你有一个想要在 CSS 中使用的 JS 变量，可以通过 `style:` 指令设置一个 CSS 自定义属性。

```svelte
<div style:--columns={columns}>...</div>
```

之后你就可以在组件的 `<style>` 中引用 `var(--columns)`。

## 为子组件设置样式

组件 `<style>` 中的 CSS 会被限定在该组件的作用域内。如果父组件需要控制子组件的样式，首选方式是使用 CSS 自定义属性：

```svelte
<!-- Parent.svelte -->
<Child --color="red" />

<!-- Child.svelte -->
<h1>Hello</h1>

<style>
	h1 {
		color: var(--color);
	}
</style>
```

如果这不可行（例如，子组件来自某个库），你可以使用 `:global` 来覆盖样式：

```svelte
<div>
	<Child />
</div>

<style>
	div :global {
		h1 {
			color: red;
		}
	}
</style>
```

## 上下文

考虑使用上下文，而不要在共享模块中声明状态。这会将状态的作用域限定到需要它的那部分应用，并消除在服务端渲染期间它在用户之间泄漏的可能性。

使用 `createContext` 而不是 `setContext` 和 `getContext`，因为它提供了类型安全性。

## 异步 Svelte

如果你使用的是 5.36 或更高版本，可以使用 [await 表达式](await-expressions) 和 [hydratable](hydratable) 在组件内部直接使用 promise。注意，由于它们尚未被认为完全稳定，因此需要先在 `svelte.config.js` 中启用 `experimental.async` 选项。

## 避免使用遗留特性

对于新代码，始终使用符文模式，并避免使用已有更现代替代方案的特性：

- 使用 `$state` 而不是隐式响应性（例如 `let count = 0; count += 1`）
- 使用 `$derived` 和 `$effect` 而不是 `$:` 赋值和语句（但只在没有更好方案时才使用 effect）
- 使用 `$props` 而不是 `export let`、`$$props` 和 `$$restProps`
- 使用 `onclick={...}` 而不是 `on:click={...}`
- 使用 `{#snippet ...}` 和 `{@render ...}` 而不是 `<slot>`、`$$slots` 和 `<svelte:fragment>`
- 使用 `<DynamicComponent>` 而不是 `<svelte:component this={DynamicComponent}>`
- 使用 `import Self from './ThisComponent.svelte'` 和 `<Self>` 而不是 `<svelte:self>`
- 使用带有 `$state` 字段的类来在组件之间共享响应性，而不是使用 stores
- 使用 `{@attach ...}` 而不是 `use:action`
- 在 `class` 属性中使用 clsx 风格的数组和对象，而不是 `class:` 指令
