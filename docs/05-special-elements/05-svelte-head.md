---
title: <svelte:head>
---

```svelte
<svelte:head>...</svelte:head>
```

该元素让你可以将元素插入到 `document.head` 中。在服务端渲染期间，`head` 内容会与主 `body` 内容分开暴露。

与 `<svelte:window>`、`<svelte:document>` 和 `<svelte:body>` 一样，该元素只能出现在组件的顶层，绝不能位于某个代码块或元素内部。

```svelte
<svelte:head>
	<title>Hello world!</title>
	<meta name="description" content="This is where the description goes for SEO" />
</svelte:head>
```
