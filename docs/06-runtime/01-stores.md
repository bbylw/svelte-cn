---
title: 状态存储（Stores）
---

<!-- - how to use
- how to write
- TODO should the details for the store methods belong to the reference section? -->

_状态存储（store）_ 是一个通过简单的_状态存储契约_（store contract）提供对某个值的响应式访问能力的对象。[`svelte/store` 模块](../svelte-store) 包含了满足该契约的最小化 store 实现。

每当你持有一个 store 的引用时，都可以在组件内部通过为其添加 `$` 前缀来访问它的值。这会让 Svelte 声明该带前缀的变量、在组件初始化时订阅该 store，并在适当的时候取消订阅。

对 `$` 前缀变量进行赋值，要求该变量必须是一个 writable store，并且会触发对该 store 的 `.set` 方法的调用。

注意，store 必须声明在组件的顶层——例如，不能位于 `if` 代码块或函数内部。

局部变量（不代表 store 值的变量）_不能_带有 `$` 前缀。

```svelte
<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	console.log($count); // logs 0

	count.set(1);
	console.log($count); // logs 1

	$count = 2;
	console.log($count); // logs 2
</script>
```

## 何时使用 stores

在 Svelte 5 之前，stores 是创建跨组件响应式状态或抽取逻辑的首选方案。有了符文（runes），这些使用场景已大幅减少。

- 在抽取逻辑时，最好利用符文通用（universal）的响应性：你可以在组件顶层之外使用符文，甚至将它们放到 JavaScript 或 TypeScript 文件中（使用 `.svelte.js` 或 `.svelte.ts` 文件扩展名）
- 在创建共享状态时，你可以创建一个包含所需值的 `$state` 对象，然后操作该状态

```ts
/// file: state.svelte.js
export const userState = $state({
	name: 'name',
	/* ... */
});
```

```svelte
<!--- file: App.svelte --->
<script>
	import { userState } from './state.svelte.js';
</script>

<p>User name: {userState.name}</p>
<button onclick={() => {
	userState.name = 'new name';
}}>
	change name
</button>
```

当你拥有复杂的异步数据流，或者需要更手动地控制更新值或监听变更时，stores 依然是一个不错的方案。如果你熟悉 RxJs 并希望复用相关知识，`$` 对你来说也会很顺手。

## svelte/store

`svelte/store` 模块包含了一个满足 store 契约的最小化 store 实现。它提供了用于创建可从外部更新的 store、只能从内部更新的 store，以及用于组合和派生 store 的方法。

### `writable`

创建一个其值可以从组件"外部"设置的 store 的函数。它会以一个带有额外 `set` 和 `update` 方法的对象形式被创建。

`set` 是一个接收一个参数的方法，该参数即为要设置的值。如果 store 的当前值与该参数不相等，则 store 的值会被设为该参数的值。

`update` 是一个接收一个参数的方法，该参数是一个回调函数。该回调函数接收 store 的现有值作为其参数，并返回要设置到 store 的新值。

```js
/// file: store.js
import { writable } from 'svelte/store';

const count = writable(0);

count.subscribe((value) => {
	console.log(value);
}); // logs '0'

count.set(1); // logs '1'

count.update((n) => n + 1); // logs '2'
```

如果传入的第二个参数是一个函数，那么当订阅者数量从零变为一（而不是从一变为二，等等）时，该函数会被调用。该函数会接收到一个 `set` 函数（用于改变 store 的值）和一个 `update` 函数（其工作方式与 store 上的 `update` 方法一样，接收一个回调来根据旧值计算 store 的新值）。它必须返回一个 `stop` 函数，该函数在订阅者数量从一变为零时被调用。

```js
/// file: store.js
import { writable } from 'svelte/store';

const count = writable(0, () => {
	console.log('got a subscriber');
	return () => console.log('no more subscribers');
});

count.set(1); // does nothing

const unsubscribe = count.subscribe((value) => {
	console.log(value);
}); // logs 'got a subscriber', then '1'

unsubscribe(); // logs 'no more subscribers'
```

注意，`writable` 的值在被销毁时会丢失，例如当页面刷新时。不过，你可以编写自己的逻辑将该值同步到（例如）`localStorage`。

### `readable`

创建一个其值无法从"外部"设置的 store，第一个参数是 store 的初始值，`readable` 的第二个参数与 `writable` 的第二个参数相同。

```ts
import { readable } from 'svelte/store';

const time = readable(new Date(), (set) => {
	set(new Date());

	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => clearInterval(interval);
});

const ticktock = readable('tick', (set, update) => {
	const interval = setInterval(() => {
		update((sound) => (sound === 'tick' ? 'tock' : 'tick'));
	}, 1000);

	return () => clearInterval(interval);
});
```

### `derived`

从一个或多个其他 store 派生出一个 store。回调函数会在第一个订阅者订阅时初次运行，之后每当 store 的依赖项发生变化时再次运行。

在最简单的形式中，`derived` 接收一个单独的 store，回调函数返回一个派生值。

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
}

export {};

// @filename: index.ts
// ---cut---
import { derived } from 'svelte/store';

const doubled = derived(a, ($a) => $a * 2);
```

回调函数可以通过接受第二个参数 `set` 和可选的第三个参数 `update`，来异步地设置一个值，并在适当的时候调用它们中的一个或两个。

在这种情况下，你还可以向 `derived` 传入第三个参数——即在 `set` 或 `update` 首次被调用之前，该派生 store 的初始值。如果未指定初始值，该 store 的初始值将为 `undefined`。

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
}

export {};

// @filename: index.ts
// @errors: 18046 2769 7006
// ---cut---
import { derived } from 'svelte/store';

const delayed = derived(
	a,
	($a, set) => {
		setTimeout(() => set($a), 1000);
	},
	2000
);

const delayedIncrement = derived(a, ($a, set, update) => {
	set($a);
	setTimeout(() => update((x) => x + 1), 1000);
	// every time $a produces a value, this produces two
	// values, $a immediately and then $a + 1 a second later
});
```

如果你从回调中返回一个函数，那么当 a) 回调再次运行，或 b) 最后一个订阅者取消订阅时，该函数会被调用。

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const frequency: Writable<number>;
}

export {};

// @filename: index.ts
// ---cut---
import { derived } from 'svelte/store';

const tick = derived(
	frequency,
	($frequency, set) => {
		const interval = setInterval(() => {
			set(Date.now());
		}, 1000 / $frequency);

		return () => {
			clearInterval(interval);
		};
	},
	2000
);
```

在两种情况下，都可以将参数数组作为第一个参数传入，以替代单个 store。

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const a: Writable<number>;
	const b: Writable<number>;
}

export {};

// @filename: index.ts

// ---cut---
import { derived } from 'svelte/store';

const summed = derived([a, b], ([$a, $b]) => $a + $b);

const delayed = derived([a, b], ([$a, $b], set) => {
	setTimeout(() => set($a + $b), 1000);
});
```

### `readonly`

这个简单的辅助函数可以让一个 store 变为只读。你仍然可以使用这个新的可读 store 来订阅来自原始 store 的变更。

```js
import { readonly, writable } from 'svelte/store';

const writableStore = writable(1);
const readableStore = readonly(writableStore);

readableStore.subscribe(console.log);

writableStore.set(2); // console: 2
// @errors: 2339
readableStore.set(2); // ERROR
```

### `get`

通常，你应该通过订阅一个 store 并在其随时间变化时使用该值的方式来读取它的值。偶尔，你可能需要获取一个你并未订阅的 store 的值。`get` 让你可以这样做。

> [!NOTE] 它的原理是创建一个订阅、读取值，然后取消订阅。因此不建议在热点代码路径中使用。

```ts
// @filename: ambient.d.ts
import { type Writable } from 'svelte/store';

declare global {
	const store: Writable<string>;
}

export {};

// @filename: index.ts
// ---cut---
import { get } from 'svelte/store';

const value = get(store);
```

## 状态存储契约

```ts
// @noErrors
store = { subscribe: (subscription: (value: any) => void) => (() => void), set?: (value: any) => void }
```

你可以通过实现_状态存储契约_，在不依赖 [`svelte/store`](../svelte-store) 的情况下创建自己的 store：

1. 一个 store 必须包含一个 `.subscribe` 方法，该方法必须接受一个订阅函数作为参数。该订阅函数必须在调用 `.subscribe` 时立即、同步地以 store 的当前值被调用。随后，每当 store 的值发生变化时，该 store 的所有活动订阅函数都必须被同步调用。
2. `.subscribe` 方法必须返回一个取消订阅函数。调用一个取消订阅函数必须停止其对应的订阅，并且该 store 不得再次调用其对应的订阅函数。
3. 一个 store 可以_选择性地_包含一个 `.set` 方法，该方法必须接受一个新值作为参数，并同步调用该 store 的所有活动订阅函数。这样的 store 被称为_可写 store_（writable store）。

为了与 RxJS Observables 互操作，`.subscribe` 方法也允许返回一个带有 `.unsubscribe` 方法的对象，而不是直接返回取消订阅函数。不过请注意，除非 `.subscribe` 同步地调用了订阅（Observable 规范并不要求这一点），否则在它调用之前，Svelte 会将该 store 的值视为 `undefined`。
