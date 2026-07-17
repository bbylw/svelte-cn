---
title: 'Runtime errors'
---

运行时错误是在组件运行（客户端或服务端）时抛出的错误。以下是常见的运行时错误：

## Client errors

- **hydration_mismatch** — 客户端渲染的 HTML 与服务端不一致（水合不匹配）。常见于使用 `Date.now()`、`Math.random()` 等不确定性值。
- **lifecycles_outside_component** — 在组件之外调用了 `onMount`、`onDestroy` 等生命周期函数。
- **state_unsafe_mutation** — 在派生的响应式上下文之外，以不安全的方式修改了响应式状态。
- **effect_in_derived** — 在 `$derived` 内部创建了 `$effect`。
- **svelte_legacy_invalid_use_of_svelte_internal** — 错误地使用了内部 API。

```js
// 错误示例：在组件外调用生命周期
import { onMount } from 'svelte';
onMount(() => {}); // ❌ 必须在组件初始化期间调用
```

## Server errors

- **render_outside_server** — 在服务端 API 被用在非服务端环境。
- **server_props_dependency** — 服务端渲染时依赖了无法序列化的 props。

## Shared errors

- **unknown-error** — 未被分类的运行时错误，通常伴随详细堆栈信息。

> [!NOTE]
> 运行时错误带有 `code` 字段，可用于在文档中精确检索。
