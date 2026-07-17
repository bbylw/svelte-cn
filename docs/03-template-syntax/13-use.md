---
title: use:
---

> [!NOTE]
> 在 Svelte 5.29 及更高版本中，建议改用[附件](@attach)，因为它们更灵活、更具组合性。

actions 是在元素被挂载时调用的函数。它们通过 `use:` 指令添加，并且通常会使用一个 `$effect`，以便在元素被卸载时能够清理任何状态：

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/action').Action} */
	function myaction(node) {
		// the node has been mounted in the DOM

		$effect(() => {
			// setup goes here

			return () => {
				// teardown goes here
			};
		});
	}
</script>

<div use:myaction>...</div>
```

一个 action 可以带参数调用：

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/action').Action} */
	function myaction(node, +++data+++) {
		// ...
	}
</script>

<div use:myaction={+++data+++}>...</div>
```

action 只会被调用一次（但在服务端渲染期间不会调用）——如果参数发生变化，它_不会_再次运行。

> [!LEGACY]
> 在 `$effect` 符文出现之前，actions 可以返回一个带有 `update` 和 `destroy` 方法的对象，其中 `update` 会在参数的值发生变化时被调用（传入最新值）。现在更推荐使用 effects。

## 类型

`Action` 接口接收三个可选的类型参数——节点类型（如果 action 适用于所有元素，则可以是 `Element`）、参数，以及由 action 创建的任何自定义事件处理器：

```svelte
<!--- file: App.svelte --->
<script>
	/**
	 * @type {import('svelte/action').Action<
	 * 	HTMLDivElement,
	 * 	undefined,
	 * 	{
	 * 		onswiperight: (e: CustomEvent) => void;
	 * 		onswipeleft: (e: CustomEvent) => void;
	 * 		// ...
	 * 	}
	 * >}
	 */
	function gestures(node) {
		$effect(() => {
			// ...
			node.dispatchEvent(new CustomEvent('swipeleft'));

			// ...
			node.dispatchEvent(new CustomEvent('swiperight'));
		});
	}
</script>

<div
	use:gestures
	onswipeleft={next}
	onswiperight={prev}
>...</div>
```
