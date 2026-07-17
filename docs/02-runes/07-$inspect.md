---
title: $inspect
tags: rune-inspect
---

> [!NOTE] `$inspect` 仅在开发阶段生效。在生产构建中它会变成空操作（noop）。

`$inspect` 符文大致相当于 `console.log`，区别在于它会在参数发生变化时重新执行。`$inspect` 会深度追踪响应式状态，这意味着使用细粒度响应式更新对象或数组中的某个内容时，会触发它再次执行：

<!-- codeblock:start {"title":"$inspect(...)"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let count = $state(0);
	let message = $state('hello');

	$inspect(count, message); // will console.log when `count` or `message` change
</script>

<button onclick={() => count++}>Increment</button>
<input bind:value={message} />
```
<!-- codeblock:end -->

在更新时，还会打印出调用栈，便于定位状态变化的来源（除非你处于 playground 中，由于技术限制无法打印）。

## $inspect(...).with

`$inspect(...)` 返回一个带有 `with` 方法的对象，你可以传入一个回调函数，该函数会代替 `console.log` 被调用。回调的第一个参数是 `"init"` 或 `"update"`，后续参数则是传给 `$inspect` 的值：

<!-- codeblock:start {"title":"$inspect(...).with(...)"} -->
```svelte
<!--- file: App.svelte --->
<script>
	let count = $state(0);

	$inspect(count).with((type, count) => {
		if (type === 'update') {
			debugger; // or `console.trace`, or whatever you want
		}
	});
</script>

<button onclick={() => count++}>Increment</button>
```
<!-- codeblock:end -->

## $inspect.trace(...)

这个在 5.14 版本新增的符文，会在开发阶段对所在的整个函数进行_追踪_。每当该函数作为[effect]($effect) 或[derived]($derived) 的一部分重新运行时，控制台都会打印出是哪些响应式状态片段触发了它的执行。

```svelte
<script>
	import { doSomeWork } from './elsewhere';

	$effect(() => {
		+++$inspect.trace must be the first statement of a function body+++
		+++$inspect.trace();+++
		doSomeWork();
	});
</script>
```

`$inspect.trace` 接受一个可选的 first 参数，用作标签。
