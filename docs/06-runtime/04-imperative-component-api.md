---
title: 命令式组件 API
---

<!-- better title needed?

- mount
- unmount
- render
- hydrate
- how they interact with each other -->

每个 Svelte 应用都通过命令式地创建一个根组件来启动。在客户端，该组件被挂载到某个特定的元素上。在服务端，你希望取回一段 HTML 字符串，以便进行渲染。以下函数可以帮你完成这些任务。

## `mount` {#mount}

实例化一个组件并将其挂载到给定的目标上：

```js
// @errors: 2322
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
	target: document.querySelector('#app'),
	props: { some: 'property' }
});
```

你可以在每个页面上挂载多个组件，也可以从你的应用内部挂载，例如在创建一个 tooltip 组件并将其附加到被悬停的元素上时。

注意，与在 Svelte 4 中调用 `new App(...)` 不同，像 effects（包括 `onMount` 回调和 action 函数）这样的东西不会在 `mount` 期间运行。如果你需要强制让待处理的 effects 运行（例如在测试的上下文中），可以使用 `flushSync()`。

## `unmount` {#unmount}

卸载一个之前用 [`mount`](#mount) 或 [`hydrate`](#hydrate) 创建的组件。

如果 `options.outro` 为 `true`，[过渡](transition) 会在组件从 DOM 中移除之前播放：

```js
import { mount, unmount } from 'svelte';
import App from './App.svelte';

const app = mount(App, { target: document.body });

// later
unmount(app, { outro: true });
```

如果 `options.outro` 为 true，则返回一个在过渡完成之后 resolve 的 `Promise`；否则立即返回。

## `render` {#render}

仅在服务端以及使用 `server` 选项编译时可用。接收一个组件，并返回一个带有 `body` 和 `head` 属性的对象，你可以用它来填充服务端渲染应用时的 HTML：

```js
// @errors: 2724 2305 2307
import { render } from 'svelte/server';
import App from './App.svelte';

const result = render(App, {
	props: { some: 'property' }
});
result.body; // HTML for somewhere in this <body> tag
result.head; // HTML for somewhere in this <head> tag
```

## `hydrate` {#hydrate}

与 `mount` 类似，但会复用目标内由 Svelte SSR 输出（来自 [`render`](#render) 函数）渲染出的任何 HTML，并使其变得可交互：

```js
// @errors: 2322
import { hydrate } from 'svelte';
import App from './App.svelte';

const app = hydrate(App, {
	target: document.querySelector('#app'),
	props: { some: 'property' }
});
```

与 `mount` 一样，effects 不会在 `hydrate` 期间运行——如果你需要它们运行，请在之后立即使用 `flushSync()`。
