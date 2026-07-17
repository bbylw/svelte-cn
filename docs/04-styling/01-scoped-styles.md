---
title: 作用域样式
tags: styles-scoped
---

Svelte 组件可以包含一个 `<style>` 元素，其中放置属于该组件的 CSS。默认情况下，这些 CSS 是_作用域化_的，意味着样式不会应用到该组件之外的页面上的任何元素。

其原理是向受影响的元素添加一个类，该类基于组件样式的哈希值（例如 `svelte-123xyz`）。

```svelte
<style>
	p {
		/* this will only affect <p> elements in this component */
		color: burlywood;
	}
</style>
```

## 优先级（Specificity）

由于添加了作用域类（例如 `.svelte-123xyz`），每个作用域选择器都会获得 0-1-0 的[优先级](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)提升。这意味着（例如）组件内定义的 `p` 选择器会优先于全局样式表中定义的 `p` 选择器，即使全局样式表加载得更晚。

在某些情况下，作用域类必须多次添加到同一个选择器上，但第一次出现之后，它会以 `:where(.svelte-xyz123)` 的形式添加，以避免进一步提升优先级。

## 作用域化的关键帧

如果组件定义了 `@keyframes`，其名称会以相同的哈希方式被限定在组件作用域内。组件中的任何 `animation` 规则也会做相应调整：

```svelte
<style>
	.bouncy {
		animation: bounce 10s;
	}

	/* these keyframes are only accessible inside this component */
	@keyframes bounce {
		/* ... */
	}
</style>
```
