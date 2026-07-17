---
title: <svelte:window>
---

```svelte
<svelte:window onevent={handler} />
```

```svelte
<svelte:window bind:prop={value} />
```

`<svelte:window>` 元素让你可以向 `window` 对象添加事件监听器，而无需担心在组件被销毁时移除它们，也无需在服务端渲染时检查 `window` 是否存在。

该元素只能出现在组件的顶层——不能位于某个代码块或元素内部。

```svelte
<script>
	function handleKeydown(event) {
		alert(`pressed the ${event.key} key`);
	}
</script>

<svelte:window onkeydown={handleKeydown} />
```

你也可以绑定到以下属性：

- `innerWidth`
- `innerHeight`
- `outerWidth`
- `outerHeight`
- `scrollX`
- `scrollY`
- `online` — `window.navigator.onLine` 的别名
- `devicePixelRatio`

除 `scrollX` 和 `scrollY` 外，其余均为只读。

```svelte
<svelte:window bind:scrollY={y} />
```

> [!NOTE] 注意，页面不会被滚动到初始值，以避免无障碍问题。只有随后对 `scrollX` 和 `scrollY` 绑定变量的更改才会引起滚动。如果你确实需要在组件渲染时进行滚动，请在 `$effect` 中调用 `scrollTo()`。
