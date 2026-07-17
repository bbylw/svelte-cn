---
title: svelte/attachments
tags: attachments
---

attachments 是 Svelte 5 中用于增强元素的机制，取代了旧版 actions。一个 attachment 接收元素并返回可选的清理函数。

## Attachment 类型

```ts
type Attachment = (element: Element) => (() => void) | void;
```

```svelte
<script>
	import type { Attachment } from 'svelte/attachments';

	const focus: Attachment = (element) => {
		element.focus();
	};
</script>

<input {@attach focus} />
```

## on

```ts
function on(node: Element, type: string, handler: (e: Event) => void, options?: AddEventListenerOptions): () => void;
```

便捷辅助函数，用于在 attachment 中注册事件监听器，并在元素销毁时自动清理。
