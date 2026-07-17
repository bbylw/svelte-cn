---
title: {@html ...}
tags: template-html
---

要向组件中注入原始 HTML，请使用 `{@html ...}` 标签：

```svelte
<article>
	{@html content}
</article>
```

> [!NOTE] 请确保要么对传入的字符串进行转义，要么仅用你可控的值填充它，以防止[XSS 攻击](https://owasp.org/www-community/attacks/xss/)。切勿渲染未经净化的内容。

表达式应该是有效的独立 HTML——下面这样是行不通的，因为 `</div>` 不是有效的 HTML：

```svelte
{@html '<div>'}content{@html '</div>'}
```

它也不会编译 Svelte 代码。

## 样式

以这种方式渲染的内容对 Svelte 来说是"不可见"的，因此不会获得[作用域样式](scoped-styles)。换句话说，下面这样不会生效，并且 `a` 与 `img` 的样式会被当作未使用：

<!-- prettier-ignore -->
```svelte
<article>
	{@html content}
</article>

<style>
	article {
		a { color: hotpink }
		img { width: 100% }
	}
</style>
```

相反，可以使用 `:global` 修饰符来选中 `<article>` 内部的所有内容：

<!-- prettier-ignore -->
```svelte
<style>
	article +++:global+++ {
		a { color: hotpink }
		img { width: 100% }
	}
</style>
```
