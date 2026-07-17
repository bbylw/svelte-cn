---
title: svelte/events
---

该模块提供了在元素上注册事件监听器的辅助函数。

## on

```js
function on(
	node: EventTarget,
	type: string,
	handler: (e: Event) => void,
	options?: AddEventListenerOptions
): () => void;
```

注册一个事件监听器，并返回用于移除该监听器的清理函数。在组件或 effects 中使用时，可在清理阶段调用返回值自动解绑。

```js
import { on } from 'svelte/events';

$effect(() => {
	const detach = on(document, 'visibilitychange', () => {
		// 处理可见性变化
	});
	return detach;
});
```
