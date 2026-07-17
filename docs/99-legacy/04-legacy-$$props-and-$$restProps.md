---
title: $$props 与 $$restProps
---

在 runes 模式中，使用 [`$props`]($props) 符文就能轻松获取一个包含所有传入 props 的对象。

在 legacy 模式中，我们使用 `$$props` 和 `$$restProps`：

- `$$props` 包含所有传入的 props，包括那些没有用 `export` 关键字单独声明的
- `$$restProps` 包含所有传入的 props，_除了_ 那些被单独声明的

例如，一个 `<Button>` 组件可能需要将其所有 props 传递给它自己的 `<button>` 元素，但 `variant` prop 除外：

```svelte
<script>
	export let variant;
</script>

<button {...$$restProps} class="variant-{variant} {$$props.class ?? ''}">
	click me
</button>

<style>
	.variant-danger {
		background: red;
	}
</style>
```

在 Svelte 3/4 中使用 `$$props` 和 `$$restProps` 会带来一定的性能损耗，因此应当只在需要时才使用。
