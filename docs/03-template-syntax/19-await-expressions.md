---
title: await
---

自 Svelte 5.36 起，你可以在组件的三个之前不可用 `await` 关键字的位置使用它：

- 在组件 `<script>` 的顶层
- 在 `$derived(...)` 声明内部
- 在标记内部

该功能目前处于实验阶段，你必须在[配置](/docs/kit/configuration) Svelte 的地方（通常是 `svelte.config.js`）添加 `experimental.async` 选项来启用它：

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};
```

该实验性标志将在 Svelte 6 中被移除。

## 同步更新 {#synchronized-updates}

当 `await` 表达式依赖于某个特定的状态时，在该异步工作完成之前，对该状态的更改不会反映在 UI 中，这样 UI 就不会停留在不一致的状态。换句话说，在像下面这样的示例中……

<!-- codeblock:start {"title":"Synchronized updates"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let a = $state(1);
	let b = $state(2);

	async function add(a, b) {
		await new Promise((f) => setTimeout(f, 500)); // artificial delay
		return a + b;
	}
</script>

<input type="number" bind:value={a}>
<input type="number" bind:value={b}>

<p>{a} + {b} = {await add(a, b)}</p>
```
<!-- codeblock:end -->

……如果你让 `a` 自增，`<p>` 的内容_不会_立即更新为读取新值——

```html
<p>2 + 2 = 3</p>
```

——相反，文本会在 `add(a, b)` resolve 时更新为 `2 + 2 = 4`。

更新可以重叠——一个快速的更新会在更早的慢速更新仍在进行时被反映到 UI 中。

## 并发

Svelte 会尽可能多地并行执行异步工作。例如，如果你的标记中有两个 `await` 表达式……

```svelte
<p>{await one(x)}</p>
<p>{await two(y)}</p>
```

……这两个函数会同时运行，因为它们是相互独立的表达式，即使它们在视觉上是顺序的。

这不适用于你的 `<script>` 内部或异步函数内部顺序的 `await` 表达式——这些会像任何其他异步 JavaScript 一样运行。唯一的例外是，相互独立的 `$derived` 表达式会各自独立更新，尽管它们在首次创建时会顺序运行：

```js
/** @param {number} x */
async function one(x) { return x; }
/** @param {number} y */
async function two(y) { return y; }
let x = $state(1);
let y = $state(2);
// ---cut---
// `b` will not be created until `a` has resolved,
// but once created they will update independently
// even if `x` and `y` update simultaneously
let a = $derived(await one(x));
let b = $derived(await two(y));
```

> [!NOTE] 如果你编写这样的代码，Svelte 会给出 [`await_waterfall`](runtime-warnings#Client-warnings-await_waterfall) 警告

## 指示加载状态

要渲染占位 UI，你可以将内容包裹在一个带有 [`pending`](svelte-boundary#Properties-pending) 代码片段的 `<svelte:boundary>` 中。它会在该边界首次创建时显示，但不会在随后的更新中显示，因为那些更新是全局协调的。

在边界的内容首次解析并替换掉 `pending` 代码片段之后，你可以通过 [`$effect.pending()`]($effect#$effect.pending) 检测到后续的异步工作。例如，这正是你用来在表单字段旁显示"我们正在异步校验你的输入"旋转图标的方式。

你也可以使用 [`settled()`](svelte#settled) 来获取一个在当前更新完成时 resolve 的 promise：

```js
let color = 'red';
let answer = -1;
let updating = false;
// ---cut---
import { tick, settled } from 'svelte';

async function onclick() {
	updating = true;

	// without this, the change to `updating` will be
	// grouped with the other changes, meaning it
	// won't be reflected in the UI
	await tick();

	color = 'octarine';
	answer = 42;

	await settled();

	// any updates affected by `color` or `answer`
	// have now been applied
	updating = false;
}
```

## 错误处理

`await` 表达式中的错误会冒泡到最近的[错误边界](svelte-boundary)。

## 服务端渲染

Svelte 通过 `render(...)` API 支持异步服务端渲染（SSR）。要使用它，只需 await 其返回值：

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';

const { head, body } = +++await+++ render(App);
```

> [!NOTE] 如果你使用的是像 SvelteKit 这样的框架，这一步会由框架替你完成。

如果在 SSR 期间遇到带有 `pending` 代码片段的 `<svelte:boundary>`，那么在该片段渲染的同时，其余内容会被忽略。在 `await render(...)` 返回之前，所有在没有 `pending` 代码片段的边界之外遇到的 `await` 表达式都会解析并渲染其内容。

> [!NOTE] 未来，我们计划添加一种流式实现，在后台渲染内容。

## 分叉（Forking）

在 5.42 中新增的 [`fork(...)`](svelte#fork) API，使得运行你_期望_在不久的将来发生的 `await` 表达式成为可能。这主要是为像 SvelteKit 这样的框架设计的，用于在用户发出导航意图时实现预加载。

```svelte
<script>
	import { fork } from 'svelte';
	import Menu from './Menu.svelte';

	let open = $state(false);

	/** @type {import('svelte').Fork | null} */
	let pending = null;

	function preload() {
		pending ??= fork(() => {
			open = true;
		});
	}

	function discard() {
		pending?.discard();
		pending = null;
	}
</script>

<button
	onfocusin={preload}
	onfocusout={discard}
	onpointerenter={preload}
	onpointerleave={discard}
	onclick={() => {
		pending?.commit();
		pending = null;

		// in case `pending` didn't exist
		// (if it did, this is a no-op)
		open = true;
	}}
>open menu</button>

{#if open}
	<!-- any async work inside this component will start
	     as soon as the fork is created -->
	<Menu onclose={() => open = false} />
{/if}
```

## 注意事项

作为一个实验性功能，`await` 的处理方式（以及相关的 API 如 `$effect.pending()`）可能会在次要版本（semver）之外发生破坏性变更，尽管我们打算将此类变更保持在最低限度。

## 破坏性变更

当 `experimental.async` 选项为 `true` 时，effects 的运行顺序会略有不同。具体来说，像 `{#if ...}` 和 `{#each ...}` 这样的_块_ effect 现在会在同一组件内的 `$effect.pre` 或 `beforeUpdate` 之前运行，这意味着在某些[非常罕见的情况](/playground/untitled?#H4sIAAAAAAAAE22R3VLDIBCFX2WLvUhnTHsf0zre-Q7WmfwtFV2BgU1rJ5N3F0jaOuoVcPbw7VkYhK4_URTiGYkMnIyjDjLsFGO3EvdCKkIvipdB8NlGXxSCPt96snbtj0gctab2-J_eGs2oOWBE6VunLO_2es-EDKZ5x5ZhC0vPNWM2gHXGouNzAex6hHH1cPHil_Lsb95YT9VQX6KUAbS2DrNsBdsdDFHe8_XSYjH1SrhELTe3MLpsemajweiWVPuxHSbKNd-8eQTdE0EBf4OOaSg2hwNhhE_ABB_ulJzjj9FULvIcqgm5vnAqUB7wWFMfhuugQWkcAr8hVD-mq8D12kOep24J_IszToOXdveGDsuNnZwbJUNlXsKnhJdhUcTo42s41YpOSneikDV5HL8BktM6yRcCAAA=) 下，有可能更新一个本不应再存在的块，但这只有当你在 effect 内部更新状态时才会发生，[而这是你应该避免的]($effect#When-not-to-use-$effect)。
