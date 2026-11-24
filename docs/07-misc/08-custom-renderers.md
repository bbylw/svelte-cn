---
title: 自定义渲染器
---

默认情况下，Svelte 组件渲染到 DOM。_自定义渲染器（custom renderer）_ 让它们可以渲染到别的地方——WebGL 场景、原生移动端 UI、终端、PDF 文档——而你仍然可以像往常一样编写带有状态、props、控制流以及其他一切的普通 Svelte 组件。

渲染器是一个小对象，它告诉 Svelte 如何创建、排列和更新目标环境中的节点。其余的一切都由 Svelte 负责。

该特性目前是实验性的，你必须在[配置](/docs/kit/configuration) Svelte 的地方（通常是 `svelte.config.js` 或 `vite.config.js`）添加 `experimental.customRenderer` 选项来选择启用：

```js
/// file: vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				experimental: {
					+++customRenderer: true+++
				}
			}
		})
	]
});
```

在实验性标志移除之前，该 API 可能会发生变化。

## 选择渲染器

选项设为 `true` 后，组件依然会渲染到 DOM，除非它们另有说明。组件通过 [`<svelte:options>`](svelte-options) 指向导出渲染器的模块，来选择一个渲染器：

```svelte
<!--- file: Scene.svelte --->
<svelte:options customRenderer="three-renderer" />

<script>
	let { speed } = $props();
	let rotation = $state(0);
</script>

<mesh rotation={[0, rotation, 0]} onclick={() => (rotation += speed)}>
	<boxGeometry args={[1, 1, 1]} />
</mesh>
```

> [!NOTE] `three-renderer` 是一个虚构的包，本页通篇用它作为示例。

自定义渲染器组件中的元素——这里的 `<mesh>` 和 `<boxGeometry>`——对 Svelte 来说没有特殊含义。Svelte 把它们的名称和属性传给渲染器，由渲染器决定怎么处理。

模块路径会像组件中其他任何导入一样被解析，因此它可以是包名、别名，或相对于该组件的路径（`customRenderer="./renderer.js"`）。

### 设置默认渲染器

如果你的大多数组件都使用同一个渲染器，你可以传入模块路径而不是 `true`，将它设为默认渲染器：

```js
/// file: vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				experimental: {
					+++customRenderer: 'three-renderer'+++
				}
			}
		})
	]
});
```

单个组件仍然可以选择不同的渲染器，或者通过 `<svelte:options customRenderer={null} />` 完全不使用自定义渲染器。

每个组件都会导入默认渲染器模块，因此全局配置的路径不能是相对路径——它会被相对于每个组件解析，而不是相对于你的配置文件。请使用包名、`#lib/renderer.js` 这样的子路径导入，或者绝对路径。

### 按文件选择渲染器

如果需要更多控制，可以传入一个函数。它接收每个组件的文件名，并返回该组件所使用的渲染器模块，或者返回 `null` 表示使用 DOM：

```js
/// file: vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				experimental: {
+++					customRenderer: ({ filename }) => {
						return filename.includes('/src/scene/') ? 'three-renderer' : null;
					}+++
				}
			}
		})
	]
});
```

由于该函数知道自己是在为哪个文件做选择，它也可以返回相对于该文件的路径。组件中的 `<svelte:options customRenderer={...}>` 优先于该函数。

## 在浏览器之外运行 {#Running-outside-the-browser}

许多渲染器面向的根本不是浏览器环境，比如终端、PDF 生成器、原生运行时或测试运行器。在这些环境中，`svelte` 通常会解析到它的服务端实现，该实现会把组件渲染成 HTML 字符串，而不是运行组件。

要在这些环境中使用自定义渲染器，请添加 `svelte-custom-renderer` [解析条件（resolve condition）](https://nodejs.org/api/packages.html#conditional-exports)，它会让 `svelte` 解析到真正运行组件的实现。在使用 Node 时，以 `--conditions=svelte-custom-renderer` 运行你的代码。如果你使用了打包工具，请把 `svelte-custom-renderer` 加入它的解析条件列表。如果缺少该条件，Svelte 会抛出一个错误并说明该怎么做。

你的组件仍然需要被编译，和任何 Svelte 应用一样——例如使用 Vite 和 `vite-plugin-svelte` 打包它们。

举个例子，下面是一个运行在终端里的时钟：

```svelte
<!--- file: Clock.svelte --->
<svelte:options customRenderer="terminal-renderer" />

<script>
	let time = $state(new Date());

	$effect(() => {
		const interval = setInterval(() => (time = new Date()), 1000);
		return () => clearInterval(interval);
	});
</script>

<box border="round" padding={1}>
	<text bold>The time is {time.toLocaleTimeString()}</text>
</box>
```

要启动它，请把渲染器以及由该渲染器创建的 target 传给 [`mount`](svelte#mount)：

```js
/// file: main.js
// @filename: ambient.d.ts
declare module 'terminal-renderer' {
	interface TerminalRendererFragment {}
	interface TerminalRendererElement {}
	interface TerminalRendererText {}
	interface TerminalRendererComment {}

	type TerminalNodes = {
		fragment: TerminalRendererFragment;
		element: TerminalRendererElement;
		text: TerminalRendererText;
		comment: TerminalRendererComment;
	}

	const renderer: import('svelte/renderer').Renderer<TerminalNodes>;
	export default renderer;

	export function draw(fragment: TerminalRendererFragment): void;
}
// @filename: index.js
// ---cut---
import { mount } from 'svelte';
import renderer, { draw } from 'terminal-renderer';
import Clock from './Clock.svelte';

const screen = renderer.createFragment();

mount(Clock, {
	target: screen,
	renderer
});

// 把 `screen` 绘制到终端，并在它每次变化时重新绘制
draw(screen);
```

> [!NOTE] 和 `three-renderer` 一样，`terminal-renderer` 也是虚构的。一个真正的终端渲染器会在 Svelte 修改屏幕时重新绘制，例如通过调用 `insert` 和 `setText` 之类的方法。

每一秒，effect 都会更新 `time`，Svelte 通过渲染器更新文本节点，渲染器则重新绘制屏幕。PDF 渲染器的原理相同，只是它不会持续绘制，而是在 `mount` 返回后把渲染出的内容转换为 PDF。

`props`、组件导出以及 [`unmount`](svelte#unmount) 的工作方式与 DOM 中一致。

## 在浏览器中使用

在浏览器中，你可以在普通 Svelte 应用里像使用其他任何组件一样使用自定义渲染器组件，前提是该组件的渲染器支持在 DOM 内部使用。大多数面向浏览器的渲染器都支持，但请查阅渲染器的文档，并参见[混合渲染器](#Mixing-renderers) 了解其工作原理：

```svelte
<!--- file: App.svelte --->
<script>
	import Scene from './Scene.svelte';
</script>

<h1>My scene</h1>

<canvas width="800" height="600">
	<Scene speed={0.1} />
</canvas>
```

你也可以完全使用自定义渲染器来渲染整个应用，只需把渲染器以及由该渲染器创建的 target 传给 [`mount`](svelte#mount)，就像上面的[终端示例](#Running-outside-the-browser) 那样：

```js
/// file: main.js
// @filename: ambient.d.ts
declare module 'three-renderer' {
	interface ThreeRendererFragment {}
	interface ThreeRendererElement {}
	interface ThreeRendererText {}
	interface ThreeRendererComment {}

	type ThreeNodes = {
		fragment: ThreeRendererFragment;
		element: ThreeRendererElement;
		text: ThreeRendererText;
		comment: ThreeRendererComment;
	}

	const renderer: import('svelte/renderer').Renderer<ThreeNodes>;
	export default renderer;

	export function draw(fragment: ThreeRendererFragment): void;
}
// @filename: index.js
// ---cut---
import { mount } from 'svelte';
import renderer from 'three-renderer';
import Scene from './Scene.svelte';

const root = renderer.createFragment();

mount(Scene, {
	target: root,
	renderer,
	props: { speed: 0.1 }
});

// 现在 `root` 中包含了该场景的节点
```

## 支持的特性

自定义渲染器组件支持 Svelte 的大部分特性，包括 runes、props、[代码片段](snippet)、组件、[上下文](context)、[`{#if}`](if)、[`{#each}`](each)、[`{#key}`](key) 和 [`{#await}`](await) 块、[`<svelte:boundary>`](svelte-boundary)、[`<svelte:element>`](svelte-element)、[attachments](@attach)、[`await` 表达式](await-expressions)，以及组件上的 `bind:`。

属性（包括 `class`、`style`、`class:` 和 `style:`）都会作为属性传给渲染器（参见[编写渲染器](#Writing-a-renderer)）。像 `onclick` 这样的事件属性会传给渲染器的 `addEventListener`。

有些特性只在 DOM 中才有意义，在自定义渲染器组件中会导致编译错误：

- 元素上的 `bind:`
- [过渡](transition)（`transition:`、`in:` 和 `out:`）与[动画](animate)（`animate:`）
- 遗留的 [`on:`](legacy-on) 指令
- [`{@html ...}`](@html)
- [`<svelte:head>`](svelte-head)、[`<svelte:window>`](svelte-window)、[`<svelte:document>`](svelte-document) 和 [`<svelte:body>`](svelte-body)
- `<svelte:options css="injected" />`

### 样式

Svelte 仍会为自定义渲染器组件的 `<style>` 做作用域处理，为它作用的元素添加诸如 `svelte-xyz123` 这样的类名，但它不会把样式注入页面——你的渲染器能否利用 CSS 取决于渲染器本身。

如果你在编译器选项中设置了 `css: 'injected'`（在某些配置下，开发环境就是这样），它对自定义渲染器组件会被忽略。在自定义渲染器组件中设置 `<svelte:options css="injected" />` 是错误的。

### 服务端渲染

自定义渲染器组件在服务端渲染期间不会渲染任何内容。如果在浏览器中使用自定义渲染器，这些组件会在页面加载之后在浏览器中创建。它们周围的 DOM 会照常进行服务端渲染和 hydration。

## 编写渲染器 {#Writing-a-renderer}

渲染器模块的默认导出是一个使用 `svelte/renderer` 中的 `createRenderer` 创建的对象。下面是一个完整的渲染器，它渲染为纯 JavaScript 对象，很适合作为实验的起点。真正的渲染器则会调用它所面向的平台——创建原生视图、场景对象等等。

```js
// @noErrors
/// file: renderer.js
import { createRenderer } from 'svelte/renderer';

export default createRenderer({
	createFragment() {
		return { type: 'fragment', children: [], parent: null };
	},
	createElement(name) {
		return {
			type: 'element',
			name,
			attributes: {},
			listeners: {},
			children: [],
			parent: null
		};
	},
	createText(data) {
		return { type: 'text', data, parent: null };
	},
	createComment(data) {
		return { type: 'comment', data, parent: null };
	},

	getNodeType(node) {
		return node.type;
	},
	getText(node) {
		return node.data;
	},
	setText(node, text) {
		node.data = text;
	},

	getAttribute(element, name) {
		return element.attributes[name] ?? null;
	},
	setAttribute(element, name, value) {
		element.attributes[name] = value;
	},
	removeAttribute(element, name) {
		delete element.attributes[name];
	},
	hasAttribute(element, name) {
		return name in element.attributes;
	},

	getFirstChild(node) {
		return node.children[0] ?? null;
	},
	getLastChild(node) {
		return node.children.at(-1) ?? null;
	},
	getNextSibling(node) {
		const siblings = node.parent?.children ?? [];
		return siblings[siblings.indexOf(node) + 1] ?? null;
	},
	getParent(node) {
		return node.parent;
	},

	insert(parent, node, anchor) {
		// 插入一个 fragment 会插入它的子节点，并让 fragment 保持为空
		const nodes = node.type === 'fragment' ? node.children.splice(0) : [node];

		// 如有必要，把子节点从它原来的父节点中移除
		for (const child of nodes) this.remove(child);

		const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
		parent.children.splice(index, 0, ...nodes);

		for (const child of nodes) child.parent = parent;
	},
	remove(node) {
		if (node.parent) {
			node.parent.children.splice(node.parent.children.indexOf(node), 1);
			node.parent = null;
		}
	},

	addEventListener(element, type, handler) {
		(element.listeners[type] ??= new Set()).add(handler);
	},
	removeEventListener(element, type, handler) {
		element.listeners[type]?.delete(handler);
	}
});
```

> [!NOTE] `createRenderer` 会原样返回它的参数——它的作用是提供类型安全。

下面各小节介绍 Svelte 对每个方法的要求。

### 节点

Svelte 处理四种节点：fragment、元素、文本节点和注释。它们可以是任何对你的渲染器来说合理的对象。

- `createFragment()` 创建一个 fragment，即用于容纳多个节点的临时容器。当 fragment 被插入到某处时，它的子节点会被移到那里，fragment 则保持为空。fragment 也被用作挂载的 target
- `createElement(name)` 创建一个具有给定名称的元素，比如 `'mesh'`（你可以在渲染目标中使用哪些元素，由你来决定）
- `createText(data)` 创建一个文本节点
- `createComment(data)` 创建一个注释。Svelte 把注释当作不可见的标记，例如用来记住 `{#if}` 块的内容应该放在哪里，因此它们不需要被显示出来
- `getNodeType(node)` 返回 `'fragment'`、`'element'`、`'text'` 或 `'comment'`
- `getText(node)` 返回文本节点的文本，或注释的数据
- `setText(node, text)` 修改文本节点的文本

### 树结构

- `insert(parent, node, anchor)` 把 `node` 插入到 `parent` 中、`anchor` 之前；如果 `anchor` 是 `null`，则插入到末尾。该节点可能已经在树中，这种情况下应该把它移动过去
- `remove(node)` 从它的父节点中移除一个节点
- `getParent(node)`、`getFirstChild(node)`、`getLastChild(node)` 和 `getNextSibling(node)` 返回相应的节点，或 `null`

### 属性

- 每个属性都会调用 `setAttribute(element, name, value)`，其值是组件中的原值——数字、数组、对象、函数等等——而不是被转换成字符串。这也包括在 DOM 中属于 property 而非 attribute 的属性，比如 `value` 和 `checked`。你的渲染器把它们当作 property、attribute 还是其他东西，由你决定
- 当值为 `null` 或 `undefined` 时，会调用 `removeAttribute(element, name)` 而不是 `setAttribute`
- `getAttribute(element, name)` 返回当前值，如果该属性没有被设置则返回 `null`
- `hasAttribute(element, name)` 返回该属性是否被设置。Svelte 用这个而不是检查 `getAttribute` 是否返回 `null`，因此在你的渲染器中，一个属性可以已设置并且值仍为 `null`

`class` 和 `style` 总是以字符串形式传入。Svelte 会把 `class` 属性与任何 `class:` 指令和作用域类名合并，把 `style` 属性与任何 `style:` 指令合并，然后一次性设置结果。

### 事件

- 对于 `onclick` 这样的事件属性，会调用 `addEventListener(element, type, handler, options)`，其中 `options` 描述该监听器是否为捕获（`onclickcapture`）或被动（passive）监听器。在事件发生时调用 `handler`——你可以传入任何对你的渲染器来说合理的参数，它们会被传给组件中的事件处理器
- `removeEventListener(element, type, handler, options)` 移除一个监听器。与 DOM 一样，Svelte 在元素被移除时不会调用它：元素及其监听器应当一起被丢弃

### 交叉（Crossings）

`embed` 和 `host` 是可选的，只有当你的渲染器会与 DOM 或其他渲染器结合使用时才需要。它们会在[下文](#Mixing-renderers) 介绍。

## TypeScript

如果你用 TypeScript 编写渲染器，请把节点类型传给 `createRenderer`，这样每个方法的参数都会有类型：

```ts
// @noErrors
import { createRenderer } from 'svelte/renderer';

export default createRenderer<{
	fragment: SceneFragment;
	element: SceneObject;
	text: SceneText;
	comment: SceneMarker;
}>({
	// ...
});
```

如果你不这样做，节点类型会从 `createFragment`、`createElement`、`createText` 和 `createComment` 的返回类型中推断出来，前提是这些方法在对象中排在前面。显式传入它们能得到更清晰的错误信息，并且不限制顺序。

`Renderer` 类型同样从 `svelte/renderer` 导出，用于与渲染器打交道的代码，比如包装渲染器的函数。它接收同样的节点类型记录：`Renderer<{ fragment: ...; element: ...; text: ...; comment: ... }>`。

## 混合渲染器 {#Mixing-renderers}

使用不同渲染器的组件可以相互嵌套，只要相关渲染器为此做好了准备。一个页面可以包含一个 3D 场景，而这个场景又可以包含 DOM 内容，比如定位在 3D 对象之上的 HTML 标签。上下文、props、代码片段、[错误边界](svelte-boundary) 以及响应性都可以跨越这个边界工作。

如果你使用的是某个渲染器库，它的文档应该会说明它的组件可以用在哪里。本节其余内容面向渲染器的作者。

一个渲染器的内容出现在另一个渲染器的内容中的位置被称为_交叉（crossing）_。外层渲染器是_宿主（host）_，内层渲染器是_访客（guest）_。在每个交叉处，Svelte 需要两样东西：

- 一个由访客拥有的 `container`，访客的内容被渲染到其中
- 可选地，一个由宿主拥有的 `node`，用于在宿主的树中表示访客的内容。如果没有，Svelte 会插入一个空的文本节点

渲染器通过两个可选方法 `embed` 和 `host` 来提供这些：

- `embed` 在访客上调用。它的含义是"我知道如何把我自己的内容放进另一个渲染器的树中"
- `host` 在宿主上调用。它的含义是"我知道如何在我的树中为另一个渲染器的内容腾出位置"

Svelte 会先尝试访客的 `embed`，再尝试宿主的 `host`。如果两者都不存在，它会抛出错误。DOM 没有这两个方法，因此在混合应用中，总是由自定义渲染器提供它们：

| 情形                                | 被调用的方法                    | 示例                             |
| ----------------------------------- | ------------------------------- | -------------------------------- |
| 自定义渲染器的内容位于 DOM 中       | 自定义渲染器的 `embed`          | 普通页面中的 WebGL 场景          |
| DOM 内容位于自定义渲染器中          | 自定义渲染器的 `host`           | 浮动在 3D 场景之上的 HTML 标签   |
| 渲染器 A 的内容位于渲染器 B 中      | A 的 `embed`，若 A 没有则为 B 的 `host` | 原生应用中的图表渲染器   |

换句话说：如果你的渲染器会被用在 DOM 应用中（大多数渲染器都是这种情况），请实现 `embed`。如果 DOM 内容（或另一个渲染器的内容）应当能够出现在你的渲染器树中，请实现 `host`。

### `embed`

`embed` 接收 `host` 渲染器（在 DOM 中为 `null`），以及内容渲染位置的 `parent` 和 `anchor`。下面是一个 canvas 渲染器的用法：它渲染到用户编写的 `<canvas>` 元素中，否则就创建自己的 canvas：

```js
// @noErrors
export default createRenderer({
	// ...

	embed({ host, parent }) {
		if (host !== null) {
			throw new Error('The canvas renderer can only be used inside the DOM');
		}

		const canvas = parent instanceof HTMLCanvasElement ? parent : document.createElement('canvas');
		const scene = create_scene(canvas);

		return {
			// 只有在我们创建了 canvas 时才插入它
			node: canvas === parent ? undefined : canvas,
			// 场景的根节点，内容会被渲染到其中
			container: scene.root,
			// 在内容被移除后调用
			destroy: () => scene.dispose()
		};
	}
});
```

正如这个示例所示，抛出错误是拒绝你的渲染器不支持的位置的最佳方式。它也是表达诸如"只能在 `<canvas>` 内部使用"这类要求的方式。

### `host`

`host` 是镜像的另一半。它接收 `guest` 渲染器（在 DOM 中为 `null`），并返回一个来自你的渲染器、要放进你的树中的 `node`，以及一个由访客拥有的 `container`：

```js
// @noErrors
export default createRenderer({
	// ...

	host({ guest }) {
		if (guest !== null) {
			throw new Error('Only DOM content can be rendered inside a scene');
		}

		// 一个把 DOM 元素作为叠加层显示的场景对象
		const overlay = create_overlay();

		return {
			node: overlay,
			container: overlay.element,
			destroy: () => overlay.dispose()
		};
	}
});
```

### 交叉的规则

- `embed` 和 `host` 会在组件（或代码片段）被创建时，为每个交叉同步调用一次。组件的每个实例都有自己的一次调用。
- `parent` 可能还没有被挂载到任何东西上。如果组件位于其父级标记的顶层，`parent` 就是一个尚未被插入的 fragment，因此不要在这些方法中测量布局，也不要假设页面已经连接。如果组件直接位于某个元素内部（例如上面的 `<canvas>`），`parent` 就是那个元素。
- Svelte 会在宿主的树中插入和移除 `node`，并在 `container` 中插入和移除内容。`destroy` 会在所有这些之后调用，因此只应使用它来释放你自己的资源——不要自己去移除 `node` 或内容。
- 多个交叉可以共享同一个 container，例如多个场景绘制到同一个 canvas 中。Svelte 会让它们的内容顺序与它们在宿主树中的节点顺序保持一致，包括它们被带 key 的 `{#each}` 块重新排序时。
- 像 `onclick` 这样的 DOM 事件处理器在 DOM container 内部可以正常工作，即使该 container 并不是页面的一部分。事件不会从一个渲染器传播到另一个渲染器。
- 代码片段可以在渲染器之间传递，只要它们是由使用 `experimental.customRenderer` 编译的组件创建的。用 [`createRawSnippet`](svelte#createRawSnippet) 创建的代码片段不能被自定义渲染器渲染。
