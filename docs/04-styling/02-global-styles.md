---
title: 全局样式
tags: styles-global
---

## :global(...)

要将样式全局应用到单个选择器，请使用 `:global(...)` 修饰符：

```svelte
<style>
	:global(body) {
		/* applies to <body> */
		margin: 0;
	}

	div :global(strong) {
		/* applies to all <strong> elements, in any component,
		   that are inside <div> elements belonging
		   to this component */
		color: goldenrod;
	}

	p:global(.big.red) {
		/* applies to all <p> elements belonging to this component
		   with `class="big red"`, even if it is applied
		   programmatically (for example by a library) */
	}
</style>
```

如果你想要全局可访问的 `@keyframes`，需要在关键帧名称前加上 `-global-` 前缀。

编译时 `-global-` 部分会被移除，之后在你的代码其他地方只需使用 `my-animation-name` 来引用该关键帧。

```svelte
<style>
	@keyframes -global-my-animation-name {
		/* code goes here */
	}
</style>
```

## :global

要将样式全局应用到一组选择器，可以创建一个 `:global {...}` 块：

```svelte
<style>
	:global {
		/* applies to every <div> in your application */
		div { ... }

		/* applies to every <p> in your application */
		p { ... }
	}

	.a :global {
		/* applies to every `.b .c .d` element, in any component,
		   that is inside an `.a` element in this component */
		.b .c .d {...}
	}
</style>
```

> [!NOTE] 上面的第二个示例也可以写成等价的 `.a :global .b .c .d` 选择器，其中 `:global` 之后的所有内容都不受作用域限制，不过更推荐使用嵌套形式。
