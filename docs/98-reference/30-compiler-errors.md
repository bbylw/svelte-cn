---
title: 'Compiler errors'
---

当 Svelte 在编译组件时遇到无法继续的问题，会抛出编译器错误。以下是常见的编译器错误：

## Client errors

- **parse-error** — 组件源码无法解析，通常由于标签不匹配或表达式语法错误。
- **expected-token** — 缺少预期的符号（如 `}` 或 `)`）。
- **invalid-script** — `<script>` 块内容不是合法的 JavaScript / TypeScript。
- **absolute-path-in-import** — 导入路径必须是相对路径（以 `./` 或 `../` 开头），不能使用绝对路径。
- **cannot-load-module** — 无法加载所导入的模块，请检查路径拼写与依赖是否安装。
- **module-not-found** — 找不到指定的模块。
- **each-invalid** — `{#each}` 表达式语法无效，应为 `each <表达式> as <项>`（可加 `, <索引>`）。
- **if-invalid** — `{#if}` 表达式语法无效。
- **css-invalid-global-selector** — `:global()` 中使用了无效或过于宽泛的选择器。

```svelte
<!-- 错误示例：导入路径不是相对路径 -->
<script>
	import App from '/App.svelte';
</script>
```

## Server errors

- **render_invalid_argument** — 调用 `render` 时传入的参数无效。
- **render_outside_server** — 在服务端渲染 API 被用在非服务端环境中。

## Shared errors

- **unknown-error** — 未被分类的编译错误，通常伴随详细堆栈信息。

> [!NOTE]
> 编译错误会阻止构建，需修复后才能继续。每个错误都带有 `code` 字段，可用于精确排查。
