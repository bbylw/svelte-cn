---
title: $effect
tags: rune-effect
---

effect 是一些在状态更新时运行的函数，可用于调用第三方库、在 `<canvas>` 上绘制，或发起网络请求等。它们只在浏览器中运行，不会在服务端渲染期间执行。

一般来说，你_不应该_在 effect 中更新状态，因为这会让代码变得更复杂，并常常导致永不停止的更新循环。如果你发现自己正在这样做，请参阅[何时不该使用 `$effect`](#When-not-to-use-$effect) 了解替代方案。

你可以使用 `$effect` rune 创建一个 effect（[示例](/playground/untitled#H4sIAAAAAAAAE31S246bMBD9lZF3pSRSAqTVvrCAVPUP2sdSKY4ZwJJjkD0hSVH-vbINuWxXfQH5zMyZc2ZmZLVUaFn6a2R06ZGlHmBrpvnBvb71fWQHVOSwPbf4GS46TajJspRlVhjZU1HqkhQSWPkHIYdXS5xw-Zas3ueI6FRn7qHFS11_xSRZhIxbFtcDtw7SJb1iXaOg5XIFeQGjzyPRaevYNOGZIJ8qogbpe8CWiy_VzEpTXiQUcvPDkSVrSNZz1UlW1N5eLcqmpdXUvaQ4BmqlhZNUCgxuzFHDqUWNAxrYeUM76AzsnOsdiJbrBp_71lKpn3RRbii-4P3f-IMsRxS-wcDV_bL4PmSdBa2wl7pKnbp8DMgVvJm8ZNskKRkEM_OzyOKQFkgqOYBQ3Nq89Ns0nbIl81vMFN-jKoLMTOr-SOBOJS-Z8f5Y6D1wdcR8dFqvEBdetK-PHwj-z-cH8oHPY54wRJ8Ys7iSQ3Bg3VA9azQbmC9k35kKzYa6PoVtfwbbKVnBixBiGn7Pq0rqJoUtHiCZwAM3jdTPWCVtr_glhVrhecIa3vuksJ_b7TqFs4DPyriSjd5IwoNNQaAmNI-ESfR2p8zimzvN1swdCkvJHPH6-_oX8o1SgcIDAAA=)）：

```svelte
<script>
	let size = $state(50);
	let color = $state('#ff3e00');

	let canvas;

	$effect(() => {
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		// 只要 `color` 或 `size` 变化，就会重新运行
		context.fillStyle = color;
		context.fillRect(0, 0, size, size);
	});
</script>

<canvas bind:this={canvas} width="100" height="100"></canvas>
```

当 Svelte 运行一个 effect 函数时，它会追踪哪些状态（以及派生状态）被访问了（除非是在 [`untrack`](svelte#untrack) 内部访问的），并在该状态随后变化时重新运行函数。

> [!NOTE] 如果你难以理解为什么你的 `$effect` 会重新运行或不运行，请参阅[理解依赖关系](#Understanding-dependencies)。effect 的触发方式与你从 Svelte 4 迁移过来时习惯的 `$:` 块不同。

### 理解生命周期

你的 effect 会在组件挂载到 DOM 之后运行，并且是在状态变化后的一个[微任务](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)中。重新运行会被批处理（也就是说，在同一时刻改变 `color` 和 `size` 不会导致两次独立的运行），并且发生在任何 DOM 更新应用之后。

只要是在某个父 effect 正在运行时调用，`$effect` 可以用在任何地方，而不仅仅是在组件的顶层。

> [!NOTE] Svelte 在内部使用 effect 来表示模板中的逻辑和表达式——这正是 `<h1>hello {name}!</h1>` 能在 `name` 变化时更新的方式。

一个 effect 可以返回一个_清理函数（teardown function）_，它会在 effect 重新运行之前立即执行：

<!-- codeblock:start {"title":"Effect teardown"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let count = $state(0);
	let milliseconds = $state(1000);

	$effect(() => {
		// 每当 `milliseconds` 变化时，这个 interval 都会被重新创建
		const interval = setInterval(() => {
			count += 1;
		}, milliseconds);

		return () => {
			// 如果提供了清理函数，它会在以下时机运行：
			// a) effect 重新运行之前立即运行
			// b) 组件被销毁时
			clearInterval(interval);
		};
	});
</script>

<h1>{count}</h1>

<button onclick={() => (milliseconds *= 2)}>slower</button>
<button onclick={() => (milliseconds /= 2)}>faster</button>
```
<!-- codeblock:end -->

清理函数也会在 effect 被销毁时运行，这发生在它的父级被销毁（例如组件被卸载）或父 effect 重新运行时。

### 理解依赖关系 {#understanding-dependencies}

`$effect` 会自动收集在其函数体内_同步_读取的所有响应式值（`$state`、`$derived`、`$props`），并将它们注册为依赖。当这些依赖变化时，`$effect` 会安排一次重新运行。

如果 `$state` 和 `$derived` 是在 `$effect` 内部直接使用的（例如在创建[响应式类](https://svelte.dev/docs/svelte/$state#Classes)时），这些值将_不会_被视为依赖。

_异步_读取的值——例如在 `await` 之后或 `setTimeout` 内部——将不会被追踪。在这里，当 `color` 变化时会重绘 canvas，但当 `size` 变化时不会（[示例](/playground/untitled#H4sIAAAAAAAAE31T246bMBD9lZF3pWSlBEirfaEQqdo_2PatVIpjBrDkGGQPJGnEv1e2IZfVqX-wfHzmzJyZ4cIqqdCy9M-F0blDlnqArZjmB3f72XWRHVCRw_bc4me4aDWhJstSlllhZEfbQhekkMDKfwg5PFvihMvX5OXH_CJa1Zrb0-Kpqr5jkiwC48rieuDWQbqgZ6wqFLRcvkC-hYvnkWi1dWqa8ESQTxFRjfQWsOXiWzmr0sSLhEJu3p1YsoJkNUcdZUnN9dagrBu6FVRQHAM10sJRKgUG16bXcGxQ44AGdt7SDkTDdY02iqLHnJVU6hedlWuIp94JW6Tf8oBt_8GdTxlF0b4n0C35ZLBzXb3mmYn3ae6cOW74zj0YVzDNYXRHFt9mprNgHfZSl6mzml8CMoLvTV6wTZIUDEJv5us2iwMtiJRyAKG4tXnhl8O0yhbML0Wm-B7VNlSSSd31BG7z8oIZZ6dgIffAVY_5xdU9Qrz1Bnx8fCfwtZ7v8Qc9j3nB8PqgmMWlHIID6-bkVaPZwDySfWtKNGtquxQ23Qlsq2QJT0KIqb8dL0up6xQ2eIBkAg_c1FI_YqW0neLnFCqFpwmreedJYT7XX8FVOBfwWRhXstZrSXiwKQjUhOZeMIleb5JZfHWn2Yq5pWEpmR7Hv-N_wEqT8hEEAAA=)）：

```ts
// @filename: index.ts
declare let canvas: {
	width: number;
	height: number;
	getContext(type: '2d', options?: CanvasRenderingContext2DSettings): CanvasRenderingContext2D;
};
declare let color: string;
declare let size: number;

// ---cut---
$effect(() => {
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);

	// 只要 `color` 变化就会重新运行……
	context.fillStyle = color;

	setTimeout(() => {
		// ……但 `size` 变化不会
		context.fillRect(0, 0, size, size);
	}, 0);
});
```

一个 effect 只会在它读取的对象发生变化时重新运行，而不会在该对象内部的属性变化时重新运行。（如果你想在开发时观察对象_内部_的变化，可以使用 [`$inspect`]($inspect)。）

```svelte
<script>
	let state = $state({ value: 0 });
	let derived = $derived({ value: state.value * 2 });

	// 这会运行一次，因为 `state` 从未被重新赋值（只是被修改）
	$effect(() => {
		state;
	});

	// 只要 `state.value` 变化，这就会运行……
	$effect(() => {
		state.value;
	});

	// ……这个也是，因为 `derived` 每次都是一个新对象
	$effect(() => {
		derived;
	});
</script>

<button onclick={() => (state.value += 1)}>
	{state.value}
</button>

<p>{state.value} doubled is {derived.value}</p>
```

一个 effect 只依赖于它上一次运行时读取的值。这对于带有条件代码的 effect 有一些有趣的影响。

例如，如果在下面的代码片段中 `condition` 为 `true`，`if` 块内的代码会运行，`color` 会被求值。这意味着 `condition` 或 `color` 的变化[都会使 effect 重新运行](/playground/untitled#H4sIAAAAAAAAE21RQW6DMBD8ytaNBJHaJFLViwNIVZ8RcnBgXVk1xsILTYT4lZF3pWSlBEirfaEQqdo_2PatVIpjBrDkGGQPJGnEv1e2IZfVqX-wfHzmzJyZ4cIqqdCy9M-F0blDlnqArZjmB3f72XWRHVCRw_bc4me4aDWhJstSlllhZEfbQhekkMDKfwg5PFvihMvX5OXH_CJa1Zrb0-Kpqr5jkiwC48rieuDWQbqgZ6wqFLRcvkC-hYvnkWi1dWqa8ESQTxFRjfQWsOXiWzmr0sSLhEJu3p1YsoJkNUcdZUnN9dagrBu6FVRQHAM10sJRKgUG16bXcGxQ44AGdt7SDkTDdY02iqLHnJVU6hedlWuIp94JW6Tf8oBt_8GdTxlF0b4n0C35ZLBzXb3mmYn3ae6cOW74zj0YVzDNYXRHFt9mprNgHfZSl6mzml8CMoLvTV6wTZIUDEJv5us2iwMtiJRyAKG4tXnhl8O0yhbML0Wm-B7VNlSSSd31BG7z8oIZZ6dgIffAVY_5xdU9Qrz1Bnx8fCfwtZ7v8Qc9j3nB8PqgmMWlHIID6-bkVaPZwDySfWtKNGtquxQ23Qlsq2QJT0KIqb8dL0up6xQ2eIBkAg_c1FI_YqW0neLnFCqFpwmreedJYT7XX8FVOBfwWRhXstZrSXiwKQjUhOZeMIleb5JZfHWn2Yq5pWEpmR7Hv-N_wEqT8hEEAAA=)。

反之，如果 `condition` 为 `false`，`color` 不会被求值，effect 将_只_在 `condition` 变化时重新运行。

```ts
// @filename: ambient.d.ts
declare module 'canvas-confetti' {
	interface ConfettiOptions {
		colors: string[];
	}

	function confetti(opts?: ConfettiOptions): void;
	export default confetti;
}

// @filename: index.js
// ---cut---
import confetti from 'canvas-confetti';

let condition = $state(true);
let color = $state('#ff3e00');

$effect(() => {
	if (condition) {
		confetti({ colors: [color] });
	} else {
		confetti();
	}
});
```

## `$effect.pre`

在极少数情况下，你可能需要在 DOM 更新_之前_运行代码。为此我们可以使用 `$effect.pre` rune：

```svelte
<script>
	import { tick } from 'svelte';

	let div = $state();
	let messages = $state([]);

	// ...

	$effect.pre(() => {
		if (!div) return; // 尚未挂载

		// 引用 `messages` 数组的长度，以便这段代码在其变化时重新运行
		messages.length;

		// 添加新消息时自动滚动到底部
		if (div.offsetHeight + div.scrollTop > div.scrollHeight - 20) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}
	});
</script>

<div bind:this={div}>
	{#each messages as message}
		<p>{message}</p>
	{/each}
</div>
```

`$effect.pre` 运行在它之后所调度的 DOM 更新之前，而_不是_在 flush 中的每一次 DOM 变更之前——父组件的 DOM 可能已经被更新。使用 [await 表达式](await-expressions) 时，同一组件中的 `{#if ...}` 和 `{#each ...}` 等块更新也会在 `$effect.pre` 之前运行。

除了时机之外，`$effect.pre` 的工作方式与 `$effect` 完全相同。

## `$effect.tracking`

`$effect.tracking` rune 是一个高级特性，用于告诉你代码是否运行在追踪上下文中，例如 effect 内部或你的模板内部：

<!-- codeblock:start {"title":"$effect.tracking()"} -->
```svelte
<!--- file: App.svelte --->
<script>
	console.log('in component setup:', $effect.tracking()); // false

	$effect(() => {
		console.log('in effect:', $effect.tracking()); // true
	});
</script>

<p>in template: {$effect.tracking()}</p> <!-- true -->
```
<!-- codeblock:end -->

它被用于实现像 [`createSubscriber`](/docs/svelte/svelte-reactivity#createSubscriber) 这样的抽象，它会创建监听器来更新响应式值，但_仅当_这些值正在被追踪时（而不是，例如，在事件处理器内部被读取时）。

## `$effect.pending` {#$effect.pending}

在组件中使用 [`await`](await-expressions) 时，`$effect.pending()` rune 会告诉你当前[边界](svelte-boundary)内有多少个 promise 处于等待状态（不包括子边界）：

<!-- codeblock:start {"title":"$effect.pending"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let a = $state(1);
	let b = $state(2);

	async function add(a, b) {
		await new Promise((f) => setTimeout(f, 500)); // 人为延迟
		return a + b;
	}
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>

<p>{a} + {b} = {await add(a, b)}</p>

{#if $effect.pending()}
	<p>pending promises: {$effect.pending()}</p>
{/if}
```
<!-- codeblock:end -->

## `$effect.root`

`$effect.root` rune 是一个高级特性，它创建一个不会被自动清理的非追踪作用域。这对于你想要手动控制的嵌套 effect 很有用。这个 rune 还允许在组件初始化阶段之外创建 effect。

```js
const destroy = $effect.root(() => {
	$effect(() => {
		// 设置
	});

	return () => {
		// 清理
	};
});

// 之后……
destroy();
```

## 何时不该使用 `$effect` {#when-not-to-use-$effect}

总的来说，`$effect` 最好被视为一种_逃生舱口（escape hatch）_——适用于分析统计和直接操作 DOM 之类的事情——而不是一个你应该频繁使用的工具。尤其要避免用它来同步状态。不要这样做……

```svelte
<script>
	let count = $state(0);
	let doubled = $state();

	// 不要这样做！
	$effect(() => {
		doubled = count * 2;
	});
</script>
```

……而应该这样做：

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

> [!NOTE] 对于比 `count * 2` 这样简单表达式更复杂的情况，你也可以使用 `$derived.by`。

如果你使用 effect 是因为你想能够重新赋值派生值（例如构建乐观 UI），请注意[派生值可以直接被覆盖]($derived#Overriding-derived-values)（自 Svelte 5.25 起）。

你可能会忍不住用 effect 做一些复杂的事情来把一个值链接到另一个值。下面的示例展示了两个分别用于 "花费金额" 和 "剩余金额" 的输入，它们相互关联。如果你更新其中一个，另一个也应相应更新。与其为此使用 effect……

<!-- codeblock:start {"title":"在 effect 中设置状态（不要这样做！）"} -->
```svelte
<!--- file: App.svelte --->
<script>
	const total = 100;
	let spent = $state(0);
	let left = $state(total);

	$effect(() => {
		left = total - spent;
	});

	$effect(() => {
		spent = total - left;
	});
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={left} max={total} />
	{left}/{total} left
</label>

<style>
	label {
		display: flex;
		gap: 0.5em;
	}
</style>
```
<!-- codeblock:end -->

……不如尽可能使用 `oninput` 回调，或者——更好的是——[函数绑定](bind#Function-bindings)：

<!-- codeblock:start {"title":"使用函数绑定设置状态"} -->
```svelte
<!--- file: App.svelte --->
<script>
	const total = 100;
	let spent = $state(0);
	let left = $derived(total - spent);

	function updateLeft(left) {
		spent = total - left;
	}
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={() => left, updateLeft} max={total} />
	{left}/{total} left
</label>

<style>
	label {
		display: flex;
		gap: 0.5em;
	}
</style>
```
<!-- codeblock:end -->

如果你绝对必须在 effect 内更新 `$state`，并且因为对同一 `$state` 既读又写而陷入无限循环，请使用 [untrack](svelte#untrack)。
