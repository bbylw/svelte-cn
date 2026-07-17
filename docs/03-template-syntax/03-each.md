---
title: {#each ...}
tags: template-each
---

```svelte
<!--- copy: false  --->
{#each expression as name}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name, index}...{/each}
```

遍历值可以使用 each 块完成。所讨论的值可以是数组、类数组对象（即任何带有 `length` 属性的对象），或是像 `Map` 和 `Set` 这样的可迭代对象。（在内部，它们会通过 [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) 被转换为数组。）

如果值为 `null` 或 `undefined`，则会被当作空数组处理（在适用的情况下，这会导致[else 块](#Else-blocks)被渲染）。

```svelte
<h1>Shopping list</h1>
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>
```

each 块还可以指定一个_索引_，相当于 `array.map(...)` 回调中的第二个参数：

```svelte
{#each items as item, i}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

## 带 key 的 each 块 {#keyed-each-blocks}

```svelte
<!--- copy: false  --->
{#each expression as name (key)}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression as name, index (key)}...{/each}
```

如果提供了_键_表达式——它必须能唯一标识列表中的每一项——Svelte 就会利用它，在数据变化时通过插入、移动和删除条目来智能地更新列表，而不是在末尾添加或删除条目、并修改中间的状态。

键可以是任意对象，但推荐使用字符串和数字，因为当对象本身发生变化时，这样能保持身份的连续性。

```svelte
{#each items as item (item.id)}
	<li>{item.name} x {item.qty}</li>
{/each}

<!-- or with additional index value -->
{#each items as item, i (item.id)}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

你可以在 each 块中自由使用解构与剩余模式。

```svelte
{#each items as { id, name, qty }, i (id)}
	<li>{i + 1}: {name} x {qty}</li>
{/each}

{#each objects as { id, ...rest }}
	<li><span>{id}</span><MyComponent {...rest} /></li>
{/each}

{#each items as [id, ...rest]}
	<li><span>{id}</span><MyComponent values={rest} /></li>
{/each}
```

## 不带条目的 each 块

```svelte
<!--- copy: false  --->
{#each expression}...{/each}
```

```svelte
<!--- copy: false  --->
{#each expression, index}...{/each}
```

如果你只是想把某个内容渲染 `n` 次，可以省略 `as` 部分：

<!-- codeblock:start {"title":"Chess board"} -->
```svelte
<!--- file: App.svelte --->
<div class="chess-board">
	{#each { length: 8 }, rank}
		{#each { length: 8 }, file}
			<div class:black={(rank + file) % 2 === 1}></div>
		{/each}
	{/each}
</div>

<style>
	.chess-board {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		grid-template-rows: repeat(8, 1fr);
		border: 1px solid black;
		aspect-ratio: 1;

		.black {
			background: black;
		}
	}
</style>
```
<!-- codeblock:end -->

## Else 块 {#Else-blocks}

```svelte
<!--- copy: false  --->
{#each expression as name}...{:else}...{/each}
```

each 块还可以带有一个 `{:else}` 子句，当列表为空时会被渲染。

```svelte
{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>No tasks today!</p>
{/each}
```
