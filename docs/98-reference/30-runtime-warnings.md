---
title: 'Runtime warnings'
---

运行时警告是在组件运行（客户端或服务端）时给出的提示，通常不会中断执行，但提示可能存在问题。

## Client warnings

- **state_unsafe_mutation** — 在响应式上下文之外修改了响应式状态，可能导致界面不更新。请将可变状态放在 `$state` 中，或从 `$derived` 中读取而非写入。
- **effect_update_depth_exceeded** — 副作用的更新深度超出限制，通常由副作用内的循环依赖引起（无限循环）。
- **hydration_mismatch** — 客户端与服务端 HTML 存在不匹配（同名的运行时警告版本）。

```svelte
<script>
	let count = $state(0);
	// ❌ 在响应式上下文外直接修改可能触发 state_unsafe_mutation
</script>
```

## Shared warnings

- **state_referenced_locally** — 响应式状态被引用到了非响应式的局部变量中，后续修改不会触发更新。
- **effect_orphan** — `$effect` 没有被任何组件或 `$effect.root` 拥有。
