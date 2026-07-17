---
title: svelte/reactivity/window
---

该模块导出了各种 `window` 值的响应式版本，每个值都带有一个响应式的 `current` 属性，你可以在响应式上下文（模板、[派生值]($derived) 和 [副作用]($effect)）中引用它，而无需使用 [`<svelte:window>`](svelte-window) 绑定，也无需手动创建自己的事件监听器。

```svelte
<script>
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
</script>

<p>{innerWidth.current}x{innerHeight.current}</p>
```

## 导出的响应式值

每一个都是带有 `current` 属性的响应式对象，对应 `window` 上的同名属性：

- `innerWidth` — `window.innerWidth`
- `innerHeight` — `window.innerHeight`
- `outerWidth` — `window.outerWidth`
- `outerHeight` — `window.outerHeight`
- `scrollX` — `window.scrollX`
- `scrollY` — `window.scrollY`
- `devicePixelRatio` — `window.devicePixelRatio`
- `online` — `window.navigator.onLine`

```svelte
<script>
	import { scrollY, online } from 'svelte/reactivity/window';
</script>

{#if online.current}
	<p>已滚动到 {scrollY.current} 像素</p>
{:else}
	<p>当前处于离线状态</p>
{/if}
```
