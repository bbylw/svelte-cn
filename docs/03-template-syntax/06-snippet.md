---
title: {#snippet ...}
---

```svelte
<!--- copy: false  --->
{#snippet name()}...{/snippet}
```

```svelte
<!--- copy: false  --->
{#snippet name(param1, param2, paramN)}...{/snippet}
```

代码片段（snippets）与[渲染标签](@render)是一种在组件内部创建可复用标记片段的方式。与其编写像[这样](/playground/untitled#H4sIAAAAAAAAE5VUYW-kIBD9K8Tmsm2yXXRzvQ-s3eR-R-0HqqOQKhAZb9sz_vdDkV1t000vRmHewMx7w2AflbIGG7GnPlK8gYhFv42JthG-m9Gwf6BGcLbVXZuPSGrzVho8ZirDGpDIhldgySN5GpEMez9kaNuckY1ANJZRamRuu2ZnhEZt6a84pvs43mzD4pMsUDDi8DMkQFYCGdkvsJwblFq5uCik9bmJ4JZwUkv1eoknWigX2eGNN6aGXa6bjV8ybP-X7sM36T58SVcrIIV2xVIaA41xeD5kKqWXuqpUJEefOqVuOkL9DfBchGrzWfu0vb-RpTd3o-zBR045Ga3HfuE5BmJpKauuhbPtENlUF2sqR9jqpsPSxWsMrlngyj3VJiyYjJXb1-lMa7IWC-iSk2M5Zzh-SJjShe-siq5kpZRPs55BbSGU5YPyte4vVV_VfFXxVb10dSLf17pS2lM5HnpPxw4Zpv6x-F57p0jI3OKlVnhv5V9wPQrNYQQ9D_f6aGHlC89fq1Z3qmDkJCTCweOGF4VUFSPJvD_DhreVdA0eu8ehJJ5x91dBaBkpWm3ureCFPt3uzRv56d4kdp-2euG38XZ6dsnd3ZmPG9yRBCrzRUvi-MccOdwz3qE-fOZ7AwAhlrtTUx3c76vRhSwlFBHDtoPhefgHX3dM0PkEAAA=)的重复代码……

```svelte
{#each images as image}
	{#if image.href}
		<a href={image.href}>
			<figure>
				<img src={image.src} alt={image.caption} width={image.width} height={image.height} />
				<figcaption>{image.caption}</figcaption>
			</figure>
		</a>
	{:else}
		<figure>
			<img src={image.src} alt={image.caption} width={image.width} height={image.height} />
			<figcaption>{image.caption}</figcaption>
		</figure>
	{/if}
{/each}
```

……你可以编写[像这样](/playground/untitled#H4sIAAAAAAAAE5VUYW-bMBD9KxbRlERKY4jWfSA02n5H6QcXDmwVbMs-lnaI_z6D7TTt1moTAnPvzvfenQ_GpBEd2CS_HxPJekjy5IfWyS7BFz0b9id0CM62ajDVjBS2MkLjqZQldoBE9KwFS-7I_YyUOPqlRGuqnKw5orY5pVpUduj3mitUln5LU3pI0_UuBp9FjTwnDr9AHETLMSeHK6xiGoWSLi9yYT034cwSRjohn17zcQPNFTs8s153sK9Uv_Yh0-5_5d7-o9zbD-UqCaRWrllSYZQxLw_HUhb0ta-y4NnJUxfUvc7QuLJSaO0a3oh2MLBZat8u-wsPnXzKQvTtVVF34xK5d69ThFmHEQ4SpzeVRediTG8rjD5vBSeN3E5JyHh6R1DQK9-iml5kjzQUN_lSgVU8DhYLx7wwjSvRkMDvTjiwF4zM1kXZ7DlF1eN3A7IG85e-zRrYEjjm0FkI4Cc7Ripm0pHOChexhcWXzreeZyRMU6Mk3ljxC9w4QH-cQZ_b3T5pjHxk1VNr1CDrnJy5QDh6XLO6FrLNSRb2l9gz0wo3S6m7HErSgLsPGMHkpDZK31jOanXeHPQz-eruLHUP0z6yTbpbrn223V70uMXNSpQSZjpL0y8hcxxpNqA6_ql3BQAxlxvfpQ_uT9GrWjQC6iRHM8D0MP0GQsIi92QEAAA=)的代码：

```svelte
{#snippet figure(image)}
	<figure>
		<img src={image.src} alt={image.caption} width={image.width} height={image.height} />
		<figcaption>{image.caption}</figcaption>
	</figure>
{/snippet}

{#each images as image}
	{#if image.href}
		<a href={image.href}>
			{@render figure(image)}
		</a>
	{:else}
		{@render figure(image)}
	{/if}
{/each}
```

与函数声明一样，代码片段可以拥有任意数量的参数，参数可以有默认值，你也可以对每个参数进行解构。不过，你不能使用剩余参数。

## 代码片段作用域

代码片段可以声明在组件内部的任何位置。它们可以引用自身之外声明的值，例如 `<script>` 标签内或 `{#each ...}` 块中的值……

<!-- codeblock:start {"title":"Snippets"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let { message = `it's great to see you!` } = $props();
</script>

{#snippet hello(name)}
	<p>hello {name}! {message}!</p>
{/snippet}

{@render hello('alice')}
{@render hello('bob')}
```
<!-- codeblock:end -->

……并且它们对同一个词法作用域内的所有内容都"可见"（即同级元素，以及这些同级元素的子元素）：

```svelte
<div>
	{#snippet x()}
		{#snippet y()}...{/snippet}

		<!-- this is fine -->
		{@render y()}
	{/snippet}

	<!-- this will error, as `y` is not in scope -->
	{@render y()}
</div>

<!-- this will also error, as `x` is not in scope -->
{@render x()}
```

代码片段可以引用自身以及彼此：

<!-- codeblock:start {"title":"Self-referencing snippets"} -->
```svelte
<!--- file: App.svelte --->
{#snippet blastoff()}
	<span>🚀</span>
{/snippet}

{#snippet countdown(n)}
	{#if n > 0}
		<span>{n}...</span>
		{@render countdown(n - 1)}
	{:else}
		{@render blastoff()}
	{/if}
{/snippet}

{@render countdown(10)}
```
<!-- codeblock:end -->

## 将代码片段传递给组件 {#passing-snippets-to-components}

### 显式 props

在模板中，代码片段与其他任何值一样，都是值。因此，它们可以像 props 一样传递给组件：

<!-- codeblock:start {"title":"Explicit snippet props"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Table from './Table.svelte';

	const fruits = [
		{ name: 'apples', qty: 5, price: 2 },
		{ name: 'bananas', qty: 10, price: 1 },
		{ name: 'cherries', qty: 20, price: 0.5 }
	];
</script>

{#snippet header()}
	<th>fruit</th>
	<th>qty</th>
	<th>price</th>
	<th>total</th>
{/snippet}

{#snippet row(d)}
	<td>{d.name}</td>
	<td>{d.qty}</td>
	<td>{d.price}</td>
	<td>{d.qty * d.price}</td>
{/snippet}

<Table data={fruits} +++{header} {row}+++ />
```

```svelte
<!--- file: Table.svelte --->
<script>
	let { data, header, row } = $props();
</script>

<table>
	{#if header}
		<thead>
			<tr>{@render header()}</tr>
		</thead>
	{/if}

	<tbody>
		{#each data as d}
			<tr>{@render row(d)}</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		text-align: left;
		border-spacing: 0;
	}

	tbody tr:nth-child(2n+1) {
		background: ButtonFace;
	}

	table :global(th), table :global(td) {
		padding: 0.5em;
	}
</style>
```
<!-- codeblock:end -->

可以把它理解为：向组件传递的是内容，而不是数据。这个概念类似于 Web Components 中的插槽（slots）。

### 隐式 props

作为一种编写便利，直接声明在组件_内部_的代码片段会隐式成为该组件上的 props：

<!-- codeblock:start {"title":"Implicit snippet props"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Table from './Table.svelte';

	const fruits = [
		{ name: 'apples', qty: 5, price: 2 },
		{ name: 'bananas', qty: 10, price: 1 },
		{ name: 'cherries', qty: 20, price: 0.5 }
	];
</script>

<Table data={fruits}>
	{#snippet header()}
		<th>fruit</th>
		<th>qty</th>
		<th>price</th>
		<th>total</th>
	{/snippet}

	{#snippet row(d)}
		<td>{d.name}</td>
		<td>{d.qty}</td>
		<td>{d.price}</td>
		<td>{d.qty * d.price}</td>
	{/snippet}
</Table>
```

```svelte
<!--- file: Table.svelte --->
<script>
	let { data, header, row } = $props();
</script>

<table>
	{#if header}
		<thead>
			<tr>{@render header()}</tr>
		</thead>
	{/if}

	<tbody>
		{#each data as d}
			<tr>{@render row(d)}</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		text-align: left;
		border-spacing: 0;
	}

	tbody tr:nth-child(2n+1) {
		background: ButtonFace;
	}

	table :global(th), table :global(td) {
		padding: 0.5em;
	}
</style>
```
<!-- codeblock:end -->

### 隐式 `children` 代码片段

组件标签内部任何_不是_代码片段声明的内容，都会隐式成为 `children` 代码片段的一部分：

<!-- codeblock:start {"title":"Implicit children snippet","selected":"Button.svelte"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Button from './Button.svelte';
</script>

<Button>click me</Button>
```

```svelte
<!--- file: Button.svelte --->
<script>
	let { children } = $props();
</script>

<!-- result will be <button>click me</button> -->
<button>{@render children()}</button>
```
<!-- codeblock:end -->

> [!NOTE] 注意，如果你在组件内部同时有内容，就不能再拥有一个名为 `children` 的 prop——因此，你应该避免使用该名称的 props。

### 可选的代码片段 props

你可以将代码片段 props 声明为可选。你既可以使用可选链，在代码片段未被设置时不渲染任何内容……

```svelte
<script>
    let { children } = $props();
</script>

{@render children?.()}
```

……也可以使用 `#if` 块来渲染回退内容：

```svelte
<script>
    let { children } = $props();
</script>

{#if children}
    {@render children()}
{:else}
    fallback content
{/if}
```

## 为代码片段添加类型 {#typing-snippets}

代码片段实现了从 `'svelte'` 导入的 `Snippet` 接口：

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		data: any[];
		children: Snippet;
		row: Snippet<[any]>;
	}

	let { data, children, row }: Props = $props();
</script>
```

做了这个改动后，如果你尝试在不提供 `data` prop 和 `row` 代码片段的情况下使用该组件，就会出现红色波浪线提示。注意，提供给 `Snippet` 的类型参数是一个元组（tuple），因为代码片段可以有多个参数。

我们可以通过声明一个泛型进一步收紧类型，使 `data` 和 `row` 引用相同的类型：

```svelte
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		data,
		children,
		row
	}: {
		data: T[];
		children: Snippet;
		row: Snippet<[T]>;
	} = $props();
</script>
```

## 导出代码片段

在 `.svelte` 文件顶层声明的代码片段，可以从 `<script module>` 中导出，供其他组件使用，前提是它们没有直接或间接地（通过其他代码片段）引用任何非 module 的 `<script>` 中的声明：

<!-- codeblock:start {"title":"Exported snippets","selected":"snippets.svelte"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import { add } from './snippets.svelte';
</script>

{@render add(1, 2)}

```

```svelte
<!--- file: snippets.svelte --->
<script module>
	export { add };
</script>

{#snippet add(a, b)}
	{a} + {b} = {a + b}
{/snippet}
```
<!-- codeblock:end -->

> [!NOTE]
> 这需要 Svelte 5.5.0 或更高版本

## 编程式代码片段

代码片段可以通过 [`createRawSnippet`](svelte#createRawSnippet) API 以编程方式创建。这是为高级用例准备的。

## 代码片段与插槽

在 Svelte 4 中，内容可以使用[插槽](legacy-slots)传递给组件。代码片段更强大、更灵活，因此在 Svelte 5 中插槽已被弃用。
