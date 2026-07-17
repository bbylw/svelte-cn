---
title: 响应式的 $: 语句
---

在 runes 模式中，对状态更新的响应通过 [`$derived`]($derived) 和 [`$effect`]($effect) 符文来处理。

在 legacy 模式中，任何顶层语句（即不在代码块或函数内部）都可以通过加上 `$:` [标签](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label) 变为响应式。这些语句在 `<script>` 中的其他代码之后、组件标记渲染之前运行，之后只要它们所依赖的值发生变化就会再次运行。

```svelte
<script>
	let a = 1;
	let b = 2;

	// 这是一个"响应式语句"，当 `a`、`b` 或 `sum` 改变时
	// 它会重新运行
	$: console.log(`${a} + ${b} = ${sum}`);

	// 这是一个"响应式赋值"——当 `a` 或 `b` 改变时
	// `sum` 会被重新计算。无需单独声明 `sum`
	$: sum = a + b;
</script>
```

语句会按照它们的依赖关系和赋值进行 _拓扑_ 排序：由于 `console.log` 语句依赖于 `sum`，即使 `sum` 在源码中出现得更晚，也会先计算它。

可以将多条语句放进一个代码块中合并：

```js
// @noErrors
$: {
	// 当 `items` 改变时重新计算 `total`
	total = 0;

	for (const item of items) {
		total += item.value;
	}
}
```

响应式赋值的左侧可以是一个标识符，也可以是一个解构赋值：

```js
// @noErrors
$: ({ larry, moe, curly } = stooges);
```

## 理解依赖

`$:` 语句的依赖关系是在编译时确定的——即那些在语句内部被引用（而非被赋值）的变量。

换句话说，像下面这样的语句在 `count` 改变时 _不会_ 重新运行，因为编译器无法"看见"这个依赖：

```js
// @noErrors
let count = 0;
let double = () => count * 2;

$: doubled = double();
```

类似地，如果依赖被间接引用，拓扑排序会失败：`z` 永远不会更新，因为在更新发生时 `y` 不被视为"脏的"。将 `$: z = y` 移到 `$: setY(x)` 下方可以修复这个问题：

```svelte
<script>
	let x = 0;
	let y = 0;

	$: z = y;
	$: setY(x);

	function setY(value) {
		y = value;
	}
</script>
```

## 仅浏览器的代码

响应式语句在服务器端渲染期间和浏览器中都会运行。这意味着任何只应在浏览器中运行的代码都必须包裹在一个 `if` 块中：

```js
// @noErrors
$: if (browser) {
	document.title = title;
}
```
