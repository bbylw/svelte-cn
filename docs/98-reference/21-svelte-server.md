---
title: svelte/server
---

该模块提供了在服务端渲染（SSR）时使用的 API。

## render

```js
function render(
	component: ComponentType,
	options?: {
		props?: Record<string, any>;
		context?: Map<any, any>;
		identity?: (node: Node) => string;
	}
): { body: string; head: string; css: { code: string; map: string }; html: string };
```

将组件渲染为 HTML 字符串，返回 `body`、`head` 与内联 `css` 等内容。

```js
import { render } from 'svelte/server';
import App from './App.svelte';

const { body, head } = render(App, { props: { name: 'world' } });
```

## renderResponse

```js
function renderResponse(component: ComponentType, options?: object): Response;
```

基于 `render` 的结果创建一个 `Response` 对象，常用于服务端入口。
