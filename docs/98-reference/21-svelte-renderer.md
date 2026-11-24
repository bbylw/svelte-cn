---
title: svelte/renderer
---

该模块提供了用于编写[自定义渲染器](custom-renderers) 的 `createRenderer` 函数与 `Renderer` 类型。

## 可用 API

- `createRenderer` — 创建渲染器对象并为其提供类型安全（参数会原样返回）
- `Renderer` — 描述渲染器节点类型的 TypeScript 类型

```js
// @noErrors
/// file: renderer.js
import { createRenderer } from 'svelte/renderer';

export default createRenderer({
	createFragment() {
		// ...
	}
	// ...
});
```

更多细节（包括每个需要实现的方法、交叉（crossing）处理以及 TypeScript 用法）参见[自定义渲染器](custom-renderers) 指南。
