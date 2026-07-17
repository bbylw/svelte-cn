---
title: Svelte 4 迁移指南
---

本迁移指南概述了如何从 Svelte 3 迁移到 4。如需了解每项变更的更多细节，请参阅链接的 PR。可使用迁移脚本自动完成部分迁移：`npx svelte-migrate@latest svelte-4`

如果你是库作者，需要考虑是仅支持 Svelte 4，还是同时支持 Svelte 3。由于大多数破坏性变更影响面不大，这通常很容易做到。同时请记得更新 `peerDependencies` 中的版本范围。

## 最低版本要求

- 升级到 Node 16 或更高版本。更早的版本不再受支持。([#8566](https://github.com/sveltejs/svelte/issues/8566))
- 如果你使用 SvelteKit，升级到 1.20.4 或更新版本 ([sveltejs/kit#10172](https://github.com/sveltejs/kit/pull/10172))
- 如果你在脱离 SvelteKit 的情况下使用 Vite，升级到 `vite-plugin-svelte` 2.4.1 或更新版本 ([#8516](https://github.com/sveltejs/svelte/issues/8516))
- 如果你使用 webpack，升级到 webpack 5 或更高版本以及 `svelte-loader` 3.1.8 或更高版本。更早的版本不再受支持。([#8515](https://github.com/sveltejs/svelte/issues/8515), [198dbcf](https://github.com/sveltejs/svelte/commit/198dbcf))
- 如果你使用 Rollup，升级到 `rollup-plugin-svelte` 7.1.5 或更高版本 ([198dbcf](https://github.com/sveltejs/svelte/commit/198dbcf))
- 如果你使用 TypeScript，升级到 TypeScript 5 或更高版本。更低版本也许仍可使用，但不做任何保证。([#8488](https://github.com/sveltejs/svelte/issues/8488))

## 打包工具的浏览器条件

打包工具在构建面向浏览器的前端 bundle 时，现在必须指定 `browser` 条件。SvelteKit 和 Vite 会自动为你处理。如果你使用其他工具，你可能会注意到 `onMount` 等生命周期回调没有被调用，这时你需要更新模块解析配置。
- 对于 Rollup，需在 `@rollup/plugin-node-resolve` 插件中将其选项的 `browser` 设为 `true`。详见 [`rollup-plugin-svelte`](https://github.com/sveltejs/rollup-plugin-svelte/#usage) 文档
- 对于 webpack，需将 `"browser"` 加入 `conditionNames` 数组。如果你设置了 `alias` 配置，可能也需要一并更新。详见 [`svelte-loader`](https://github.com/sveltejs/svelte-loader#usage) 文档

([#8516](https://github.com/sveltejs/svelte/issues/8516))

## 移除 CJS 相关输出

Svelte 不再支持用于编译器输出的 CommonJS（CJS）格式，同时也移除了 `svelte/register` 钩子和 CJS 运行时版本。如果你需要继续使用 CJS 输出格式，可考虑在构建后步骤中使用打包工具将 Svelte 的 ESM 输出转换为 CJS。([#8613](https://github.com/sveltejs/svelte/issues/8613))

## 更严格的 Svelte 函数类型

现在 `createEventDispatcher`、`Action`、`ActionReturn` 和 `onMount` 的类型更加严格：

- `createEventDispatcher` 现在支持指定 payload 是可选的、必需的或不存在的，并且调用点会相应地进行检查 ([#7224](https://github.com/sveltejs/svelte/issues/7224))

```ts
// @errors: 2554 2345
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher<{
	optional: number | null;
	required: string;
	noArgument: null;
}>();

// Svelte version 3:
dispatch('optional');
dispatch('required'); // 我仍然可以省略 detail 参数
dispatch('noArgument', 'surprise'); // 我仍然可以传入 detail 参数

// 使用 TypeScript 严格模式的 Svelte version 4：
dispatch('optional');
dispatch('required'); // 错误，缺少参数
dispatch('noArgument', 'surprise'); // 错误，不能传入参数
```

- `Action` 和 `ActionReturn` 的默认参数类型现在为 `undefined`，这意味着如果你想指定该 action 接收一个参数，就需要为该泛型指定类型。迁移脚本会自动完成此迁移 ([#7442](https://github.com/sveltejs/svelte/pull/7442))

```ts
// @noErrors
---const action: Action = (node, params) => { ... } // 如果你以任何方式使用了 params，现在这会报错---
+++const action: Action<HTMLElement, string> = (node, params) => { ... } // params 的类型为 string+++
```

- `onMount` 现在会在你异步地从其内部返回一个函数时报出类型错误，因为这很可能是代码中的一个 bug——你期望该回调在销毁时被调用，而实际上只有同步返回的函数才会如此 ([#8136](https://github.com/sveltejs/svelte/issues/8136))

```js
// @noErrors
// 此变更揭示出真实 bug 的示例
onMount(
---	// someCleanup() 不会被调用，因为传给 onMount 的函数是异步的
	async () => {
		const something = await foo();---
+++	// someCleanup() 会被调用，因为传给 onMount 的函数是同步的
	() => {
		foo().then(something => {...});
		// ...
		return () => someCleanup();
	}
);
```

## 使用 Svelte 创建自定义元素

使用 Svelte 创建自定义元素的方式已彻底改造并显著改进。`tag` 选项已被弃用，改用新的 `customElement` 选项：

```svelte
---<svelte:options tag="my-component" />---
+++<svelte:options customElement="my-component" />+++
```

这一变更是为了给高级用例提供 [更强的可配置性](custom-elements#Component-options)。迁移脚本会自动调整你的代码。属性的更新时机也略有变化。([#8457](https://github.com/sveltejs/svelte/issues/8457))

## SvelteComponentTyped 已弃用

`SvelteComponentTyped` 已弃用，因为 `SvelteComponent` 现在已具备其全部类型能力。请将所有 `SvelteComponentTyped` 替换为 `SvelteComponent`。

```js
---import { SvelteComponentTyped } from 'svelte';---
+++import { SvelteComponent } from 'svelte';+++

---export class Foo extends SvelteComponentTyped<{ aProp: string }> {}---
+++export class Foo extends SvelteComponent<{ aProp: string }> {}+++
```

如果你此前一直将 `SvelteComponent` 作为组件实例类型使用，现在可能会看到一个不太明确的类型错误，可通过将 `: typeof SvelteComponent` 改为 `: typeof SvelteComponent<any>` 来解决。

```svelte
<script>
	import ComponentA from './ComponentA.svelte';
	import ComponentB from './ComponentB.svelte';
	import { SvelteComponent } from 'svelte';

	let component: typeof SvelteComponent+++<any>+++;

	function choseRandomly() {
		component = Math.random() > 0.5 ? ComponentA : ComponentB;
	}
</script>

<button on:click={choseRandomly}>random</button>
<svelte:element this={component} />
```

迁移脚本会自动为你完成以上两处修改。([#8512](https://github.com/sveltejs/svelte/issues/8512))

## 过渡默认是局部的

过渡现在默认是局部的，以避免在页面导航时产生混淆。"局部"意味着某个过渡不会在其所在的嵌套控制流块（`each/if/await/key`）中播放，除非被创建/销毁的不是其直接父块而是更上层的块。在下面的例子中，`slide` 进入动画仅在 `success` 从 `false` 变为 `true` 时播放，而 _不会_ 在 `show` 从 `false` 变为 `true` 时播放：

```svelte
{#if show}
	...
	{#if success}
		<p in:slide>Success</p>
	{/each}
{/if}
```

若要让过渡变为全局，可添加 `|global` 修饰符——这样当上方 _任意_ 控制流块被创建/销毁时它都会播放。迁移脚本会自动为你完成。([#6686](https://github.com/sveltejs/svelte/issues/6686))

## 默认插槽绑定

默认插槽的绑定不再对外暴露给具名插槽，反之亦然：

```svelte
<script>
	import Nested from './Nested.svelte';
</script>

<Nested let:count>
	<p>
		默认插槽中的 count — 可用：{count}
	</p>
	<p slot="bar">
		bar 插槽中的 count — 不可用：{count}
	</p>
</Nested>
```

这让插槽绑定更加一致，因为当默认插槽来自一个列表而具名插槽并非如此时，其行为是未定义的。([#6049](https://github.com/sveltejs/svelte/issues/6049))

## 预处理器

预处理器的应用顺序发生了变化。现在，预处理器按数组顺序执行，而在同一组内，顺序为 markup、script、style。

```js
// @errors: 2304
import { preprocess } from 'svelte/compiler';

const { code } = await preprocess(
	source,
	[
		{
			markup: () => {
				console.log('markup-1');
			},
			script: () => {
				console.log('script-1');
			},
			style: () => {
				console.log('style-1');
			}
		},
		{
			markup: () => {
				console.log('markup-2');
			},
			script: () => {
				console.log('script-2');
			},
			style: () => {
				console.log('style-2');
			}
		}
	],
	{
		filename: 'App.svelte'
	}
);

// Svelte 3 的日志：
// markup-1
// markup-2
// script-1
// script-2
// style-1
// style-2

// Svelte 4 的日志：
// markup-1
// script-1
// style-1
// markup-2
// script-2
// style-2
```

例如，如果你正在使用 `MDsveX`，这可能会影响你——你需要确保它排在任何 script 或 style 预处理器之前。

```js
// @noErrors
preprocess: [
---	vitePreprocess(),
	mdsvex(mdsvexConfig)---
+++	mdsvex(mdsvexConfig),
	vitePreprocess()+++
]
```

每个预处理器现在还必须有一个名称。([#8618](https://github.com/sveltejs/svelte/issues/8618))

## 新的 eslint 包

`eslint-plugin-svelte3` 已弃用。它可能仍能与 Svelte 4 配合使用，但我们无法对此提供任何保证。我们建议切换到我们的新包 [eslint-plugin-svelte](https://github.com/sveltejs/eslint-plugin-svelte)。关于如何迁移的说明，请参阅 [这篇 Github 帖子](https://github.com/sveltejs/kit/issues/10242#issuecomment-1610798405)。或者，你也可以使用 `npm create svelte@latest` 创建一个新项目，选择 eslint（以及可能的 TypeScript）选项，然后将相关文件复制到你的现有项目中。

## 其他破坏性变更

- 现在会对正在退出的元素应用 `inert` 属性，使其对辅助技术不可见并阻止交互。([#8628](https://github.com/sveltejs/svelte/pull/8628))
- 运行时现在使用 `classList.toggle(name, boolean)`，这在非常古老的浏览器中可能不奏效。如果你需要支持这些浏览器，可以考虑使用 [polyfill](https://github.com/eligrey/classList.js)。([#8629](https://github.com/sveltejs/svelte/issues/8629))
- 运行时现在使用 `CustomEvent` 构造函数，这在非常古老的浏览器中可能不奏效。如果你需要支持这些浏览器，可以考虑使用 [polyfill](https://github.com/theftprevention/event-constructor-polyfill/tree/master)。([#8775](https://github.com/sveltejs/svelte/pull/8775))
- 使用 `StartStopNotifier` 接口（它会被传给 `writable` 等的创建函数）从头实现自定义 store 的人，现在除了 set 函数外还需要传入一个 update 函数。这对使用 store 或通过现有 Svelte store 创建 store 的人没有影响。([#6750](https://github.com/sveltejs/svelte/issues/6750))
- `derived` 现在会对传入的 falsy 值（而非 store）抛出错误。([#7947](https://github.com/sveltejs/svelte/issues/7947))
- 为 `svelte/internal` 提供的类型定义已被移除，以进一步劝阻使用这些并不属于公共 API 的内部方法。其中大部分很可能会在 Svelte 5 中发生变化
- 移除 DOM 节点现在会被批处理，这会略微改变其顺序，如果你在这些元素上使用了 `MutationObserver`，可能会影响事件触发的顺序 ([#8763](https://github.com/sveltejs/svelte/pull/8763))
- 如果你此前通过 `svelte.JSX` 命名空间增强了全局类型定义，你需要将其迁移为使用 `svelteHTML` 命名空间。同样，如果你曾使用 `svelte.JSX` 命名空间来获取其中的类型定义，你需要将这些类型迁移为改用 `svelte/elements` 中的类型。你可以在 [这里](https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-getting-deprecation-warnings-for-sveltejsx--i-want-to-migrate-to-the-new-typings) 找到更多相关信息
