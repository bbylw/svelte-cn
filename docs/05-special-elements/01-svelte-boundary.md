---
title: <svelte:boundary>
---

```svelte
<svelte:boundary onerror={handler}>...</svelte:boundary>
```

> [!NOTE]
> 该特性在 5.3.0 中新增

边界（boundaries）让你可以将应用的某些部分"隔离"起来，从而能够：

- 提供在 [`await`](await-expressions) 表达式首次解析时应当显示的 UI
- 处理在渲染过程中或运行 effects 时发生的错误，并提供错误发生时应当渲染的 UI

如果边界处理了某个错误（通过 `failed` 代码片段或 `onerror` 处理器，或两者兼具），它已有的内容会被移除。

> [!NOTE] 在渲染过程之外发生的错误（例如，在事件处理器中，或在 `setTimeout` 或异步工作之后）_不会_被错误边界捕获。

## 属性

要让边界发挥作用，必须提供以下一个或多个属性。

### `pending` {#Properties-pending}

当边界首次创建时，该代码片段会被显示，并会一直可见，直到边界内部的所有 [`await`](await-expressions) 表达式都已解析（[演示](/playground/untitled#H4sIAAAAAAAAE21QQW6DQAz8ytY9BKQVpFdKkPqDHnorPWzAaSwt3tWugUaIv1eE0KpKD5as8YxnNBOw6RAKKOOAVrA4up5bEy6VGknOyiO3xJ8qMnmPAhpOZDFC8T6BXPyiXADQ258X77P1FWg4moj_4Y1jQZZ49W0CealqruXUcyPkWLVozQXbZDC2R606spYiNo7bqA7qab_fp2paFLUElD6wYhzVa3AdRUySgNHZAVN1qDZaLRHljTp0vSTJ9XJjrSbpX5f0eZXN6zLXXOa_QfmurIVU-moyoyH5ib87o7XuYZfOZe6vnGWmx1uZW7lJOq9upa-sMwuUZdkmmfIbfQ1xZwwaBL8ECgk9zh8axJAdiVsoTsZGnL8Bg4tX_OMBAAA=)）：

```svelte
<svelte:boundary>
	<p>{await delayed('hello!')}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
```

对于随后的异步更新，`pending` 代码片段_不会_被显示——对于这些，你可以使用 [`$effect.pending()`]($effect#$effect.pending)。

> [!NOTE] 在服务端渲染期间，带有 `pending` 代码片段的边界会渲染该代码片段，并忽略其中其余的内容。参见[服务端渲染](await-expressions#Server-side-rendering)。

### `failed`

如果提供了 `failed` 代码片段，当边界内部抛出错误时，它会被渲染，并带有 `error` 和一个用于重建内容的 `reset` 函数（[演示](/playground/hello-world#H4sIAAAAAAAAE3VRy26DMBD8lS2tFCIh6JkAUlWp39Cq9EBg06CAbdlLArL87zWGKk8ORnhmd3ZnrD1WtOjFXqKO2BDGW96xqpBD5gXerm5QefG39mgQY9EIWHxueRMinLosti0UPsJLzggZKTeilLWgLGc51a3gkuCjKQ7DO7cXZotgJ3kLqzC6hmex1SZnSXTWYHcrj8LJjWTk0PHoZ8VqIdCOKayPykcpuQxAokJaG1dGybYj4gw4K5u6PKTasSbjXKgnIDlA8VvUdo-pzonraBY2bsH7HAl78mKSHZpgIcuHjq9jXSpZSLixRlveKYQUXhQVhL6GPobXAAb7BbNeyvNUs4qfRg3OnELLj5hqH9eQZqCnoBwR9lYcQxuVXeBzc8kMF8yXY4yNJ5oGiUzP_aaf_waTRGJib5_Ad3P_vbCuaYxzeNpbU0eUMPAOKh7Yw1YErgtoXyuYlPLzc10_xo_5A91zkQL_AgAA)）：

```svelte
<svelte:boundary>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<button onclick={reset}>oops! try again</button>
	{/snippet}
</svelte:boundary>
```

> [!NOTE]
> 与[传递给组件的代码片段](snippet#Passing-snippets-to-components) 一样，`failed` 代码片段既可以显式作为属性传递……
>
> ```svelte
> <svelte:boundary {failed}>...</svelte:boundary>
> ```
>
> ……也可以像上面的示例那样，通过直接在边界内部声明来隐式传递。

### `onerror`

如果提供了 `onerror` 函数，它会被调用，并传入相同的 `error` 和 `reset` 两个参数。这对于使用错误上报服务来追踪错误很有用……

```svelte
<svelte:boundary onerror={(e) => report(e)}>
	...
</svelte:boundary>
```

……或者在边界自身之外使用 `error` 和 `reset`：

```svelte
<script>
	let error = $state(null);
	let reset = $state(() => {});

	function onerror(e, r) {
		error = e;
		reset = r;
	}
</script>

<svelte:boundary {onerror}>
	<FlakyComponent />
</svelte:boundary>

{#if error}
	<button onclick={() => {
		error = null;
		reset();
	}}>
		oops! try again
	</button>
{/if}
```

如果 `onerror` 函数内部发生了错误（或者你重新抛出了错误），那么如果有父级边界，它会由父级边界来处理。

## 使用 `transformError`

默认情况下，错误边界在服务端没有任何效果——如果在渲染期间发生错误，整个渲染都会失败。

自 5.51 起，你可以通过使用一个带有 `failed` 代码片段的边界，并传入一个 `transformError` 函数调用 [`render(...)`](imperative-component-api#render) 来控制这一行为。

> [!NOTE] 如果你是通过像 SvelteKit 这样的框架来使用 Svelte，你很可能无法直接访问 `render(...)` 调用——框架必须代为配置 `transformError`。SvelteKit 将在近期通过 [`handleError`](../kit/hooks#handleError) 钩子添加对此的支持。

`transformError` 函数必须返回一个可被 JSON 序列化的对象，该对象将被用于渲染 `failed` 代码片段。这个对象会被序列化，并用于在浏览器中 hydrate 该代码片段：

```js
// @errors: 1005
import { render } from 'svelte/server';
import App from './App.svelte';

const { head, body } = await render(App, {
	transformError: (error) => {
		// log the original error, with the stack trace...
		console.error(error);

		// ...and return a sanitized user-friendly error
		// to display in the `failed` snippet
		return {
			message: 'An error occurred!'
		};
	}
});
```

如果 `transformError` 抛出（或重新抛出）了一个错误，`render(...)` 作为一个整体会以该错误而失败。

> [!NOTE] 在服务端渲染期间发生的错误，其 `message` 和 `stack` 中可能包含敏感信息。建议对其做脱敏处理，而不是直接原样发送到浏览器。

如果边界带有一个 `onerror` 处理器，它在 hydrate 时会被调用，并传入反序列化后的错误对象。

[`mount`](imperative-component-api#mount) 和 [`hydrate`](imperative-component-api#hydrate) 函数同样接受一个 `transformError` 选项，该选项默认为恒等函数。与 `render` 一样，此函数会在渲染时错误被传递给 `failed` 代码片段或 `onerror` 处理器之前对其做转换。
