---
title: TypeScript
---

<!-- - [basically what we have today](https://svelte.dev/docs/typescript)
- built-in support, but only for type-only features
- generics
- using `Component` and the other helper types
- using `svelte-check` -->

你可以在 Svelte 组件中使用 TypeScript。[Svelte VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) 等 IDE 扩展可以帮助你在编辑器中即时捕获错误，而 [`svelte-check`](https://www.npmjs.com/package/svelte-check) 可以在命令行中做同样的事情，你可以将它集成到你的 CI 中。

## `<script lang="ts">`

要在 Svelte 组件中使用 TypeScript，请为你的 `script` 标签添加 `lang="ts"`：

```svelte
<script lang="ts">
	let name: string = 'world';

	function greet(name: string) {
		alert(`Hello, ${name}!`);
	}
</script>

<button onclick={(e: Event) => greet(e.target.innerText)}>
	{name as string}
</button>
```

这样做允许你使用 TypeScript 的_纯类型_特性。也就是说，所有在转译为 JavaScript 时会消失的特性，例如类型注解或接口声明。那些需要 TypeScript 编译器输出实际代码的特性是不受支持的。这包括：

- 使用枚举（enums）
- 在构造函数中使用 `private`、`protected` 或 `public` 修饰符配合初始化器
- 使用尚未成为 ECMAScript 标准一部分（即在 TC39 流程中未达到第 4 阶段）的特性，因此尚未在我们用于解析 JavaScript 的解析器 Acorn 中实现

如果你想使用这些特性之一，你需要配置一个 `script` 预处理器。

## 预处理器配置

要在 Svelte 组件中使用非纯类型的 TypeScript 特性，你需要添加一个将 TypeScript 转换为 JavaScript 的预处理器。

### 使用 Vite

如果你使用的是 SvelteKit，或者是不带 SvelteKit 的 Vite，你可以在配置文件中使用来自 `@sveltejs/vite-plugin-svelte` 的 `vitePreprocess`：

```ts
/// file: svelte.config.js
// @noErrors
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	// Note the additional `{ script: true }`
	preprocess: vitePreprocess({ script: true })
};

export default config;
```

### 使用其他构建工具

如果你使用的是 Rollup（通过 [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte)）或 Webpack（通过 [svelte-loader](https://github.com/sveltejs/svelte-loader)）等工具，请安装 `typescript` 和 `svelte-preprocess`，并将该预处理器添加到插件配置中。更多信息请参阅相应插件的 README。

> [!NOTE] 如果你正在启动一个新项目，我们推荐使用 SvelteKit 或 Vite。

## tsconfig.json 设置

使用 TypeScript 时，请确保你的 `tsconfig.json` 配置正确。

- 使用至少为 `ES2015` 的 [`target`](https://www.typescriptlang.org/tsconfig/#target)，这样类就不会被编译为函数
- 将 [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax) 设为 `true`，这样导入会保持原样
- 将 [`isolatedModules`](https://www.typescriptlang.org/tsconfig/#isolatedModules) 设为 `true`，这样每个文件都会被独立看待。TypeScript 有几个特性需要跨文件的分析与编译，而 Svelte 编译器以及像 Vite 这样的工具链并不会这样做。

## 为 `$props` 添加类型

为 `$props` 添加类型，就像为带有某些属性的普通对象添加类型一样。

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		requiredProperty: number;
		optionalProperty?: boolean;
		snippetWithStringArgument: Snippet<[string]>;
		eventHandler: (arg: string) => void;
		[key: string]: unknown;
	}

	let {
		requiredProperty,
		optionalProperty,
		snippetWithStringArgument,
		eventHandler,
		...everythingElse
	}: Props = $props();
</script>

<button onclick={() => eventHandler('clicked button')}>
	{@render snippetWithStringArgument('hello')}
</button>
```

## 泛型 `$props`

组件可以声明其属性之间的泛型关系。一个例子是泛型列表组件，它接收一个条目列表和一个接收列表中某个条目的回调属性。要声明 `items` 属性和 `select` 回调操作的是相同的类型，请向 `script` 标签添加 `generics` 属性：

```svelte
<script lang="ts" generics="Item extends { text: string }">
	interface Props {
		items: Item[];
		select(item: Item): void;
	}

	let { items, select }: Props = $props();
</script>

{#each items as item}
	<button onclick={() => select(item)}>
		{item.text}
	</button>
{/each}
```

`generics` 的内容就是你会放在泛型函数的 `<...>` 标签之间的部分。换句话说，你可以使用多个泛型、`extends` 和回退类型。

## 为包装组件添加类型 {#typing-wrapper-components}

如果你正在编写一个包装原生元素的组件，你可能会想将该底层元素的所有属性都暴露给用户。在这种情况下，请使用（或扩展）`svelte/elements` 提供的接口之一。下面是一个 `Button` 组件的示例：

```svelte
<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let { children, ...rest }: HTMLButtonAttributes = $props();
</script>

<button {...rest}>
	{@render children?.()}
</button>
```

并非所有元素都有专门的类型定义。对于那些没有的，请使用 `SvelteHTMLElements`：

```svelte
<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	let { children, ...rest }: SvelteHTMLElements['div'] = $props();
</script>

<div {...rest}>
	{@render children?.()}
</div>
```

## 为 `$state` 添加类型

你可以像为任何其他变量添加类型一样为 `$state` 添加类型。

```ts
let count: number = $state(0);
```

如果你不为 `$state` 提供初始值，它的部分类型将会是 `undefined`。

```ts
// @noErrors
// Error: Type 'number | undefined' is not assignable to type 'number'
let count: number = $state();
```

你可以将类型作为泛型参数直接传入，以稳妥地处理这种情况。TypeScript 会把该变量推断为 `number | undefined`。

```ts
let count = $state<number>();
```

如果你知道该变量在你首次使用它之前_一定_会被定义，请使用 `as` 强制转换。这在类的上下文中尤其有用：

```ts
class Counter {
	count = $state() as number;
	constructor(initial: number) {
		this.count = initial;
	}
}
```

## `Component` 类型

Svelte 组件的类型是 `Component`。你可以使用它及其相关的类型来表达各种约束。

将它和动态组件一起使用，以限制可以传递给它的组件种类：

```svelte
<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		// only components that have at most the "prop"
		// property required can be passed
		DynamicComponent: Component<{ prop: string }>;
	}

	let { DynamicComponent }: Props = $props();
</script>

<DynamicComponent prop="foo" />
```

> [!LEGACY] 在 Svelte 4 中，组件的类型是 `SvelteComponent`

要提取组件的属性，请使用 `ComponentProps`。

```ts
import type { Component, ComponentProps } from 'svelte';
import MyComponent from './MyComponent.svelte';

function withProps<TComponent extends Component<any>>(
	component: TComponent,
	props: ComponentProps<TComponent>
) {}

// Errors if the second argument is not the correct props expected
// by the component in the first argument.
withProps(MyComponent, { foo: 'bar' });
```

要声明某个变量期望的是组件的构造器或实例类型：

```svelte
<script lang="ts">
	import MyComponent from './MyComponent.svelte';

	let componentConstructor: typeof MyComponent = MyComponent;
	let componentInstance: MyComponent;
</script>

<MyComponent bind:this={componentInstance} />
```

## 增强内置的 DOM 类型

Svelte 尽最大努力提供了所有存在的 HTML DOM 类型。有时你可能想使用来自某个 action 的实验性属性或自定义事件。在这些情况下，TypeScript 会抛出一个类型错误，表示它不认识这些类型。如果这是一个非实验性的标准属性/事件，这很可能是我们 [HTML 类型定义](https://github.com/sveltejs/svelte/blob/main/packages/svelte/elements.d.ts) 中缺失了相应的类型。在这种情况下，欢迎你提交 issue 和/或 PR 来修复它。

如果是自定义或实验性的属性/事件，你可以通过扩充 `svelte/elements` 模块来增强类型定义，如下所示：

```ts
/// file: additional-svelte-typings.d.ts
import { HTMLButtonAttributes } from 'svelte/elements';

declare module 'svelte/elements' {
	// add a new element
	export interface SvelteHTMLElements {
		'custom-button': HTMLButtonAttributes;
	}

	// add a new global attribute that is available on all html elements
	export interface HTMLAttributes<T> {
		globalattribute?: string;
	}

	// add a new attribute for button elements
	export interface HTMLButtonAttributes {
		veryexperimentalattribute?: string;
	}
}

export {}; // ensure this is not an ambient module, else types will be overridden instead of augmented
```

然后确保该 `d.ts` 文件在你的 `tsconfig.json` 中被引用。如果它类似于 `"include": ["src/**/*"]` 且你的 `d.ts` 文件位于 `src` 内部，那它应该可以工作。你可能需要重新加载才能让更改生效。
