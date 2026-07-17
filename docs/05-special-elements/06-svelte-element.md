---
title: <svelte:element>
---

```svelte
<svelte:element this={expression} />
```

`<svelte:element>` 元素让你可以渲染一个在编写时未知的元素，例如它来自某个 CMS。任何存在的属性和事件监听器都会被应用到该元素上。

唯一受支持的绑定是 `bind:this`，因为 Svelte 内置的绑定无法作用于通用元素。

如果 `this` 的值是空值（nullish），该元素及其子元素都不会被渲染。

如果 `this` 是一个[空元素](https://developer.mozilla.org/en-US/docs/Glossary/Void_element)（例如 `br`）的名称，而 `<svelte:element>` 又带有子元素，那么在开发模式下会抛出一个运行时错误：

```svelte
<script>
	let tag = $state('hr');
</script>

<svelte:element this={tag}>
	This text cannot appear inside an hr element
</svelte:element>
```

Svelte 会尽力从元素的周边环境推断出正确的命名空间，但这并不总是可行。你可以通过 `xmlns` 属性显式指定：

```svelte
<svelte:element this={tag} xmlns="http://www.w3.org/2000/svg" />
```

`this` 必须是一个有效的 DOM 元素标签，像 `#text` 或 `svelte:head` 这样的名称是无效的。
