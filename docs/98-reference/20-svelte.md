---
title: svelte
---

`svelte` 模块导出了在组件之外使用的运行时 API，例如把组件挂载到页面、读写上下文、管理生命周期等。

## mount

```js
function mount(
	component: ComponentType,
	options: {
		target: Element;
		props?: Record<string, any>;
		events?: 'on' | 'bind' | ((events: Record<string, any>) => Record<string, any>);
		context?: Map<any, any>;
		intro?: boolean;
	}
): ReturnType<ComponentType>;
```

实例化一个组件并将其挂载到 `target` 元素上，返回组件实例。

```svelte
<script>
	import { mount } from 'svelte';
	import App from './App.svelte';

	const app = mount(App, {
		target: document.getElementById('app'),
		props: { name: 'world' }
	});
</script>
```

## unmount

```js
function unmount(
	component: ReturnType<ComponentType>,
	options?: { outro?: boolean }
): void;
```

卸载通过 [`mount`](#mount) 创建的组件实例。传入 `outro: true` 会等待离场过渡完成后再移除。

## flushSync

```js
function flushSync(fn?: () => void): void;
```

同步刷新所有待处理的响应式副作用与 DOM 更新。可选地在回调中修改状态，以确保变更在同一批次内生效。

## tick

```js
function tick(): Promise<void>;
```

返回一个在 DOM 更新之后、浏览器绘制之前兑现（resolve）的 Promise。适合在读取更新后的 DOM 之前等待。

## onMount

```js
function onMount(callback: () => void | (() => void)): void;
```

组件挂载到 DOM 后调用。回调可返回一个清理函数，组件销毁时执行。

## onDestroy

```js
function onDestroy(callback: () => void): void;
```

组件被销毁时调用。

## getContext / setContext / hasContext / getAllContexts

```js
function getContext<T>(key: any): T;
function setContext<T>(key: any, value: T): T;
function hasContext(key: any): boolean;
function getAllContexts(): Map<any, any>;
```

在组件初始化期间读写上下文。键通常使用 `Symbol` 或字符串常量避免冲突。

## createRawSnippet

```js
function createRawSnippet(
	getContents: () => string,
	render?: (content: () => string) => { html: string }
): Snippet;
```

创建一个不随依赖自动重新渲染的 snippet，常用于把外部/原生内容注入到组件内部。

> [!LEGACY]
> `beforeUpdate`、`afterUpdate`、`createEventDispatcher` 等仍可用，但属于旧版 API，建议迁移到 runes 写法。
