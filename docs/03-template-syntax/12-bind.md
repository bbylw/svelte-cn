---
title: bind:
tags: template-bind
---

数据通常是向下流动，从父组件到子组件。`bind:` 指令允许数据反向流动，从子组件到父组件。

通用语法是 `bind:property={expression}`，其中 `expression` 是一个[_左值_](https://press.rebus.community/programmingfundamentals/chapter/lvalue-and-rvalue/)（即一个变量或对象属性）。当表达式是一个与属性同名的标识符时，我们可以省略表达式——换句话说，下面两者是等价的：

<!-- prettier-ignore -->
```svelte
<input bind:value={value} />
<input bind:value />
```

Svelte 会创建一个事件监听器来更新被绑定的值。如果某个元素已经为同一事件注册了监听器，那么该监听器会在绑定值更新之前触发。

大多数绑定是_双向_的，意味着值的改变会影响元素，反之亦然。少数绑定是_只读_的，意味着改变它们的值不会对元素产生任何效果。

## 函数绑定 {#function-bindings}

你也可以使用 `bind:property={get, set}`，其中 `get` 和 `set` 是函数，让你可以执行校验与转换：

```svelte
<input bind:value={
	() => value,
	(v) => value = v.toLowerCase()}
/>
```

对于像[尺寸绑定](#Dimensions)这样的只读绑定，`get` 的值应该是 `null`：

```svelte
<div
	bind:clientWidth={null, redraw}
	bind:clientHeight={null, redraw}
>...</div>
```

> [!NOTE]
> 函数绑定在 Svelte 5.9.0 及更高版本中可用。

## `<input bind:value>`

`<input>` 元素上的 `bind:value` 指令会绑定输入框的 `value` 属性：

<!-- prettier-ignore -->
```svelte
<script>
	let message = $state('hello');
</script>

<input bind:value={message} />
<p>{message}</p>
```

在数值输入（`type="number"` 或 `type="range"`）的情况下，值会被强制转换为数字：

<!-- codeblock:start {"title":"Numeric bindings"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let a = $state(1);
	let b = $state(2);
</script>

<label>
	<input type="number" bind:value={a} min="0" max="10" />
	<input type="range" bind:value={a} min="0" max="10" />
</label>

<label>
	<input type="number" bind:value={b} min="0" max="10" />
	<input type="range" bind:value={b} min="0" max="10" />
</label>

<p>{a} + {b} = {a + b}</p>
```
<!-- codeblock:end -->

如果输入框为空或无效（对于 `type="number"`），值会是 `undefined`。

自 5.6.0 起，如果 `<input>` 拥有 `defaultValue` 且是表单的一部分，当表单被重置时，它会恢复到该值，而不是空字符串。注意，在初次渲染时，绑定值优先，除非它是 `null` 或 `undefined`。

```svelte
<script>
	let value = $state('');
</script>

<form>
	<input bind:value defaultValue="not the empty string">
	<input type="reset" value="Reset">
</form>
```

> [!NOTE]
> 谨慎使用重置按钮，并确保用户不会在尝试提交表单时误点它们。

## `<input bind:checked>`

复选框输入可以使用 `bind:checked` 来绑定：

```svelte
<label>
	<input type="checkbox" bind:checked={accepted} />
	Accept terms and conditions
</label>
```

自 5.6.0 起，如果 `<input>` 拥有 `defaultChecked` 属性且是表单的一部分，当表单被重置时，它会恢复到该值，而不是 `false`。注意，在初次渲染时，绑定值优先，除非它是 `null` 或 `undefined`。

```svelte
<script>
	let checked = $state(true);
</script>

<form>
	<input type="checkbox" bind:checked defaultChecked={true}>
	<input type="reset" value="Reset">
</form>
```

> [!NOTE] 对单选输入请使用 `bind:group`，而不是 `bind:checked`。

## `<input bind:indeterminate>`

复选框可以处于[不确定（indeterminate）](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/indeterminate)状态，这与它是否被勾选无关：

```svelte
<script>
	let checked = $state(false);
	let indeterminate = $state(true);
</script>

<form>
	<input type="checkbox" bind:checked bind:indeterminate>

	{#if indeterminate}
		waiting...
	{:else if checked}
		checked
	{:else}
		unchecked
	{/if}
</form>
```

## `<input bind:group>`

协同工作的输入可以使用 `bind:group`：

<!-- codeblock:start {"title":"bind:group"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let tortilla = $state('Plain');

	/** @type {string[]} */
	let fillings = $state([]);
</script>

<h1>Customize your burrito</h1>

<!-- grouped radio inputs are mutually exclusive -->
<label><input type="radio" bind:group={tortilla} value="Plain" /> Plain</label>
<label><input type="radio" bind:group={tortilla} value="Whole wheat" /> Whole wheat</label>
<label><input type="radio" bind:group={tortilla} value="Spinach" /> Spinach</label>

<!-- grouped checkbox inputs populate an array -->
<label><input type="checkbox" bind:group={fillings} value="Rice" /> Rice</label>
<label><input type="checkbox" bind:group={fillings} value="Beans" /> Beans</label>
<label><input type="checkbox" bind:group={fillings} value="Cheese" /> Cheese</label>
<label><input type="checkbox" bind:group={fillings} value="Guac (extra)" /> Guac (extra)</label>

<p>Tortilla: {tortilla}</p>
<p>Fillings: {fillings.join(', ') || 'None'}</p>

<style>
	label {
		display: block;
	}
</style>
```
<!-- codeblock:end -->

> [!NOTE] 复选框组的数组由同一个组件实例中被勾选的复选框构建。如果每个复选框都在各自的组件中，勾选其中一个会替换整个数组，而不是向其中添加。单选组可以跨组件工作，只要值是通过 [`$bindable`]($bindable) prop 绑定的。

## `<input bind:files>`

在 `type="file"` 的 `<input>` 元素上，你可以使用 `bind:files` 来获取[所选文件的 `FileList`](https://developer.mozilla.org/en-US/docs/Web/API/FileList)。当你想要以编程方式更新文件时，始终需要使用一个 `FileList` 对象。目前 `FileList` 对象无法直接构造，因此你需要创建一个新的 [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer) 对象，并从中获取 `files`。

```svelte
<script>
	let files = $state();

	function clear() {
		files = new DataTransfer().files; // null or undefined does not work
	}
</script>

<label for="avatar">Upload a picture:</label>
<input accept="image/png, image/jpeg" bind:files id="avatar" name="avatar" type="file" />
<button onclick={clear}>clear</button>
```

`FileList` 对象也无法被修改，因此如果你想（例如）从列表中删除单个文件，就需要创建一个新的 `DataTransfer` 对象，并加入你希望保留的文件。

> [!NOTE] 在服务端 JS 运行时中，`DataTransfer` 可能不可用。如果将绑定到 `files` 的状态保持未初始化，就能在组件进行服务端渲染时避免潜在的错误。

## `<select bind:value>`

`<select>` 的值绑定对应于被选中的 `<option>` 上的 `value` 属性，它可以是任意值（并不像 DOM 中通常那样仅限于字符串）。

```svelte
<select bind:value={selected}>
	<option value={a}>a</option>
	<option value={b}>b</option>
	<option value={c}>c</option>
</select>
```

`<select multiple>` 元素的行为类似于一个复选框组。被绑定的变量是一个数组，其每一项对应于每个被选中的 `<option>` 的 `value` 属性。

```svelte
<select multiple bind:value={fillings}>
	<option value="Rice">Rice</option>
	<option value="Beans">Beans</option>
	<option value="Cheese">Cheese</option>
	<option value="Guac (extra)">Guac (extra)</option>
</select>
```

当 `<option>` 的值与其文本内容相同时，可以省略该属性。

```svelte
<select multiple bind:value={fillings}>
	<option>Rice</option>
	<option>Beans</option>
	<option>Cheese</option>
	<option>Guac (extra)</option>
</select>
```

你可以通过给应当初始被选中的 `<option>`（或在 `<select multiple>` 情况下的多个 `<option>`）添加 `selected` 属性，来为 `<select>` 设置默认值。如果 `<select>` 是表单的一部分，当表单被重置时，它会恢复到该选中项。注意，在初次渲染时，如果绑定值不是 `undefined`，则绑定值优先。

```svelte
<select bind:value={selected}>
	<option value={a}>a</option>
	<option value={b} selected>b</option>
	<option value={c}>c</option>
</select>
```

自 5.57.0 起，如果 `<select>` 拥有 `defaultValue` 且属于某个表单的一部分，那么表单被重置时，它会恢复到该值，而不是空字符串。注意，在初次渲染时，除非绑定值为 `null` 或 `undefined`，否则绑定值优先。

```svelte
<form>
	<select bind:value defaultValue="b">
		<option>a</option>
		<option>b</option>
		<option>c</option>
	</select>
	<input type="reset" value="Reset">
</form>
```

## `<audio>` {#audio}

`<audio>` 元素拥有自己的一组绑定——五个双向的……

- [`currentTime`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime)
- [`playbackRate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate)
- [`paused`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/paused)
- [`volume`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume)
- [`muted`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/muted)

……以及六个只读的：

- [`duration`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/duration)
- [`buffered`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/buffered)
- [`seekable`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seekable)
- [`seeking`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seeking_event)
- [`ended`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended)
- [`readyState`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState)
- [`played`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/played)

```svelte
<audio src={clip} bind:duration bind:currentTime bind:paused></audio>
```

## `<video>`

`<video>` 元素拥有与[`<audio>`](#audio) 元素相同的所有绑定，外加只读的 [`videoWidth`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/videoWidth) 和 [`videoHeight`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/videoHeight) 绑定。

## `<img>`

`<img>` 元素有两个只读绑定：

- [`naturalWidth`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalWidth)
- [`naturalHeight`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/naturalHeight)

## `<details bind:open>`

`<details>` 元素支持绑定到 `open` 属性。

```svelte
<details bind:open={isOpen}>
	<summary>How do you comfort a JavaScript bug?</summary>
	<p>You console it.</p>
</details>
```

## `window` 和 `document`

要绑定到 `window` 和 `document` 的属性，请参阅 [`<svelte:window>`](svelte-window) 和 [`<svelte:document>`](svelte-document)。

## Contenteditable 绑定

带有 `contenteditable` 属性的元素支持以下绑定：

- [`innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
- [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText)
- [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)

> [!NOTE] [`innerText` 与 `textContent` 之间存在细微差异](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#differences_from_innertext)。

<!-- for some reason puts the comment and html on same line -->
<!-- prettier-ignore -->
```svelte
<div contenteditable="true" bind:innerHTML={html}></div>
```

## 尺寸（Dimensions） {#Dimensions}

所有可见元素都拥有以下只读绑定，通过 `ResizeObserver` 测量：

- [`clientWidth`](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth)
- [`clientHeight`](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight)
- [`offsetWidth`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth)
- [`offsetHeight`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight)
- [`contentRect`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/contentRect)
- [`contentBoxSize`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/contentBoxSize)
- [`borderBoxSize`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/borderBoxSize)
- [`devicePixelContentBoxSize`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry/devicePixelContentBoxSize)

```svelte
<div bind:offsetWidth={width} bind:offsetHeight={height}>
	<Chart {width} {height} />
</div>
```

> [!NOTE] `display: inline` 元素没有宽度或高度（带有"固有"尺寸的元素如 `<img>` 和 `<canvas>` 除外），也无法被 `ResizeObserver` 观察。你需要将这些元素的 `display` 样式改为其他值，例如 `inline-block`。注意，CSS 变换不会触发 `ResizeObserver` 的回调。

## bind:this

```svelte
<!--- copy: false --->
bind:this={dom_node}
```

要获取对 DOM 节点的引用，请使用 `bind:this`。在组件被挂载之前，该值会是 `undefined`——换句话说，你应该在 effect 或事件处理器内部读取它，而不是在组件初始化期间：

```svelte
<script>
	/** @type {HTMLCanvasElement} */
	let canvas;

	$effect(() => {
		const ctx = canvas.getContext('2d');
		drawStuff(ctx);
	});
</script>

<canvas bind:this={canvas}></canvas>
```

组件也支持 `bind:this`，让你能够以编程方式与组件实例交互。

```svelte
<!--- file: App.svelte --->
<ShoppingCart bind:this={cart} />

<button onclick={() => cart.empty()}> Empty shopping cart </button>
```

```svelte
<!--- file: ShoppingCart.svelte -->
<script>
	// All instance exports are available on the instance object
	export function empty() {
		// ...
	}
</script>
```

> [!NOTE] 如果使用[函数绑定](#Function-bindings)，getter 是必需的，以确保在组件或元素被销毁时正确的取值被置空。

## 组件的 bind:_property_

```svelte
bind:property={variable}
```

你可以使用与元素相同的语法来绑定组件的 props。

```svelte
<Keypad bind:value={pin} />
```

虽然 Svelte 的 props 无需绑定就是响应式的，但这种响应性默认只向下流入组件。使用 `bind:property` 可以让属性在组件内部的变更反向流出组件。

要将某个属性标记为可绑定，请使用 [`$bindable`]($bindable) 符文：

```svelte
<script>
	let { readonlyProperty, bindableProperty = $bindable() } = $props();
</script>
```

将一个属性声明为可绑定，意味着它_可以_使用 `bind:` 来使用，而不是_必须_使用 `bind:`。

可绑定的属性可以拥有回退值：

```svelte
<script>
	let { bindableProperty = $bindable('fallback value') } = $props();
</script>
```

这个回退值_只_在属性_未被_绑定时生效。当属性被绑定且存在回退值时，父组件应当提供一个非 `undefined` 的值，否则会抛出运行时错误。这能避免难以推理的情况——即不清楚究竟应该应用哪个值。
