---
title: {@const ...}
---

> [!NOTE] `{@const x = y}` 是遗留语法——请改用 [`{const x = $derived(y)}`](declaration-tags)

`{@const ...}` 标签用于定义一个局部常量。

```svelte
{#each boxes as box}
	{@const area = box.width * box.height}
	{box.width} * {box.height} = {area}
{/each}
```

`{@const}` 只允许作为代码块——`{#if ...}`、`{#each ...}`、`{#snippet ...}` 等等——或 `<Component />`、`<svelte:boundary>` 的直接子元素。
