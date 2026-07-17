---
title: 上下文（Context）
---

上下文（context）让组件能够访问由父组件持有的值，而无需将它们作为 props 向下传递（否则可能需要穿过许多层中间组件，即所谓的"prop-drilling"）。

通过使用 `createContext` 创建一个 `[get, set]` 函数对，你可以在父组件中设置上下文，并在子组件中获取它：

<!-- codeblock:start {"title":"Context","selected":"context.ts"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import Parent from './Parent.svelte';
	import Child from './Child.svelte';
</script>

<Parent>
	<Child />
</Parent>
```

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setUserContext } from './context';

	let { children } = $props();

	setUserContext({ name: 'world' });
</script>

{@render children()}
```

```svelte
<!--- file: Child.svelte --->
<script>
	import { getUserContext } from './context';

	const user = getUserContext();
</script>

<h1>hello {user.name}, inside Child.svelte</h1>
```

```ts
/// file: context.ts
import { createContext } from 'svelte';

interface User {
	name: string;
}

export const [getUserContext, setUserContext] = createContext<User>();
```
<!-- codeblock:end -->

> [!NOTE] `createContext` 在 5.40 版本中新增。如果你使用的是更早的 Svelte 版本，则必须使用 `setContext` 和 `getContext` 替代。

当 `Parent.svelte` 并不直接知晓 `Child.svelte`，而是像上面那样将其作为 `children` [代码片段](snippet) 的一部分来渲染时，这尤其有用。

## `setContext` 和 `getContext`

作为 `createContext` 的替代方案，你可以直接使用 `setContext` 和 `getContext`。父组件通过 `setContext(key, value)` 设置上下文……

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setContext } from 'svelte';

	setContext('my-context', 'hello from Parent.svelte');
</script>
```

……而子组件通过 `getContext` 获取它：

```svelte
<!--- file: Child.svelte --->
<script>
	import { getContext } from 'svelte';

	const message = getContext('my-context');
</script>

<h1>{message}, inside Child.svelte</h1>
```

键（上面示例中的 `'my-context'`）以及上下文本身可以是任何 JavaScript 值。

> [!NOTE] 更推荐使用 `createContext`，因为它提供了更好的类型安全性，并且不再需要使用键。

除了 [`setContext`](svelte#setContext) 和 [`getContext`](svelte#getContext)，Svelte 还导出了 [`hasContext`](svelte#hasContext) 和 [`getAllContexts`](svelte#getAllContexts) 函数。

## 在上下文中使用状态

你可以将响应式状态存储到上下文中……

<!-- codeblock:start {"title":"Context with state"} -->
```svelte
<!--- file: App.svelte --->
<script>
	import { setCounter } from './context.ts';
	import Child from './Child.svelte';

	let counter = $state({
		count: 0
	});

	setCounter(counter);
</script>

<button onclick={() => counter.count += 1}>
	increment
</button>

<Child />
<Child />
<Child />

<button onclick={() => counter.count = 0}>
	reset
</button>
```

```svelte
<!--- file: Child.svelte --->
<script>
	import { getCounter } from './context.ts';

	const counter = getCounter();
</script>

<p>{counter.count}</p>
```

```ts
/// file: context.ts
import { createContext } from 'svelte';

interface Counter {
	count: number;
}

export const [getCounter, setCounter] = createContext<Counter>();
```
<!-- codeblock:end -->

……但要注意，如果你_重新赋值_ `counter` 而不是更新它，你会"断开链接"——换句话说，不要这样做……

```svelte
<button onclick={() => counter = { count: 0 } }>
	reset
</button>
```

……你必须这样做：

```svelte
<button onclick={() => +++counter.count = 0+++}>
	reset
</button>
```

如果你处理不当，Svelte 会发出警告。

类似地，要通过上下文传递原始值，请使用[将状态传入函数]($state#Passing-state-into-functions) 中描述的函数方式。

## 组件测试

在编写[组件测试](testing#Unit-and-component-tests-with-Vitest-Component-testing) 时，创建一个设置上下文的包装组件来检查使用该上下文的组件的行为，往往很有用。自 5.49 版本起，你可以做这样的事情：

```js
import { mount, unmount } from 'svelte';
import { expect, test } from 'vitest';
import { setUserContext } from './context';
import MyComponent from './MyComponent.svelte';

test('MyComponent', () => {
	function Wrapper(...args) {
		setUserContext({ name: 'Bob' });
		return MyComponent(...args);
	}

	const component = mount(Wrapper, {
		target: document.body
	});

	expect(document.body.innerHTML).toBe('<h1>Hello Bob!</h1>');

	unmount(component);
});
```

这种方法同样适用于 [`hydrate`](imperative-component-api#hydrate) 和 [`render`](imperative-component-api#render)。

## 取代全局状态

当你拥有被许多不同组件共享的状态时，你可能会想把它放进一个独立的模块中，然后在任何需要的地方导入它：

```js
/// file: state.svelte.js
export const myGlobalState = $state({
	user: {
		// ...
	}
	// ...
});
```

在许多情况下这完全没问题，但存在一种风险：如果你在服务端渲染期间变更了该状态（虽然不推荐，但完全可能！）……

```svelte
<!--- file: App.svelte --->
<script>
	import { myGlobalState } from './state.svelte.js';

	let { data } = $props();

	if (data.user) {
		myGlobalState.user = data.user;
	}
</script>
```

……那么该数据可能会被_下一位_用户访问到。上下文解决了这个问题，因为它不会在请求之间共享。
