---
title: 响应式的 let/var 声明
---

在 runes 模式中，响应式状态通过 [`$state` 符文]($state) 显式声明。

在 legacy 模式中，在组件顶层声明的变量会被自动视为 _响应式_。对这些变量重新赋值或就地修改（`count += 1` 或 `object.x = y`）都会导致 UI 更新。

```svelte
<script>
	let count = 0;
</script>

<button on:click={() => count += 1}>
	clicks: {count}
</button>
```

由于 Svelte 的 legacy 模式响应式基于 _赋值_，使用像 `.push()` 和 `.splice()` 这样的数组方法不会自动触发更新。需要随后进行一次赋值，以"告知"编译器更新 UI：

```svelte
<script>
	let numbers = [1, 2, 3, 4];

	function addNumber() {
		// 这个方法的调用不会触发更新
		numbers.push(numbers.length + 1);

		// 这个赋值会更新任何
		// 依赖于 `numbers` 的内容
		numbers = numbers;
	}
</script>
```
