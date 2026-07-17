---
title: 概述
---

Svelte 是一个用于构建 Web 用户界面的框架。它使用编译器，将用 HTML、CSS 和 JavaScript 编写的声明式组件……

```svelte
<!--- file: App.svelte --->
<script>
	function greet() {
		alert('Welcome to Svelte!');
	}
</script>

<button onclick={greet}>click me</button>

<style>
	button {
		font-size: 2em;
	}
</style>
```

……编译为精简、高度优化的 JavaScript。

你可以用它构建 Web 上的任何东西，从独立的组件，到雄心勃勃的全栈应用（使用 Svelte 的姊妹应用框架 [SvelteKit](../kit)），以及介于两者之间的各种项目。

本页内容属于参考文档。如果你刚接触 Svelte，建议先从[交互式教程](/tutorial)开始，遇到问题时再回来查阅。

你也可以在[在线演练场](/playground)中试用 Svelte；如果需要功能更完整的开发环境，还可以前往 [StackBlitz](https://sveltekit.new)。
