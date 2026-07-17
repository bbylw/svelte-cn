---
title: 概述
---

Svelte 5 对 Svelte 的 API 做了一些重大变更，包括 [符文（runes）](what-are-runes)、[代码片段（snippets）](snippet) 和事件属性。因此，部分 Svelte 3/4 特性已被弃用（尽管目前仍受支持，除非另有说明），并最终会被移除。我们建议你逐步 [迁移现有代码](v5-migration-guide)。

以下页面为以下人群记录了这些特性：

- 仍在使用 Svelte 3/4 的人
- 使用 Svelte 5，但仍有组件尚未迁移的人

由于 Svelte 3/4 语法在 Svelte 5 中仍然有效，我们将区分 _legacy 模式_ 和 _runes 模式_。一旦一个组件进入 runes 模式（你可以通过使用 runes，或显式设置 `runes: true` 编译器选项来进入），legacy 模式的特性就不再可用。

如果你只对 Svelte 3/4 语法感兴趣，可以在 [v4.svelte.dev](https://v4.svelte.dev) 浏览其文档。
