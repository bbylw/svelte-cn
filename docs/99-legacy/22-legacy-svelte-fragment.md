---
title: <svelte:fragment>
---

`<svelte:fragment>` 元素让你可以将内容放入一个 [具名插槽](legacy-slots)，而无需用容器 DOM 元素将其包裹起来。这能保持文档流式布局的完整性。

```svelte
<!--- file: Widget.svelte --->
<div>
	<slot name="header">没有提供 header</slot>
	<p>header 与 footer 之间的某些内容</p>
	<slot name="footer" />
</div>
```

```svelte
<!--- file: App.svelte --->
<script>
	import Widget from './Widget.svelte';
</script>

<Widget>
	<h1 slot="header">Hello</h1>
	<svelte:fragment slot="footer">
		<p>All rights reserved.</p>
		<p>Copyright (c) 2019 Svelte Industries</p>
	</svelte:fragment>
</Widget>
```

> [!NOTE]
> 在 Svelte 5+ 中，这一概念已过时，因为 snippets 不会创建包裹元素
