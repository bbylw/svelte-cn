---
title: $state
---

`$state` rune 让你可以创建_响应式状态（reactive state）_，也就是说，当状态发生变化时，你的 UI 也会随之_响应_。

```svelte
<!--- file: App.svelte --->
<script>
	function greet() {
		alert('Welcome to Svelte!');
	}
</script>

<button onclick={greet}>click me</button>

<style>
	button {
		font-size: 2em;
	}
</style>
```

与其他你可能接触过的框架不同，这里没有任何用于操作状态的 API——`count` 只是一个数字，而不是一个对象或函数，你可以像更新其他任何变量一样去更新它。

### 深层状态（Deep state） {#deep-state}

如果 `$state` 与一个数组或普通对象一起使用，结果会是一个深度响应式的_状态代理（state proxy）_。[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) 允许 Svelte 在你读取或写入属性（包括通过 `array.push(...)` 这类方法）时运行代码，从而触发细粒度的更新。

状态会被递归地代理化，直到 Svelte 遇到数组或普通对象以外的东西（比如类，或通过 `Object.create` 创建的对象）。在这种情况下……

```js
let todos = $state([
	{
		done: false,
		text: 'add more todos'
	}
]);
```

……修改某个 todo 的属性也会触发 UI 中依赖该特定属性的部分更新：

```js
let todos = [{ done: false, text: 'add more todos' }];
// ---cut---
todos[0].done = !todos[0].done;
```

如果你向数组中 push 一个新对象，它也会被代理化：

```js
let todos = [{ done: false, text: 'add more todos' }];
// ---cut---
todos.push({
	done: false,
	text: 'eat lunch'
});
```

> [!NOTE] 当你更新代理的属性时，原始对象_并不会_被修改。如果你需要在自己的状态代理中使用自定义的代理处理器，[你应该在用 `$state` 包裹对象_之后_再包裹它](https://svelte.dev/playground/hello-world?version=latest#H4sIAAAAAAAACpWR3WoDIRCFX2UqhWyIJL3erAulL9C7XnQLMe5ksbUqOpsfln33YuyGFNJC8UKdc2bOhw7Myk9kJXsJ0nttO9jcR5KEG9AWJDwHdzwxznbaYGTl68Do5JM_FRifuh-9X8Y9Gkq1rYx4q66cJbQUWcmqqIL2VDe2IYMEbvuOikBADi-GJDSkXG-phId0G-frye2DO2psQYDFQ0Ys8gQO350dUkEydEg82T0GOs0nsSG9g2IqgxACZueo2ZUlpdvoDC6N64qsg1QKY8T2bpZp8gpIfbCQ85Zn50Ud82HkeY83uDjspenxv3jXcSDyjPWf9L1vJf0GH666J-jLu1ery4dV257IWXBWGa0-xFDMQdTTn2ScxWKsn86ROsLwQxqrVR5QM84Ij8TKFD2-cUZSm4O2LSt30kQcvwCgCmfZnAIAAA==)。

注意，如果你对响应式值进行解构，得到的引用并不是响应式的——就像在普通 JavaScript 中一样，它们是在解构那一刻被求值的：

```js
let todos = [{ done: false, text: 'add more todos' }];
// ---cut---
let { done, text } = todos[0];

// 这不会影响 `done` 的值
todos[0].done = !todos[0].done;
```

### 类（Classes） {#classes}

类的实例不会被代理。作为替代，你可以在类的字段（无论是公有还是私有）中使用 `$state`，或者在 `constructor` 内部第一次给属性赋值时使用它：

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);

	constructor(text) {
		this.text = $state(text);
	}

	reset() {
		this.text = '';
		this.done = false;
	}
}
```

> [!NOTE] 编译器会把 `done` 和 `text` 转换为类原型上引用私有字段的 `get`/`set` 方法。这意味着这些属性不可枚举。

在 JavaScript 中调用方法时，`this` 的值很重要。下面这样写是行不通的，因为 `reset` 方法内部的 `this` 会是 `<button>` 而不是 `Todo`：

```svelte
<button onclick={todo.reset}>
	reset
</button>
```

你可以改用内联函数……

```svelte
<button onclick={() => todo.reset()}>
	reset
</button>
```

……或者在类定义中使用箭头函数：

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);

	constructor(text) {
		this.text = $state(text);
	}

	reset = () => {
		this.text = '';
		this.done = false;
	}
}
```

### 内置类（Built-in classes）

Svelte 提供了 `Set`、`Map`、`Date` 和 `URL` 等内置类的响应式实现，你可以从 [`svelte/reactivity`](svelte-reactivity) 中导入它们。

## `$state.raw`

如果你不希望对象与数组被深度响应式化，可以使用 `$state.raw`。

用 `$state.raw` 声明 state 后，它不能被修改（mutate），只能被_重新赋值（reassign）_。换句话说，与其给对象的属性赋值，或使用像 `push` 这样的数组方法，不如在需要更新时整体替换该对象或数组：

```js
let person = $state.raw({
	name: 'Heraclitus',
	age: 49
});

// 这不会有任何效果
person.age += 1;

// 这会生效，因为我们创建了一个新的 person
person = {
	name: 'Heraclitus',
	age: 50
};
```

这可以在处理本来就不打算修改的大数组和大对象时提升性能，因为它避免了将它们变为响应式状态的代价。注意，原始状态可以_包含_响应式状态（例如，一个由响应式对象组成的原始数组）。

与 `$state` 一样，你也可以使用 `$state.raw` 来声明类字段。

## `$state.snapshot`

要获取深度响应式的 `$state` 代理的静态快照，请使用 `$state.snapshot`：

```svelte
<script>
	let counter = $state({ count: 0 });

	function onclick() {
		// 会输出 `{ count: ... }` 而不是 `Proxy { ... }`
		console.log($state.snapshot(counter));
	}
</script>
```

当你想把某些状态传递给不期望接收代理的外部库或 API（例如 `structuredClone`）时，这会很方便。

如果一个值带有 `toJSON` 方法，快照会克隆从该 `toJSON` 返回的值，而不是原始对象。

## `$state.eager`

当状态发生变化时，如果它被某个 `await` 表达式使用，它可能不会立即反映在 UI 中，因为[更新是同步协调的](await-expressions#Synchronized-updates)。

在某些情况下，你可能希望状态一变化就更新 UI。例如，当用户点击链接时，你可能想更新导航栏，以便他们在等待新页面加载时获得视觉反馈。为此，请使用 `$state.eager(value)`：

```svelte
<nav>
	<a href="/" aria-current={$state.eager(pathname) === '/' ? 'page' : null}>home</a>
	<a href="/about" aria-current={$state.eager(pathname) === '/about' ? 'page' : null}>about</a>
</nav>
```

请谨慎使用此特性，并且只在响应用户操作时提供反馈——通常情况下，让 Svelte 来协调更新会带来更好的用户体验。

## 将状态传入函数 {#passing-state-into-functions}

JavaScript 是一种_按值传递（pass-by-value）_的语言——当你调用函数时，参数传递的是_值_而不是_变量_。换句话说：

```js
/// file: index.js
// @filename: index.js
// ---cut---
/**
 * @param {number} a
 * @param {number} b
 */
function add(a, b) {
	return a + b;
}

let a = 1;
let b = 2;
let total = add(a, b);
console.log(total); // 3

a = 3;
b = 4;
console.log(total); // 仍然是 3！
```

如果 `add` 想要访问 `a` 和 `b` 的_当前_值，并返回 `total` 的当前值，你就需要使用函数：

```js
/// file: index.js
// @filename: index.js
// ---cut---
/**
 * @param {() => number} getA
 * @param {() => number} getB
 */
function add(getA, getB) {
	return () => getA() + getB();
}

let a = 1;
let b = 2;
let total = add(() => a, () => b);
console.log(total()); // 3

a = 3;
b = 4;
console.log(total()); // 7
```

Svelte 中的状态也不例外——当你引用用 `$state` rune 声明的内容时……

```js
let a = $state(1);
let b = $state(2);
```

……你访问的是它的_当前值_。

注意，"函数" 一词含义很广——它涵盖了代理的属性以及 [`get`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)/[`set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) 属性……

```js
/// file: index.js
// @filename: index.js
// ---cut---
/**
 * @param {{ a: number, b: number }} input
 */
function add(input) {
	return {
		get value() {
			return input.a + input.b;
		}
	};
}

let input = $state({ a: 1, b: 2 });
let total = add(input);
console.log(total.value); // 3

input.a = 3;
input.b = 4;
console.log(total.value); // 7
```

……不过，如果你发现自己写的是这样的代码，不妨考虑改用[类](#Classes)。

## 跨模块共享状态 {#passing-state-across-modules}

你可以在 `.svelte.js` 和 `.svelte.ts` 文件中声明状态，但你只能导出那些没有被重新赋值的状态。换句话说，你不能这样做：

```js
/// file: state.svelte.js
export let count = $state(0);

export function increment() {
	count += 1;
}
```

这是因为对 `count` 的每次引用都会被 Svelte 编译器转换——上面的代码大致等价于：

```js
/// file: state.svelte.js (compiler output)
// @filename: index.ts
interface Signal<T> {
	value: T;
}

interface Svelte {
	state<T>(value?: T): Signal<T>;
	get<T>(source: Signal<T>): T;
	set<T>(source: Signal<T>, value: T): void;
}
declare const $: Svelte;
// ---cut---
export let count = $.state(0);

export function increment() {
	$.set(count, $.get(count) + 1);
}
```

> [!NOTE] 你可以点击演练场中的 "JS Output" 选项卡查看 Svelte 生成的代码。

由于编译器一次只处理一个文件，如果另一个文件导入了 `count`，Svelte 并不知道它需要用 `$.get` 和 `$.set` 包裹每一次引用：

```js
// @filename: state.svelte.js
export let count = 0;

// @filename: index.js
// ---cut---
import { count } from './state.svelte.js';

console.log(typeof count); // 'object'，而不是 'number'
```

因此你有两种选择来在模块之间共享状态——要么不去重新赋值它……

```js
// 这是允许的——因为我们更新的是 `counter.count` 而不是 `counter`，
// Svelte 不会把它包裹进 `$.state`
export const counter = $state({
	count: 0
});

export function increment() {
	counter.count += 1;
}
```

……要么干脆不要直接导出它：

```js
let count = $state(0);

export function getCount() {
	return count;
}

export function increment() {
	count += 1;
}
```
