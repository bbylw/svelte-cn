---
title: $$slots
---

在 runes 模式中，我们能知道有哪些 [代码片段（snippets）](snippet) 被提供给了组件，因为它们就是普通的 props。

在 legacy 模式中，要知道某个插槽是否被提供了内容，需要使用 `$$slots` 对象，它的键是由父组件传入组件的各个插槽的名称。

```svelte
<!--- file: Card.svelte --->
<div>
	<slot name="title" />
	{#if $$slots.description}
		<!-- 只有当提供了 `slot="description"` 时，这个 <hr> 和插槽才会渲染。 -->
		<hr />
		<slot name="description" />
	{/if}
</div>
```

```svelte
<!--- file: App.svelte --->
<Card>
	<h1 slot="title">Blog Post Title</h1>
	<!-- 没有提供名为 "description" 的插槽，因此这个可选插槽不会被渲染。 -->
</Card>
```
