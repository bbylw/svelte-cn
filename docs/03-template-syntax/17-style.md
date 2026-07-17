---
title: style:
tags: template-style
---

`style:` 指令提供了一种在元素上设置多个样式的简写方式。

```svelte
<!-- These are equivalent -->
<div style:color="red">...</div>
<div style="color: red;">...</div>
```

值可以包含任意表达式：

```svelte
<div style:color={myColor}>...</div>
```

允许使用简写形式：

```svelte
<div style:color>...</div>
```

可以在单个元素上设置多个样式：

```svelte
<div style:color style:width="12rem" style:background-color={darkMode ? 'black' : 'white'}>...</div>
```

要将某个样式标记为重要，请使用 `|important` 修饰符：

```svelte
<div style:color|important="red">...</div>
```

当 `style:` 指令与 `style` 属性结合使用时，指令会优先，即使优先级高于 `!important` 属性：

```svelte
<div style:color="red" style="color: blue">This will be red</div>
<div style:color="red" style="color: blue !important">This will still be red</div>
```

你可以设置 CSS 自定义属性：

```svelte
<div style:--columns={columns}>...</div>
```
