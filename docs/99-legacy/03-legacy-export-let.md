---
title: export let
---

在 runes 模式中，[组件 props](basic-markup#Component-props) 通过 [`$props`]($props) 符文声明，允许父组件传入数据。

在 legacy 模式中，props 用 `export` 关键字标记，并且可以有默认值：

```svelte
<script>
	export let foo;
	export let bar = 'default value';

	// 作为 props 传入的值
	// 立即可用
	console.log({ foo });
</script>
```

如果组件被创建时它会是 `undefined`，则会使用默认值。

> [!NOTE] 与 runes 模式不同，如果父组件将一个 prop 从有定义的值改为 `undefined`，它不会回退到初始值。

没有默认值的 props 被视为 _必需_，如果没有提供值，Svelte 会在开发时打印一条警告，你可以通过将默认值指定为 `undefined` 来消除它：

```js
export let foo +++= undefined;+++
```

## 组件导出

被导出的 `const`、`class` 或 `function` 声明 _不_ 被视为 prop——相反，它成为组件 API 的一部分：

```svelte
<!--- file: Greeter.svelte--->
<script>
	export function greet(name) {
		alert(`hello ${name}!`);
	}
</script>
```

```svelte
<!--- file: App.svelte --->
<script>
	import Greeter from './Greeter.svelte';

	let greeter;
</script>

<Greeter bind:this={greeter} />

<button on:click={() => greeter.greet('world')}>
	greet
</button>
```

## 重命名 props

`export` 关键字可以独立于声明出现。这在重命名 props 时很有用，例如遇到保留字的情况：

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {string} */
	let className;

	// 创建一个 `class` 属性，尽管
	// 它是一个保留字
	export { className as class };
</script>
```
