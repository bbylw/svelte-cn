---
title: svelte/easing
---

该模块导出了用于过渡与补间动画的缓动函数（easing functions）。每个函数接收 `0` 到 `1` 之间的 `t`，返回对应的进度值。

每个缓动都有 `In`、`Out`、`InOut` 三种变体，例如 `cubicIn`、`cubicOut`、`cubicInOut`。

## 可用缓动

- `linear`
- `quadIn` / `quadOut` / `quadInOut`
- `cubicIn` / `cubicOut` / `cubicInOut`
- `quartIn` / `quartOut` / `quartInOut`
- `quintIn` / `quintOut` / `quintInOut`
- `sineIn` / `sineOut` / `sineInOut`
- `expoIn` / `expoOut` / `expoInOut`
- `circIn` / `circOut` / `circInOut`
- `backIn` / `backOut` / `backInOut`
- `elasticIn` / `elasticOut` / `elasticInOut`
- `bounceIn` / `bounceOut` / `bounceInOut`

```svelte
<script>
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
</script>

<div transition:fade={{ duration: 300, easing: cubicOut }}></div>
```
