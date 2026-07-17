---
title: <svelte:document>
---

```svelte
<svelte:document onevent={handler} />
```

```svelte
<svelte:document bind:prop={value} />
```

与 `<svelte:window>` 类似，该元素让你可以向 `document` 上的事件（例如不会在 `window` 上触发的 `visibilitychange`）添加监听器。它还让你可以使用 [attachments](@attach) 作用于 `document`。

与 `<svelte:window>` 一样，该元素只能出现在组件的顶层，绝不能位于某个代码块或元素内部。

```svelte
<svelte:document onvisibilitychange={handleVisibilityChange} {@attach someAttachment} />
```

你也可以绑定到以下属性：

- `activeElement`
- `fullscreenElement`
- `pointerLockElement`
- `visibilityState`

全部都是只读的。
