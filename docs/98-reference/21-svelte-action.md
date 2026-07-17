---
title: svelte/action
---

该模块提供了 [actions](use) 相关的类型。actions 在功能上已被 [attachments](@attach) 取代，但在现有代码中仍可使用。

## Action 类型

```ts
type Action<Element, Parameter, Attributes> = (
	node: Element,
	parameter?: Parameter
) => void | ActionReturn<Parameter, Attributes>;
```

action 是挂载到元素上的函数，接收元素节点与可选参数，可返回一个包含生命周期钩子的对象：

```ts
import type { Action } from 'svelte/action';

const tooltip: Action<HTMLElement, string> = (node, text) => {
	// 初始化逻辑
	return {
		update(newText) {
			/* 参数变化时调用 */
		},
		destroy() {
			/* 元素销毁时调用 */
		}
	};
};
```

```svelte
<div use:tooltip={'提示内容'}>悬停我</div>
```
