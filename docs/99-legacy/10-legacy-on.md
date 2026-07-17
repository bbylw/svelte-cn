---
title: on:
---

在 runes 模式中，事件处理函数与任何其他属性或 prop 无异。

在 legacy 模式中，我们使用 `on:` 指令：

```svelte
<!--- file: App.svelte --->
<script>
	let count = 0;

	/** @param {MouseEvent} event */
	function handleClick(event) {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	count: {count}
</button>
```

处理函数可以内联声明，且没有任何性能损耗：

```svelte
<button on:click={() => (count += 1)}>
	count: {count}
</button>
```

通过 `|` 字符为元素事件处理函数添加 _修饰符_。

```svelte
<form on:submit|preventDefault={handleSubmit}>
	<!-- `submit` 事件的默认行为被阻止，
	     因此页面不会重新加载 -->
</form>
```

可用的修饰符如下：

- `preventDefault` — 在运行处理函数之前调用 `event.preventDefault()`
- `stopPropagation` — 调用 `event.stopPropagation()`，阻止事件到达下一个元素
- `stopImmediatePropagation` — 调用 `event.stopImmediatePropagation()`，阻止同一事件的其他监听器被触发
- `passive` — 提升触摸/滚轮事件的滚动性能（在安全的场合 Svelte 会自动添加它）
- `nonpassive` — 显式设置 `passive: false`
- `capture` — 在 _捕获_ 阶段而非 _冒泡_ 阶段触发处理函数
- `once` — 在第一次运行后移除处理函数
- `self` — 仅当 `event.target` 是元素本身时才触发处理函数
- `trusted` — 仅当 `event.isTrusted` 为 `true` 时才触发处理函数，即事件是用户操作触发的

修饰符可以链式组合，例如 `on:click|once|capture={...}`。

如果 `on:` 指令不带值使用，组件会 _转发_ 该事件，意味着组件的使用者可以监听它。

```svelte
<button on:click>
	组件本身会派发 click 事件
</button>
```

可以为同一个事件设置多个事件监听器：

```svelte
<!--- file: App.svelte --->
<script>
	let count = 0;

	function increment() {
		count += 1;
	}

	/** @param {MouseEvent} event */
	function log(event) {
		console.log(event);
	}
</script>

<button on:click={increment} on:click={log}>
	clicks: {count}
</button>
```

## 组件事件

组件可以在初始化时创建一个 _分发器_ 来派发事件：

```svelte
<!--- file: Stepper.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch('decrement')}>decrement</button>
<button on:click={() => dispatch('increment')}>increment</button>
```

`dispatch` 会创建一个 [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)。如果提供了第二个参数，它会成为事件对象的 `detail` 属性。

该组件的使用者可以监听这些被派发的事件：

```svelte
<script>
	import Stepper from './Stepper.svelte';

	let n = 0;
</script>

<Stepper
	on:decrement={() => n -= 1}
	on:increment={() => n += 1}
/>

<p>n: {n}</p>
```

组件事件不会冒泡——父组件只能监听其直接子组件的事件。

除 `once` 外，修饰符对组件事件处理函数无效。

> [!NOTE]
> 如果你计划最终迁移到 Svelte 5，请改用回调 props。由于 `createEventDispatcher` 已被弃用，这样做会让升级更容易：
>
> ```svelte
> <!--- file: Stepper.svelte --->
> <script>
> 	export let decrement;
> 	export let increment;
> </script>
>
> <button on:click={decrement}>decrement</button>
> <button on:click={increment}>increment</button>
> ```
