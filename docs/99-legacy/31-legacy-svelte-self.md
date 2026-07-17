---
title: <svelte:self>
---

`<svelte:self>` 元素允许一个组件递归地包含它自身。

它不能出现在标记的最顶层；它必须位于 if 或 each 块内部，或者传给某个组件的插槽，以防止无限循环。

```svelte
<script>
	export let count;
</script>

{#if count > 0}
	<p>counting down... {count}</p>
	<svelte:self count={count - 1} />
{:else}
	<p>lift-off!</p>
{/if}
```

> [!NOTE]
> 这一概念已过时，因为组件可以导入自身：
> ```svelte
> <!--- file: App.svelte --->
> <script>
> 	import Self from './App.svelte'
> 	export let count;
> </script>
>
> {#if count > 0}
> 	<p>counting down... {count}</p>
> 	<Self count={count - 1} />
> {:else}
> 	<p>lift-off!</p>
> {/if}
> ```
