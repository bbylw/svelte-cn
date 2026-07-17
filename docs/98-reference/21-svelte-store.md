---
title: svelte/store
---

该模块提供了响应式存储（store）的实现。一个 store 是一个带有 `subscribe` 方法的对象；可写 store 还会额外提供 `set` 和 `update` 方法。

## writable

```js
function writable<T>(
	value: T | ((set: (value: T) => void) => (() => void)),
	start?: (set: (value: T) => void) => (() => void) | void
): Writable<T>;
```

创建一个可读可写的 store。

```js
import { writable } from 'svelte/store';

const count = writable(0);
count.subscribe((value) => console.log(value)); // 0
count.set(1); // 1
```

## readable

```js
function readable<T>(
	value: T,
	start: (set: (value: T) => void) => (() => void) | void
): Readable<T>;
```

创建一个只读 store，只能由内部逻辑更新。

## derived

```js
function derived<T>(
	stores: Stores,
	fn: (values: StoresValues, set?: (value: T) => void) => T | void
): Readable<T>;
```

从一个或多个 store 派生出新的 store。

## readonly

```js
function readonly<T>(store: Writable<T>): Readable<T>;
```

把一个可写 store 包装为只读版本。

## get

```js
function get<T>(store: Readable<T>): T;
```

同步读取 store 的当前值。注意：在组件内部通常应使用 `$store` 自动订阅语法，而非 `get`。

> [!NOTE]
> 在 Svelte 5 中，推荐优先使用 runes 与 `$state` 管理状态；store 主要适用于与第三方库互操作，或需要在任意位置共享的简单状态。
