---
title: 命令式组件 API
---

在 Svelte 3 和 4 中，与组件交互的 API 与 Svelte 5 不同。注意，本页 _不_ 适用于 Svelte 5 应用中处于 legacy 模式的组件。

## 创建组件

```ts
// @noErrors
const component = new Component(options);
```

客户端组件——即使用 `generate: 'dom'`（或留空 `generate` 选项）编译的组件——是一个 JavaScript 类。

```ts
// @noErrors
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		// 假设 App.svelte 中包含类似
		// `export let answer` 的内容：
		answer: 42
	}
});
```

可以提供以下初始化选项：

| 选项      | 默认值      | 描述                                                                       |
| --------- | ----------- | -------------------------------------------------------------------------- |
| `target`  | **无**      | 要渲染到的 `HTMLElement` 或 `ShadowRoot`。此选项为必填                       |
| `anchor`  | `null`      | `target` 的一个子节点，组件会紧接在其前面渲染                              |
| `props`   | `{}`        | 提供给组件的一个属性对象                                                   |
| `context` | `new Map()` | 提供给组件的一个根级 context 键值对 `Map`                                  |
| `hydrate` | `false`     | 见下文                                                                     |
| `intro`   | `false`     | 如果为 `true`，会在初次渲染时播放过渡，而不是等到后续状态变化               |

`target` 已有的子节点会保持原样。

`hydrate` 选项指示 Svelte 升级已有的 DOM（通常来自服务端渲染），而不是创建新元素。它只有在组件是以 [`hydratable: true` 选项](/docs/svelte-compiler#compile) 编译时才有效。对 `<head>` 元素的注水只有在服务端渲染代码同样以 `hydratable: true` 编译时才正常工作，这会给 `<head>` 中的每个元素添加一个标记，以便组件知道在注水时它负责移除哪些元素。

虽然 `target` 的子节点通常会保持原样，但 `hydrate: true` 会导致任何子节点被移除。因此，`anchor` 选项不能与 `hydrate: true` 同时使用。

已有的 DOM 无需与组件匹配——Svelte 会在过程中"修复"这些 DOM。

```ts
/// file: index.js
// @noErrors
import App from './App.svelte';

const app = new App({
	target: document.querySelector('#server-rendered-html'),
	hydrate: true
});
```

> [!NOTE]
> 在 Svelte 5+ 中，请改用 [`mount`](svelte#mount)

## `$set`

```ts
// @noErrors
component.$set(props);
```

以编程方式为某个实例设置 props。`component.$set({ x: 1 })` 等价于组件 `<script>` 块内部的 `x = 1`。

调用此方法会为下一个微任务安排一次更新——DOM _不会_ 同步更新。

```ts
// @noErrors
component.$set({ answer: 42 });
```

> [!NOTE]
> 在 Svelte 5+ 中，请改用 `$state` 来创建一个组件 props 并更新它
>
> ```js
> // @noErrors
> let props = $state({ answer: 42 });
> const component = mount(Component, { props });
> // ...
> props.answer = 24;
> ```

## `$on`

```ts
// @noErrors
component.$on(ev, callback);
```

每当组件派发一个 `event` 时，都会调用 `callback` 函数。

会返回一个函数，调用它可以移除该事件监听器。

```ts
// @noErrors
const off = component.$on('selected', (event) => {
	console.log(event.detail.selection);
});

off();
```

> [!NOTE]
> 在 Svelte 5+ 中，请改用回调 props

## `$destroy`

```js
// @noErrors
component.$destroy();
```

将组件从 DOM 中移除，并触发所有 `onDestroy` 处理函数。

> [!NOTE]
> 在 Svelte 5+ 中，请改用 [`unmount`](svelte#unmount)

## 组件 props

```js
// @noErrors
component.prop;
```

```js
// @noErrors
component.prop = value;
```

如果组件是以 `accessors: true` 编译的，每个实例都会有对应于组件每个 props 的 getter 和 setter。设置一个值会导致 _同步_ 更新，而非 `component.$set(...)` 默认引发的异步更新。

默认情况下，`accessors` 为 `false`，除非你是作为自定义元素编译的。

```js
// @noErrors
console.log(component.count);
component.count += 1;
```

> [!NOTE]
> 在 Svelte 5+ 中，这一概念已过时。如果你想让属性可以从外部访问，请将它们 `export`

## 服务端组件 API

```js
// @noErrors
const result = Component.render(...)
```

与客户端组件不同，服务端组件在你渲染之后没有生命周期——它们的全部职责就是创建一些 HTML 和 CSS。正因如此，其 API 略有不同。

服务端组件暴露了一个 `render` 方法，可以用可选的 props 调用它。它返回一个带有 `head`、`html` 和 `css` 属性的对象，其中 `head` 包含所遇到的任何 `<svelte:head>` 元素的内容。

你可以使用 `svelte/register` 将 Svelte 组件直接导入 Node。

```js
// @noErrors
require('svelte/register');

const App = require('./App.svelte').default;

const { head, html, css } = App.render({
	answer: 42
});
```

`.render()` 方法接受以下参数：

| 参数      | 默认值 | 描述                         |
| --------- | ------ | ---------------------------- |
| `props`   | `{}`   | 提供给组件的一个属性对象     |
| `options` | `{}`   | 一个选项对象                 |

`options` 对象接受以下选项：

| 选项      | 默认值      | 描述                                                       |
| --------- | ----------- | ---------------------------------------------------------- |
| `context` | `new Map()` | 提供给组件的一个根级 context 键值对 `Map`                  |

```js
// @noErrors
const { head, html, css } = App.render(
	// props
	{ answer: 42 },
	// options
	{
		context: new Map([['context-key', 'context-value']])
	}
);
```

> [!NOTE]
> 在 Svelte 5+ 中，请改用 [`render`](svelte-server#render)
