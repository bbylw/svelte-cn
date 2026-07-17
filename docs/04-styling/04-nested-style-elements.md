---
title: 嵌套的 <style> 元素
---

每个组件只能有一个顶层的 `<style>` 标签。

不过，可以让一个 `<style>` 标签嵌套在其他元素或逻辑块内部。

在这种情况下，`<style>` 标签会原样插入到 DOM 中；不会对该 `<style>` 标签进行任何作用域化或处理。

```svelte
<div>
	<style>
		/* this style tag will be inserted as-is */
		div {
			/* this will apply to all `<div>` elements in the DOM */
			color: red;
		}
	</style>
</div>
```
