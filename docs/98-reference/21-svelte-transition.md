---
title: svelte/transition
tags: transitions
---

该模块提供了内置的过渡动画函数，配合 `transition:`、`in:`、`out:` 指令使用。

## 可用过渡

- `fade` — 淡入淡出
- `fly` — 位移 + 淡入淡出
- `slide` — 高度展开/收起
- `scale` — 缩放
- `draw` — 用于 SVG `<path>` 的描边绘制
- `crossfade` — 在两个元素间交叉淡入淡出（函数，返回 `[send, receive]` 两个函数）

```svelte
<script>
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
</script>

{#if visible}
	<div transition:fly={{ y: 20, duration: 300, easing: cubicOut }}>
		内容
	</div>
{/if}
```

每个过渡函数都接受一个包含 `delay`、`duration`、`easing` 等的选项对象。
