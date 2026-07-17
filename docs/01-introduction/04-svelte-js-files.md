---
title: .svelte.js 和 .svelte.ts 文件
---

除了 `.svelte` 文件之外，Svelte 还可以处理 `.svelte.js` 和 `.svelte.ts` 文件。

它们的行为与其他任何 `.js` 或 `.ts` 模块相同，区别在于你可以使用 runes（符文）。这对于创建可复用的响应式逻辑，或在应用内共享响应式状态非常有用（不过请注意，你[无法导出被重新赋值的状态]($state#Passing-state-across-modules)）。

> [!LEGACY]
> 这是一个在 Svelte 5 之前并不存在的新概念。
