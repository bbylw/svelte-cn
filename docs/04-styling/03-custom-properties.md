---
title: 自定义属性
tags: styles-custom-properties
---

你可以向组件传递 CSS 自定义属性——无论是静态的还是动态的：

```svelte
<Slider
	bind:value
	min={0}
	max={100}
	--track-color="black"
	--thumb-color="rgb({r} {g} {b})"
/>
```

上面的代码本质上等价于这样：

```svelte
<svelte-css-wrapper style="display: contents; --track-color: black; --thumb-color: rgb({r} {g} {b})">
	<Slider
		bind:value
		min={0}
		max={100}
	/>
</svelte-css-wrapper>
```

对于 SVG 元素，则会改用 `<g>`：

```svelte
<g style="--track-color: black; --thumb-color: rgb({r} {g} {b})">
	<Slider
		bind:value
		min={0}
		max={100}
	/>
</g>
```

在组件内部，我们可以使用 [`var(...)`](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) 来读取这些自定义属性（并提供回退值）：

```svelte
<style>
	.track {
		background: var(--track-color, #aaa);
	}

	.thumb {
		background: var(--thumb-color, blue);
	}
</style>
```

你并不_必须_直接在组件上指定这些值；只要自定义属性定义在某个父元素上，组件就可以使用它们。通常会在全局样式表的 `:root` 元素上定义自定义属性，以便它们应用到你的整个应用。

> [!NOTE] 虽然这个额外的元素不会影响布局，但它_会_影响任何（例如）使用 `>` 组合子来直接选中组件容器内部元素的 CSS 选择器。
