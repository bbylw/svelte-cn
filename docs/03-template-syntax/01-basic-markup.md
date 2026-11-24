---
title: 基础标记
---

Svelte 组件内部的标记可以看作 HTML++。

## 标签

小写标签（如 `<div>`）表示一个普通的 HTML 元素。首字母大写的标签，或使用点表示法的标签（如 `<Widget>` 或 `<my.stuff>`），则表示一个_组件_。

```svelte
<script>
	import Widget from './Widget.svelte';
</script>

<div>
	<Widget />
</div>
```

## 元素属性

默认情况下，属性的行为与它们在 HTML 中的对应物完全一致。

```svelte
<div class="foo">
	<button disabled>can't touch this</button>
</div>
```

和 HTML 一样，属性值可以不加引号。

<!-- prettier-ignore -->
```svelte
<input type=checkbox />
```

属性值可以包含 JavaScript 表达式。

```svelte
<a href="page/{p}">page {p}</a>
```

或者它们本身_就是_ JavaScript 表达式。

```svelte
<button disabled={!clickable}>...</button>
```

布尔属性在其值为[真值](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)时会被包含在元素上，在值为[假值](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)时则被排除。

所有其他属性都会被包含，除非其值为[空值](https://developer.mozilla.org/en-US/docs/Glossary/Nullish)（`null` 或 `undefined`）。

```svelte
<input required={false} placeholder="This input field is not required" />
<div title={null}>This div has no title attribute</div>
```

> [!NOTE] 给单个表达式加引号不会影响值的解析方式，但在 Svelte 6 中会导致该值被强制转换为字符串：
>
> <!-- prettier-ignore -->
> ```svelte
> <button disabled="{number !== 42}">...</button>
> ```

当属性名与值同名（`name={name}`）时，可以简写为 `{name}`。

```svelte
<button {disabled}>...</button>
<!-- equivalent to
<button disabled={disabled}>...</button>
-->
```

## 组件 props {#Component-props}

按惯例，传递给组件的值被称为_属性_（properties）或 props，而不是_属性_（attributes，那是 DOM 的特性）。

与元素一样，`name={name}` 也可以简写为 `{name}`。

```svelte
<Widget foo={bar} answer={42} text="hello" />
```

## 展开属性

_展开属性_允许一次性将许多属性或特性传递给元素或组件。

一个元素或组件可以有多个展开属性，并与普通属性交错使用。顺序很重要——如果 `things.a` 存在，它会优先于 `a="b"`，而 `c="d"` 会优先于 `things.c`：

```svelte
<Widget a="b" {...things} c="d" />
```

## 事件

通过向元素添加以 `on` 开头的属性，就可以监听 DOM 事件。例如，要监听 `click` 事件，只需给按钮添加 `onclick` 属性：

```svelte
<button onclick={() => console.log('clicked')}>click me</button>
```

事件属性是大小写敏感的。`onclick` 监听 `click` 事件，`onClick` 监听 `Click` 事件，二者不同。这确保你可以监听名称中包含大写字符的自定义事件。

由于事件本质上就是属性，因此适用于属性的规则同样适用：

- 可以使用简写形式：`<button {onclick}>click me</button>`
- 可以展开它们：`<button {...thisSpreadContainsEventAttributes}>click me</button>`

从时序上看，事件属性总是在绑定产生的事件之后触发（例如 `oninput` 总是在 `bind:value` 更新之后触发）。在底层，部分事件处理器通过 `addEventListener` 直接绑定，而另一些则是_委托_的。

当使用 `ontouchstart` 和 `ontouchmove` 事件属性时，处理器是[被动的](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#using_passive_listeners)，以获得更好的性能。这可以大幅提升响应速度，因为浏览器可以立即滚动文档，而无需等待事件处理器是否调用了 `event.preventDefault()`。

在极少数需要阻止这些事件默认行为的情况下，你应该改用 [`on`](svelte-events#on)（例如在 action 内部）。

### 事件委托

为了减少内存占用并提升性能，Svelte 使用了一种称为事件委托的技术。这意味着对于某些事件——见下方列表——应用根节点上的单个事件监听器将负责执行事件路径上的所有处理器。

有几个需要注意的坑：

- 当你手动派发一个带有委托监听器的事件时，务必设置 `{ bubbles: true }` 选项，否则事件无法到达应用根节点
- 当直接使用 `addEventListener` 时，避免调用 `stopPropagation`，否则事件无法到达应用根节点，处理器也不会被调用。同样地，在应用根节点内部手动添加的处理器，会_先于_在 DOM 更深处以声明式添加的处理器（例如 `onclick={...}`）运行，无论在捕获阶段还是冒泡阶段都是如此。出于这些原因，最好使用从 `svelte/events` 导入的 `on` 函数，而不是 `addEventListener`，因为它能确保执行顺序被保留，并正确处理 `stopPropagation`。

以下事件处理器会被委托：

- `beforeinput`
- `click`
- `change`
- `dblclick`
- `contextmenu`
- `focusin`
- `focusout`
- `input`
- `keydown`
- `keyup`
- `mousedown`
- `mousemove`
- `mouseout`
- `mouseover`
- `mouseup`
- `pointerdown`
- `pointermove`
- `pointerout`
- `pointerover`
- `pointerup`
- `touchend`
- `touchmove`
- `touchstart`

## 文本表达式

可以用花括号将 JavaScript 表达式作为文本包含进来。

```svelte
{expression}
```

值为 `null` 或 `undefined` 的表达式会被省略；所有其他值都会被[强制转换为字符串](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion)。

在 Svelte 模板中，可以使用 HTML 实体字符串来包含花括号：`{` 对应 `&lbrace;`、`&lcub;` 或 `&#123;`，`}` 对应 `&rbrace;`、`&rcub;` 或 `&#125;`。

如果你使用的是正则表达式（`RegExp`）的[字面量表示法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#literal_notation_and_constructor)，则需要将其包裹在括号中。

<!-- prettier-ignore -->
```svelte
<h1>Hello {name}!</h1>
<p>{a} + {b} = {a + b}.</p>

<div>{(/^[A-Za-z ]+$/).test(value) ? x : y}</div>
```

表达式会被字符串化并转义，以防止代码注入。如果你想渲染 HTML，请改用 `{@html}` 标签。

```svelte
{@html potentiallyUnsafeHtmlString}
```

> [!NOTE] 请确保要么对传入的字符串进行转义，要么仅用你可控的值填充它，以防止[XSS 攻击](https://owasp.org/www-community/attacks/xss/)

## 注释

你可以在组件内部使用 HTML 注释。

```svelte
<!-- this is a comment! --><h1>Hello world</h1>
```

以 `svelte-ignore` 开头的注释会禁用其后一段标记的警告。通常这些是无障碍（accessibility）相关的警告；请确保你禁用它们是有充分理由的。

```svelte
<!-- svelte-ignore a11y_autofocus -->
<input bind:value={name} autofocus />
```

你可以添加一个以 `@component` 开头的特殊注释，当在其他文件中将鼠标悬停在组件名称上时，该注释会显示出来。

````svelte
<!--
@component
- 你可以在这里使用 markdown。
- 你也可以在这里使用代码块。
- 用法：
  ```html
  <Main name="Aretha">
  ```
-->
<script>
	let { name } = $props();
</script>

<main>
	<h1>
		Hello, {name}
	</h1>
</main>
````

你也可以在标签内部的属性之间放置 JavaScript 风格的注释：

```svelte
<div
  // this is a comment!
  data-foo="bar"
>
  foo bar
</div>
```
