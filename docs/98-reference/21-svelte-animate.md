---
title: svelte/animate
---

该模块提供了在列表重排时使用的动画函数。

## flip

```js
function flip(
	node: Element,
	{ from, to }: { from: DOMRect; to: DOMRect },
	options?: {
		easing?: (t: number) => number;
		duration?: number | ((from: DOMRect, to: DOMRect) => number);
	}
): AnimationConfig;
```

[FLIP](https://aerotwist.com/blog/flip-your-animations) 动画：当元素在列表中的位置变化时，从旧位置平滑过渡到新位置。需配合 `animate:flip` 指令与带 `key` 的 `{#each}` 使用。

```svelte
{#each list as item (item.id)}
	<li animate:flip>{item.name}</li>
{/each}
```
