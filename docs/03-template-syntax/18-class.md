---
title: class
tags: template-class
---

在元素上设置 class 有两种方式：`class` 属性和 `class:` 指令。

## 属性

原始值会被当作任何其他属性一样处理：

```svelte
<div class={large ? 'large' : 'small'}>...</div>
```

> [!NOTE]
> 由于历史原因，假值（如 `false` 和 `NaN`）会被字符串化（`class="false"`），但 `class={undefined}`（或 `null`）会导致该属性被完全省略。在未来的 Svelte 版本中，所有假值都会导致 `class` 被省略。

### 对象与数组

自 Svelte 5.16 起，`class` 可以是一个对象或数组，并使用 [clsx](https://github.com/lukeed/clsx) 转换为字符串。

如果值是一个对象，则真值对应的键会被添加：

```svelte
<script>
	let { cool } = $props();
</script>

<!-- results in `class="cool"` if `cool` is truthy,
     `class="lame"` otherwise -->
<div class={{ cool, lame: !cool }}>...</div>
```

如果值是一个数组，则真值会被合并：

```svelte
<!-- if `faded` and `large` are both truthy, results in
     `class="saturate-0 opacity-50 scale-200"` -->
<div class={[faded && 'saturate-0 opacity-50', large && 'scale-200']}>...</div>
```

注意，无论我们使用数组还是对象形式，都可以通过单一条件同时设置多个 class，如果你使用的是像 Tailwind 这样的工具，这会特别有用。

数组可以包含数组和对象，clsx 会将它们展平。这对于将本地 class 与 props 组合很有用，例如：

```svelte
<!--- file: Button.svelte --->
<script>
	let props = $props();
</script>

<button {...props} class={['cool-button', props.class]}>
	{@render props.children?.()}
</button>
```

该组件的使用者同样可以灵活地混合使用对象、数组和字符串：

```svelte
<!--- file: App.svelte --->
<script>
	import Button from './Button.svelte';
	let useTailwind = $state(false);
</script>

<Button
	onclick={() => useTailwind = true}
	class={{ 'bg-blue-700 sm:w-1/2': useTailwind }}
>
	Accept the inevitability of Tailwind
</Button>
```

自 Svelte 5.19 起，Svelte 还导出了 `ClassValue` 类型，即元素上 `class` 属性所接受的值的类型。如果你想在组件 props 中使用类型安全的类名，这会很有用：

```svelte
<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	const props: { class: ClassValue } = $props();
</script>

<div class={['original', props.class]}>...</div>
```

## `class:` 指令

在 Svelte 5.16 之前，`class:` 指令是在元素上有条件地设置 class 最方便的方式。

```svelte
<!-- These are equivalent -->
<div class={{ cool, lame: !cool }}>...</div>
<div class:cool={cool} class:lame={!cool}>...</div>
```

与其他指令一样，当 class 的名称与值相同时，我们可以使用简写：

```svelte
<div class:cool class:lame={!cool}>...</div>
```

> [!NOTE] 除非你使用的是较旧版本的 Svelte，否则建议避免使用 `class:`，因为属性形式更强大、更具组合性。
