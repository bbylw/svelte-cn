---
title: .svelte 文件
---

组件是 Svelte 应用的构建基石。它们被编写在 `.svelte` 文件中，使用的是 HTML 的超集。

`<script>`、`<style>` 和 markup（标记）这三个区块都是可选的。

<!-- prettier-ignore -->
```svelte
/// file: MyComponent.svelte
<script module>
	// 模块级逻辑写在这里
	// （你很少会用到它）
</script>

<script>
	// 实例级逻辑写在这里
</script>

<!-- markup（零个或多个）写在这里 -->

<style>
	/* 样式写在这里 */
</style>
```

## `<script>`

`<script>` 块中包含的 JavaScript（或在添加 `lang="ts"` 属性时的 TypeScript）会在组件实例被创建时运行。在顶层声明（或导入）的变量可以在组件的 markup 中被引用。

除了普通的 JavaScript，你还可以使用 _runes（符文）_ 来声明[组件属性]($props) 并为组件添加响应性。符文将在下一节介绍。

<!-- TODO describe behaviour of `export` -->

## `<script module>`

带有 `module` 属性的 `<script>` 标签会在模块首次求值时运行一次，而不是针对每个组件实例都运行。在该区块中声明的变量可以在组件的其他地方被引用，但反之则不行。

```svelte
<script module>
	let total = 0;
</script>

<script>
	total += 1;
	console.log(`instantiated ${total} times`);
</script>
```

你可以从这个区块 `export`（导出）绑定，它们将成为编译后模块的导出项。你不能 `export default`，因为默认导出本身就是组件本身。

> [!NOTE] 如果你使用 TypeScript，并将这些来自 `module` 区块的导出项导入到某个 `.ts` 文件中，请确保正确配置你的编辑器，让 TypeScript 能够识别它们。我们的 VS Code 扩展和 IntelliJ 插件已经具备这一能力，但在其他情况下，你可能需要配置我们的 [TypeScript 编辑器插件](https://www.npmjs.com/package/typescript-svelte-plugin)。

> [!LEGACY]
> 在 Svelte 4 中，这个 script 标签是通过 `<script context="module">` 创建的。

## `<style>`

`<style>` 块中的 CSS 会被限定作用域到该组件。

```svelte
<style>
	p {
		/* 这只会作用于当前组件中的 <p> 元素 */
		color: burlywood;
	}
</style>
```

更多信息，请前往[样式](scoped-styles)章节。
