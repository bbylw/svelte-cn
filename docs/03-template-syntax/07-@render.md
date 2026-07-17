---
title: {@render ...}
---

要渲染一个[代码片段](snippet)，请使用 `{@render ...}` 标签。

```svelte
{#snippet sum(a, b)}
	<p>{a} + {b} = {a + b}</p>
{/snippet}

{@render sum(1, 2)}
{@render sum(3, 4)}
{@render sum(5, 6)}
```

表达式可以是一个像 `sum` 这样的标识符，也可以是任意的 JavaScript 表达式：

```svelte
{@render (cool ? coolSnippet : lameSnippet)()}
```

## 可选的代码片段

如果代码片段可能未定义——例如，因为它是一个传入的 prop——那么你可以使用可选链，只在它_被_定义时才渲染它：

```svelte
{@render children?.()}
```

或者，也可以使用带 `:else` 子句的 [`{#if ...}`](if) 块来渲染回退内容：

```svelte
{#if children}
	{@render children()}
{:else}
	<p>fallback content</p>
{/if}
```
