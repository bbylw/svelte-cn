---
title: <svelte:body>
---

```svelte
<svelte:body onevent={handler} />
```

与 `<svelte:window>` 类似，该元素让你可以向 `document.body` 上的事件（例如不会在 `window` 上触发的 `mouseenter` 和 `mouseleave`）添加监听器。它还让你可以使用 [actions](use) 作用于 `<body>` 元素。

与 `<svelte:window>` 和 `<svelte:document>` 一样，该元素只能出现在组件的顶层，绝不能位于某个代码块或元素内部。

```svelte
<svelte:body onmouseenter={handleMouseenter} onmouseleave={handleMouseleave} use:someAction />
```
