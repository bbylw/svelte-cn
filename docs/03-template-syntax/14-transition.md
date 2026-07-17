---
title: transition:
tags: transitions
---

_过渡（transition）_ 是由状态变化导致元素进入或离开 DOM 时触发的。

当一个代码块（例如 `{#if ...}` 块）正在过渡离开时，块内的所有元素——包括那些自身没有过渡的元素——都会保留在 DOM 中，直到块内的每个过渡都已完成。

`transition:` 指令表示一个_双向_过渡，意味着它在过渡进行期间可以平滑地反转。

```svelte
<script>
	+++import { fade } from 'svelte/transition';+++

	let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>toggle</button>

{#if visible}
	<div +++transition:fade+++>fades in and out</div>
{/if}
```

## 局部与全局

过渡默认是局部的。局部过渡只在它们所属的块被创建或销毁时播放，而_不是_在父块被创建或销毁时播放。

```svelte
{#if x}
	{#if y}
		<p transition:fade>fades in and out only when y changes</p>

		<p transition:fade|global>fades in and out when x or y change</p>
	{/if}
{/if}
```

## 内置过渡

可以从 [`svelte/transition`](svelte-transition) 模块导入一组内置过渡。

## 过渡参数

过渡可以带有参数。

（双层的 `{{curlies}}` 并不是特殊语法；这是一个表达式标签内部的对象字面量。）

```svelte
{#if visible}
	<div transition:fade={{ duration: 2000 }}>fades in and out over two seconds</div>
{/if}
```

## 自定义过渡函数

```js
/// copy: false
// @noErrors
transition = (node: HTMLElement, params: any, options: { direction: 'in' | 'out' | 'both' }) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

过渡可以使用自定义函数。如果返回的对象带有一个 `css` 函数，Svelte 会为其生成一个[网页动画](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)关键帧。

传给 `css` 的 `t` 参数是经过 `easing` 函数处理后介于 `0` 和 `1` 之间的值。_进入_过渡从 `0` 运行到 `1`，_离开_过渡从 `1` 运行到 `0`——换句话说，`1` 是元素的自然状态，就好像没有应用任何过渡一样。`u` 参数等于 `1 - t`。

该函数会在过渡开始_之前_被反复调用，并传入不同的 `t` 和 `u` 参数。

```svelte
<!--- file: App.svelte --->
<script>
	import { elasticOut } from 'svelte/easing';

	/** @type {boolean} */
	export let visible;

	/**
	 * @param {HTMLElement} node
	 * @param {{ delay?: number, duration?: number, easing?: (t: number) => number }} params
	 */
	function whoosh(node, params) {
		const existingTransform = getComputedStyle(node).transform.replace('none', '');

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `transform: ${existingTransform} scale(${t})`
		};
	}
</script>

{#if visible}
	<div in:whoosh>whooshes in</div>
{/if}
```

自定义过渡函数也可以返回一个 `tick` 函数，它会在过渡_期间_被调用，并传入相同的 `t` 和 `u` 参数。

> [!NOTE] 如果可以使用 `css` 而非 `tick`，请优先使用 `css`——网页动画可以在主线程之外运行，从而避免较慢设备上的卡顿。

```svelte
<!--- file: App.svelte --->
<script>
	export let visible = false;

	/**
	 * @param {HTMLElement} node
	 * @param {{ speed?: number }} params
	 */
	function typewriter(node, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const text = node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: (t) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

{#if visible}
	<p in:typewriter={{ speed: 1 }}>The quick brown fox jumps over the lazy dog</p>
{/if}
```

如果过渡返回的是一个函数而不是过渡对象，该函数会在下一个微任务中被调用。这使得多个过渡能够相互协调，从而实现[交叉淡入淡出效果](/tutorial/deferred-transitions)。

过渡函数还会接收第三个参数 `options`，其中包含有关该过渡的信息。

`options` 对象中可用的值有：

- `direction` - 根据过渡类型，为 `in`、`out` 或 `both` 之一

## 过渡事件

带有过渡的元素除了任何标准 DOM 事件外，还会派发以下事件：

- `introstart`
- `introend`
- `outrostart`
- `outroend`

```svelte
{#if visible}
	<p
		transition:fly={{ y: 200, duration: 2000 }}
		onintrostart={() => (status = 'intro started')}
		onoutrostart={() => (status = 'outro started')}
		onintroend={() => (status = 'intro ended')}
		onoutroend={() => (status = 'outro ended')}
	>
		Flies in and out
	</p>
{/if}
```
