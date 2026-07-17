---
title: $derived
tags: rune-derived
---

派生状态（Derived state）使用 `$derived` rune 声明：

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

`$derived(...)` 中的表达式应当没有副作用。Svelte 会禁止在派生表达式中改变状态（例如 `count++`）。

与 `$state` 一样，你可以将类字段标记为 `$derived`。

> [!NOTE] Svelte 组件中的代码只会在创建时执行一次。如果没有 `$derived` rune，`doubled` 即使 `count` 变化也会始终保持初始值。

## `$derived.by`

有时你需要创建无法塞进一个简短表达式的复杂派生。在这种情况下，可以使用 `$derived.by`，它接受一个函数作为参数。

```svelte
<script>
	let numbers = $state([1, 2, 3]);
	let total = $derived.by(() => {
		let total = 0;
		for (const n of numbers) {
			total += n;
		}
		return total;
	});
</script>

<button onclick={() => numbers.push(numbers.length + 1)}>
	{numbers.join(' + ')} = {total}
</button>
```

本质上，`$derived(expression)` 等价于 `$derived.by(() => expression)`。

## 理解依赖关系

在 `$derived` 表达式（或 `$derived.by` 函数体）中_同步_读取的任何内容，都会被视为派生状态的_依赖_。当状态发生变化时，派生会被标记为_脏（dirty）_，并在下次被读取时重新计算。

此外，如果表达式中包含 [`await`](await-expressions)，Svelte 会对其进行转换，使得 `await` _之后_的任何状态也会被追踪——换句话说，在下面这样的情况中……

```js
let a = Promise.resolve(1);
let b = 2;
// ---cut---
let total = $derived(await a + b);
```

……即使 `b` 只在 `a` resolve 之后（即初次执行之后）才被读取，它和 `a` 都会被追踪。（这不适用于表达式所调用的函数中的 `await`，只适用于表达式本身。）

如果想让某部分状态不被当作依赖，可以使用 [`untrack`](svelte#untrack)。

## 覆盖派生值 {#overriding-derived-values}

派生表达式会在依赖变化时重新计算，但你可以通过重新赋值来_临时覆盖_它们的值（除非它们是用 `const` 声明的）。这对于_乐观 UI（optimistic UI）_ 之类的场景很有用——某个值派生自"事实来源"（例如来自服务器的数据），但你希望立即向用户展示反馈：

```svelte
<script>
	let { post, like } = $props();

	let likes = $derived(post.likes);

	async function onclick() {
		// 立即增加 `likes` 计数……
		likes += 1;

		// 并通知服务器，它最终会更新 `post`
		try {
			await like();
		} catch {
			// 失败了！回滚修改
			likes -= 1;
		}
	}
</script>

<button {onclick}>🧡 {likes}</button>
```

> [!NOTE] 在 Svelte 5.25 之前，派生值是只读的。

## 派生与响应性

与 `$state` 不同（它会将对象和数组转换为[深度响应式的代理]($state#Deep-state)），`$derived` 的值会保持原样。例如，[在下面这种情况中](/playground/untitled#H4sIAAAAAAAAE4VU22rjMBD9lUHd3aaQi9PdstS1A3t5XvpQ2Ic4D7I1iUUV2UjjNMX431eS7TRdSosxgjMzZ45mjt0yzffIYibvy0ojFJWqDKCQVBk2ZVup0LJ43TJ6rn2aBxw-FP2o67k9oCKP5dziW3hRaUJNjoYltjCyplWmM1JIIAn3FlL4ZIkTTtYez6jtj4w8WwyXv9GiIXiQxLVs9pfTMR7EuoSLIuLFbX7Z4930bZo_nBrD1bs834tlfvsBz9_SyX6PZXu9XaL4gOWn4sXjeyzftv4ZWfyxubpzxzg6LfD4MrooxELEosKCUPigQCMPKCZh0OtQE1iSxcsmdHuBvCiHZXALLXiN08EL3RRkaJ_kDVGle0HcSD5TPEeVtj67O4Nrg9aiSNtBY5oODJkrL5QsHtN2cgXp6nSJMWzpWWGasdlsGEMbzi5jPr5KFr0Ep7pdeM2-TCelCddIhDxAobi1jqF3cMaC1RKp64bAW9iFAmXGIHfd4wNXDabtOLN53w8W53VvJoZLh7xk4Rr3CoL-UNoLhWHrT1JQGcM17u96oES5K-kc2XOzkzqGCKL5De79OUTyyrg1zgwXsrEx3ESfx4Bz0M5UjVMHB24mw9SuXtXFoN13fYKOM1tyUT3FbvbWmSWCZX2Er-41u5xPoml45svRahl9Wb9aasbINJixDZwcPTbyTLZSUsAvrg_cPuCR7s782_WU8343Y72Qtlb8OYatwuOQvuN13M_hJKNfxann1v1U_B1KZ_D_mzhzhz24fw85CSz2irtN9w9HshBK7AQAAA==)……

```js
// @errors: 7005
let items = $state([ /*...*/ ]);

let index = $state(0);
let selected = $derived(items[index]);
```

……你可以修改（或 `bind:` 到）`selected` 的属性，它会影响到底层的 `items` 数组。如果 `items` 不是深度响应式的，修改 `selected` 就不会有任何效果。

## 解构

如果你在 `$derived` 声明中使用解构，得到的变量都将是响应式的——下面这样写……

```js
function stuff() { return { a: 1, b: 2, c: 3 } }
// ---cut---
let { a, b, c } = $derived(stuff());
```

……大致等价于：

```js
function stuff() { return { a: 1, b: 2, c: 3 } }
// ---cut---
let _stuff = $derived(stuff());
let a = $derived(_stuff.a);
let b = $derived(_stuff.b);
let c = $derived(_stuff.c);
```

## 更新传播

Svelte 使用了一种称为_推拉式响应性（push-pull reactivity）_的机制——当状态更新时，所有依赖该状态的内容（无论直接还是间接）都会立即收到变更通知（"推"），但派生值会直到真正被读取时才重新计算（"拉"）。

如果派生的新值与其之前的值在引用上完全相同，下游更新会被跳过。换句话说，即使 `large` 依赖于 `count`，Svelte 也只会在 `large` 变化时更新按钮内的文本，而不会在 `count` 变化时更新：

```svelte
<script>
	let count = $state(0);
	let large = $derived(count > 10);
</script>

<button onclick={() => count++}>
	{large}
</button>
```
