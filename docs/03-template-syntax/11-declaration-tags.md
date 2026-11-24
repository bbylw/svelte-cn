---
title: {let/const ...}
---

声明标签（declaration tags）使用 `const` 或 `let` 在标记内部定义局部变量：

<!-- codeblock:start {"title":"Declaration tags"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let boxes = [{ width: 10, height: 10 }, { width: 15, height: 15 }];
</script>

{#each boxes as box}
	{const area = box.width * box.height}
	{const label = `${box.width} × ${box.height} = ${area}`}

	<p>{label}</p>
{/each}
```
<!-- codeblock:end -->

> [!NOTE] 声明标签自 Svelte 5.56 起可用。

> [!NOTE] [`{@const ...}`](@const) 语法被视为遗留语法——请改用声明标签。

当值需要具有响应性时，可以使用 `$state` 和 `$derived`：

<!-- codeblock:start {"title":"Reactive declaration tags"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let user = $state({ name: 'Svelte' });
	let editing = $state(false);
</script>

<p>Hello {user.name}</p>
<button onclick={() => editing = true}>edit name</button>

{#if editing}
	{let name = $state(user.name)}
	{const greeting = $derived(`Hello ${name}`)}

	<hr>
	<input bind:value={name} />
	<p>{greeting}</p>

	<button onclick={() => {
		user.name = name;
		editing = false;
	}}>save</button>
{/if}
```
<!-- codeblock:end -->

声明标签可以在组件内部的任何位置使用。它们可以引用自身之外声明的值（例如在 `<script>` 标签或 `{#each ...}` 块中），并且对同一个词法作用域内的所有内容都"可见"（即同级元素，以及这些同级元素的子元素）：

<!-- codeblock:start {"title":"Declaration tag scope"} -->
```svelte
<!--- file: App.svelte --->
{const hello = 'hello'}
{hello} <!-- 'hello' -->
<div>
	{const hello = 'hi'}
	{hello} <!-- 'hi' -->
	<div>
		{hello} <!-- 'hi' -->
	</div>
</div>
{hello} <!-- 'hello' -->
```
<!-- codeblock:end -->
