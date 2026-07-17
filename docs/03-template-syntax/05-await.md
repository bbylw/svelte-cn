---
title: {#await ...}
tags: template-await
---

```svelte
<!--- copy: false  --->
{#await expression}...{:then name}...{:catch name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression}...{:then name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression then name}...{/await}
```

```svelte
<!--- copy: false  --->
{#await expression catch name}...{/await}
```

await 块允许你根据 [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 的三种可能状态——等待中（pending）、已兑现（fulfilled）或已拒绝（rejected）——进行分支处理。

```svelte
{#await promise}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled or not a Promise -->
	<p>The value is {value}</p>
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
```

> [!NOTE] 在服务端渲染期间，只会渲染等待中的分支。
>
> 如果提供的表达式不是一个 `Promise`，则只会渲染 `:then` 分支，包括服务端渲染期间也是如此。

如果你不需要在 promise 被拒绝时渲染任何内容（或者不可能出现错误），可以省略 `catch` 块。

```svelte
{#await promise}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled -->
	<p>The value is {value}</p>
{/await}
```

如果你不关心等待中的状态，也可以省略初始块。

```svelte
{#await promise then value}
	<p>The value is {value}</p>
{/await}
```

类似地，如果你只想显示错误状态，可以省略 `then` 块。

```svelte
{#await promise catch error}
	<p>The error is {error}</p>
{/await}
```

> [!NOTE] 你可以将 `#await` 与 [`import(...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) 配合使用，以懒加载的方式渲染组件：
>
> ```svelte
> {#await import('./Component.svelte') then { default: Component }}
> 	<Component />
> {/await}
> ```
