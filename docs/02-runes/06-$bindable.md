---
title: $bindable
---

通常，props 是单向流动的，从父组件到子组件。这让数据如何在应用中流动变得易于理解。

在 Svelte 中，组件的 props 可以被_绑定_，这意味着数据也可以从子组件"向上"流动到父组件。这不是你应该经常做的事——过度使用会让数据流变得难以预测，组件也更难维护——但如果谨慎而克制地使用，它能简化你的代码。

这也意味着状态代理可以在子组件中被_修改_。

> [!NOTE] 使用普通 props 也能进行修改，但强烈不推荐——如果 Svelte 检测到某个组件正在修改它并不"拥有"的状态，就会发出警告。

要将某个 prop 标记为可绑定，我们使用 `$bindable` 符文：

<!-- prettier-ignore -->
```svelte
/// file: FancyInput.svelte
<script>
	let { value = $bindable(), ...props } = $props();
</script>

<input bind:value={value} {...props} />

<style>
	input {
		font-family: 'Comic Sans MS';
		color: deeppink;
	}
</style>
```

现在，使用 `<FancyInput>` 的组件就可以添加 [`bind:`](bind) 指令（[演示](/playground/untitled#H4sIAAAAAAAAE3WQwWrDMBBEf2URBSfg2nfFMZRCoYeecqx6UJx1IyqvhLUONcb_XqSkTUOSk1az7DBvJtEai0HI90nw6FHIJIhckO7i78n7IhzQctS2OuAtvXHESByEFFVoeuO5VqTYdN71DC-amvGV_MDQ9q6DrCjP0skkWymKJxYZOgxBfyKs4SGwZlxke7TWZcuVoqo8-1P1z3lraCcP2g64nk4GM5S1osrXf0JV-lrkgvGbheR-wDm_g30V8JL-1vpOCZFogpQsEsWcemtxscyhKArfOx9gjps0Lq4hzRVfemaYfu-PoIqqwKPFY_XpaIqj4tYRP7a6M3aUkD27zjSw0RTgbZN6Z8WNs66XsEP03tBXUueUJFlelvYx_wCuI3leNwIAAA==)）：

<!-- prettier-ignore -->
```svelte
/// file: App.svelte
<script>
	import FancyInput from './FancyInput.svelte';

	let message = $state('hello');
</script>

<FancyInput bind:value={message} />
<p>{message}</p>
```

父组件并不_必须_使用 `bind:`——它也可以只传递一个普通的 prop。有些父组件并不想听子组件"说"什么。

在这种情况下，你可以指定一个回退值，用于完全没有传入任何 prop 时：

```js
/// file: FancyInput.svelte
let { value = $bindable('fallback'), ...props } = $props();
```
