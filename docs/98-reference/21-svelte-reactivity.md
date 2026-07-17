---
title: svelte/reactivity
---

Svelte 提供了各种内置对象（如 [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)、[`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) 和 [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL)）的响应式版本，它们可以像原生对象一样使用，此外还提供了一少量处理响应式的额外工具。

## SvelteSet

```js
class SvelteSet<T> extends Set<T> {}
```

与原生 `Set` 行为一致，但对其修改（如 `add`、`delete`、`clear`）是响应式的——在模板或 `$derived`/`$effect` 中引用时会自动更新。

```js
import { SvelteSet } from 'svelte/reactivity';

const selected = new SvelteSet();
```

## SvelteMap

```js
class SvelteMap<K, V> extends Map<K, V> {}
```

响应式版本的 `Map`。

## SvelteURL

```js
class SvelteURL extends URL {}
```

响应式版本的 `URL`，对其属性（如 `href`、`searchParams`）的修改会被追踪。

## SvelteURLSearchParams

```js
class SvelteURLSearchParams extends URLSearchParams {}
```

响应式版本的 `URLSearchParams`。

## SvelteDate

```js
class SvelteDate extends Date {}
```

响应式版本的 `Date`，适合用于倒计时等随时间变化的场景。
