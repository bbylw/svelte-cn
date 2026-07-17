---
title: 什么是 runes（符文）？
---

> [!NOTE] **rune** /ruːn/ _名词_
>
> 被用作神秘或魔法符号的字母或标记。

Runes（符文）是你在 `.svelte` 以及 `.svelte.js`/`.svelte.ts` 文件中用来控制 Svelte 编译器的符号。如果把 Svelte 看作一门语言，那么 runes 就是这门语法的一部分——它们属于_关键字_。

Runes 以 `$` 开头，看起来像函数：

```js
let message = $state('hello');
```

不过，它们与普通 JavaScript 函数有重要区别：

- 你无需导入它们——它们是语言的一部分
- 它们不是值——你不能把它们赋值给变量，也不能作为参数传递给函数
- 就像 JavaScript 关键字一样，它们只在特定位置有效（如果你把它们放在错误的位置，编译器会帮助你纠正）

> [!LEGACY]
> Runes 在 Svelte 5 之前并不存在。
