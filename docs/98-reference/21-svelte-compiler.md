---
title: svelte/compiler
---

该模块提供了将 `.svelte` 组件源码编译为 JavaScript 的 API，常用于构建工具与 playground。

## compile

```js
function compile(
	source: string,
	options?: CompileOptions
): {
	js: { code: string; map: string };
	css: { code: string; map: string };
	warnings: Warning[];
	ast: Ast;
	vars: Var[];
	stats: { timings: Record<string, number> };
};
```

将组件源码编译为可在浏览器中运行的 JavaScript。常用选项：

- `generate` — `'dom'` | `'server'` | `'universal'`，决定输出目标
- `dev` — 是否包含开发时检查与警告
- `runes` — 是否按 runes 模式编译（`true` / `false` / `'auto'`）
- `css` — 样式输出方式（`'injected'` | `'external'` | `'none'`）
- `name` — 生成的组件类名

## parse

```js
function parse(source: string, options?: ParserOptions): Ast;
```

将组件源码解析为抽象语法树（AST），不生成代码。常用于静态分析。

## preprocess

```js
function preprocess(
	source: string,
	processors: Processors,
	options?: PreprocessorOptions
): Promise<Processed>;
```

对组件源码运行预处理插件（如类型检查、作用域样式等）。

## preprocessModule

```js
function preprocessModule(
	source: string,
	processors: Processors,
	options?: PreprocessorOptions
): Promise<Processed>;
```

对 `.svelte.js` / `.svelte.ts` 模块文件运行预处理。

## walk

```js
function walk(node: Node, visitors: Visitors): void;
```

遍历 AST 节点的辅助函数（基于 `zimmerframe`）。

## VERSION

```js
const VERSION: string;
```

当前 Svelte 编译器版本号。
