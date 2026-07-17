---
title: animate:
---

当[带 key 的 each 块](each#Keyed-each-blocks) 的内容被重新排序时，会触发动画。当元素被添加或移除时，动画不会运行，只有在 each 块内现有数据项的索引发生变化时才会运行。animate 指令必须位于带 key 的 each 块的_直接_子元素上。

动画可以与 Svelte 的[内置动画函数](svelte-animate) 或[自定义动画函数](#Custom-animation-functions) 一起使用。

```svelte
<!-- When `list` is reordered the animation will run -->
{#each list as item, index (item)}
	<li animate:flip>{item}</li>
{/each}
```

## 动画参数

与 actions 和过渡一样，动画也可以带有参数。

（双层的 `{{curlies}}` 并不是特殊语法；这是一个表达式标签内部的对象字面量。）

```svelte
{#each list as item, index (item)}
	<li animate:flip={{ delay: 500 }}>{item}</li>
{/each}
```

## 自定义动画函数 {#Custom-animation-functions}

```js
/// copy: false
// @noErrors
animation = (node: HTMLElement, { from: DOMRect, to: DOMRect } , params: any) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

动画可以使用自定义函数，这些函数以 `node`、一个 `animation` 对象以及任意 `parameters` 作为参数。`animation` 参数是一个包含 `from` 和 `to` 属性的对象，每个属性都包含一个描述元素在其`起始`与`结束`位置时几何形状的 [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect#Properties)。`from` 属性是元素起始位置的 DOMRect，`to` 属性是列表重新排序且 DOM 更新后元素最终位置的 DOMRect。

如果返回的对象带有一个 `css` 方法，Svelte 会创建一个在元素上播放的[网页动画](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)。

传给 `css` 的 `t` 参数是经过 `easing` 函数处理后介于 `0` 和 `1` 之间的值。`u` 参数等于 `1 - t`。

该函数会在动画开始_之前_被反复调用，并传入不同的 `t` 和 `u` 参数。

<!-- TODO: Types -->

```svelte
<!--- file: App.svelte --->
<script>
	import { cubicOut } from 'svelte/easing';

	/**
	 * @param {HTMLElement} node
	 * @param {{ from: DOMRect; to: DOMRect }} states
	 * @param {any} params
	 */
	function whizz(node, { from, to }, params) {
		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			css: (t, u) => `transform: translate(${u * dx}px, ${u * dy}px) rotate(${t * 360}deg);`
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

自定义动画函数也可以返回一个 `tick` 函数，它会在动画_期间_被调用，并传入相同的 `t` 和 `u` 参数。

> [!NOTE] 如果可以使用 `css` 而非 `tick`，请优先使用 `css`——网页动画可以在主线程之外运行，从而避免较慢设备上的卡顿。

```svelte
<!--- file: App.svelte --->
<script>
	import { cubicOut } from 'svelte/easing';

	/**
	 * @param {HTMLElement} node
	 * @param {{ from: DOMRect; to: DOMRect }} states
	 * @param {any} params
	 */
	function whizz(node, { from, to }, params) {
		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			tick: (t, u) => Object.assign(node.style, { color: t > 0.5 ? 'Pink' : 'Blue' })
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```
