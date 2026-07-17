---
title: $props
tags: rune-props
---

组件的输入被称为 _props_（即 properties 的缩写）。向组件传递 props 的方式，与向元素传递属性的方式完全一样：

```svelte
<!--- file: App.svelte --->
<script>
	import MyComponent from './MyComponent.svelte';
</script>

<MyComponent adjective="cool" />
```

而在另一侧的 `MyComponent.svelte` 内部，我们可以通过 `$props` 符文来接收 props……

```svelte
<!--- file: MyComponent.svelte --->
<script>
	let props = $props();
</script>

<p>this component is {props.adjective}</p>
```

……不过更常见的做法是[_解构_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)你的 props：

```svelte
<!--- file: MyComponent.svelte --->
<script>
	let +++{ adjective }+++ = $props();
</script>

<p>this component is {+++adjective+++}</p>
```

## 回退值

解构允许我们声明回退值（fallback value），当父组件没有设置某个 prop（或值为 `undefined`）时会使用它：

```js
let { adjective = 'happy' } = $props();
```

> [!NOTE] 回退值不会被转换成响应式状态代理（详见[更新 props](#Updating-props)）

## 重命名 props

我们也可以使用解构赋值来重命名 props，当它们是无效标识符或是像 `super` 这样的 JavaScript 关键字时，就必须这么做：

```js
let { super: trouper = 'lights are gonna find me' } = $props();
```

## 剩余 props

最后，我们还可以使用_剩余属性_来获取其余的 props：

```js
let { a, b, c, ...others } = $props();
```

## 更新 props {#Updating-props}

组件内对某个 prop 的引用，会随该 prop 自身的更新而更新——当 `count` 在 `App.svelte` 中发生变化时，它在 `Child.svelte` 内部也会随之变化。不过，子组件可以临时覆盖该 prop 的值，这在处理尚未保存的临时状态时很有用：

<!-- codeblock:start {"title":"Temporarily updating props","selected":"Child.svelte"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Child from './Child.svelte';

	let count = $state(0);
</script>

<button onclick={() => (count += 1)}>
	clicks (parent): {count}
</button>

<Child {count} />
```

```svelte
<!--- file: Child.svelte --->
<script>
	let { count } = $props();
</script>

<button onclick={() => (count += 1)}>
	clicks (child): {count}
</button>
```
<!-- codeblock:end -->

尽管你可以临时_重新赋值_ props，但不应_修改_ props，除非它们是[可绑定的]($bindable)。

如果 prop 是一个普通对象，修改它不会产生任何效果：

<!-- codeblock:start {"title":"Non-reactive props","selected":"Child.svelte"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Child from './Child.svelte';
</script>

<Child object={{ count: 0 }} />
```

```svelte
<!--- file: Child.svelte --->
<script>
	let { object } = $props();
</script>

<button onclick={() => {
	// has no effect
	object.count += 1
}}>
	clicks: {object.count}
</button>
```
<!-- codeblock:end -->

然而，如果 prop 是一个响应式状态代理，那么修改_确实_会产生效果，但你会看到一个 [`ownership_invalid_mutation`](runtime-warnings#Client-warnings-ownership_invalid_mutation) 警告，因为该组件正在修改并不"属于"它的状态：

<!-- codeblock:start {"title":"Invalid mutation","selected":"Child.svelte"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Child from './Child.svelte';

	let object = $state({count: 0});
</script>

<Child {object} />
```

```svelte
<!--- file: Child.svelte --->
<script>
	let { object } = $props();
</script>

<button onclick={() => {
	// will cause the count below to update,
	// but with a warning. Don't mutate
	// objects you don't own!
	object.count += 1
}}>
	clicks: {object.count}
</button>
```
<!-- codeblock:end -->

未使用 `$bindable` 声明的 prop，其回退值会原样保留——它不会被转换成响应式状态代理——这意味着修改它不会引起更新：

<!-- codeblock:start {"title":"Non-reactive fallback props","selected":"Child.svelte"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Child from './Child.svelte';
</script>

<Child />
```

```svelte
<!--- file: Child.svelte --->
<script>
	let { object = { count: 0 } } = $props();
</script>

<button onclick={() => {
	// has no effect if the fallback value is used
	object.count += 1
}}>
	clicks: {object.count}
</button>
```
<!-- codeblock:end -->

总结：不要修改 props。要么使用回调 props 来传递变更，要么——如果父子组件应当共享同一个对象——使用 [`$bindable`]($bindable) 符文。

## 类型安全

你可以通过为 props 添加类型注解来获得类型安全，方式与注解其他任何变量声明一样。在 TypeScript 中看起来像这样……

```svelte
<script lang="ts">
	let { adjective }: { adjective: string } = $props();
</script>
```

……而在 JSDoc 中则可以这样写：

```svelte
<script>
	/** @type {{ adjective: string }} */
	let { adjective } = $props();
</script>
```

当然，你也可以将类型声明与注解分离：

```svelte
<script lang="ts">
	interface Props {
		adjective: string;
	}

	let { adjective }: Props = $props();
</script>
```

> [!NOTE] 原生 DOM 元素的接口由 `svelte/elements` 模块提供（详见[为包装组件添加类型](typescript#Typing-wrapper-components)）

如果你的组件暴露了像 `children` 这样的[代码片段](snippet) props，应当使用从 `'svelte'` 导入的 `Snippet` 接口来为其标注类型——示例见[为代码片段添加类型](snippet#Typing-snippets)。

建议添加类型，这样使用你组件的人就能轻松了解应当提供哪些 props。

## `$props.id()`

这个在 5.20.0 版本新增的符文，会生成一个对当前组件实例唯一的 ID。在对服务端渲染的组件进行 hydration 时，该值在客户端与服务端之间保持一致。

这在通过 `for`、`aria-labelledby` 等属性关联元素时非常有用。

```svelte
<script>
	const uid = $props.id();
</script>

<form>
	<label for="{uid}-firstname">First Name: </label>
	<input id="{uid}-firstname" type="text" />

	<label for="{uid}-lastname">Last Name: </label>
	<input id="{uid}-lastname" type="text" />
</form>
```
