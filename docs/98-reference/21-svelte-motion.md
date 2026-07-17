---
title: svelte/motion
---

该模块提供基于物理或时间插值的动画状态。

## Spring

```js
class Spring<T> {
	constructor(value: T, options?: SpringOptions);
	set(value: T, options?: SpringOptions): Promise<void>;
	update(fn: (latest: T) => T, options?: SpringOptions): Promise<void>;
	readonly current: T;
	readonly target: T;
}
```

基于弹簧物理的插值状态，`current` 会平滑地趋近于 `target`。`SpringOptions` 包含 `stiffness`、`damping`、`precision` 等。

```svelte
<script>
	import { Spring } from 'svelte/motion';

	const coords = new Spring({ x: 0, y: 0 }, {
		stiffness: 0.1,
		damping: 0.25
	});
</script>

<div
	onpointermove={(e) => coords.set({ x: e.clientX, y: e.clientY })}
	style="width: 100%; height: 100%"
>
	<div style="transform: translate({coords.current.x}px, {coords.current.y}px)"></div>
</div>
```

## Tween

```js
class Tween<T> {
	constructor(value: T, options?: TweenOptions);
	set(value: T, options?: TweenOptions): Promise<void>;
	update(fn: (latest: T) => T, options?: TweenOptions): Promise<void>;
	readonly current: T;
	readonly target: T;
}
```

基于时间插值的补间动画，`TweenOptions` 包含 `delay`、`duration`、`easing` 等。`duration` 也可传一个返回时长的函数以实现动态时长。

```svelte
<script>
	import { Tween } from 'svelte/motion';

	const size = new Tween(0, { duration: 400, easing: (t) => t * t });
</script>

<button onclick={() => size.set(size.current === 0 ? 100 : 0)}>
	{size.current}
</button>
```

> [!LEGACY]
> `spring()` 与 `tweened()` 是旧版 API，请改用 `Spring` 与 `Tween` 类。
