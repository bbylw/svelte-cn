---
title: Svelte 5 迁移指南
---

第 5 版带来了彻底重构的语法与响应式系统。虽然一开始看起来有所不同，但很快你就会发现许多相似之处。本指南详细介绍其中的变化，并展示如何进行升级。同时，我们也提供了 _为什么_ 要做这些改动的相关信息。

你不必立即迁移到新语法——Svelte 5 仍然支持旧的 Svelte 4 语法，你可以混用：使用新语法的组件与使用旧语法的组件可以自由组合。我们预计许多人最初只需改动几行代码就能完成升级。同时还有一个 [迁移脚本](#Migration-script) 可以帮你自动完成其中许多步骤。

## 响应式语法变更

Svelte 5 的核心是全新的 runes API。Runes 本质上就是告诉 Svelte 如何进行响应式的编译器指令。从语法上看，runes 是以美元符号开头的一些函数。

### let → $state

在 Svelte 4 中，组件顶层的一个 `let` 声明会被隐式视为响应式。在 Svelte 5 中，一切更加明确：只有使用 `$state` rune 创建的变量才是响应式的。我们通过将计数器包裹在 `$state` 中，将其迁移到 runes 模式：

```svelte
<script>
	let count = +++$state(0)+++;
</script>
```

其余部分没有任何变化。`count` 仍然就是数字本身，你直接读写它，无需像 `.value` 或 `getCount()` 这样的包装器。

> [!DETAILS] 我们为什么这样做
> 顶层 `let` 隐式响应式运行得很好，但它意味着响应式是受限的——在其他任何地方声明的 `let` 都不是响应式的。这就迫使你在将顶层代码重构出来复用时，不得不求助于 store。这意味着你必须学习一套完全不同的响应式模型，而结果往往并不那么好用。因为在 Svelte 5 中响应式更加显式，你可以在组件顶层之外继续使用同一套 API。前往 [教程](/tutorial) 了解更多。

### $: → $derived/$effect

在 Svelte 4 中，组件顶层的一个 `$:` 语句可用于声明一个派生值，即完全由其他状态的计算结果所定义的状态。在 Svelte 5 中，这通过 `$derived` rune 来实现：

```svelte
<script>
	let count = $state(0);
	---$:--- +++const+++ double = +++$derived(count * 2)+++;
</script>
```

与 `$state` 一样，其余部分没有任何变化。`double` 仍然就是数字本身，你直接读取它，无需像 `.value` 或 `getDouble()` 这样的包装器。

`$:` 语句也可用于创建副作用。在 Svelte 5 中，这通过 `$effect` rune 来实现：

```svelte
<script>
	let count = $state(0);

	---$:---+++$effect(() =>+++ {
		if (count > 5) {
			alert('Count is too high!');
		}
	}+++);+++
</script>
```

注意 [`$effect` 的运行时机]($effect#Understanding-dependencies) 与 `$:` 不同。

> [!DETAILS] 我们为什么这样做
> `$:` 是一个很好的速记，上手容易：你可以在大多数代码前随手加一个 `$:`，它就能以某种方式工作。这种直观性也正是它的缺陷所在——当你的代码变得越复杂，它就越难推理。这段代码的意图是要创建一个派生值，还是创建一个副作用？使用 `$derived` 和 `$effect`，你需要多做一点前置决策（剧透：90% 的情况下你应该用 `$derived`），但未来的你以及团队中的其他开发者会更轻松。
>
> 此外还有一些难以察觉的陷阱：
>
> - `$:` 仅在渲染之前直接更新，这意味着你可能在两次重渲染之间读到陈旧的值
> - `$:` 每个 tick 只运行一次，这意味着语句运行的频率可能比你以为的要低
> - `$:` 的依赖是通过对依赖项的静态分析来确定的。这在大多数情况下有效，但在重构过程中可能会以微妙的方式出错——例如依赖项被移入一个函数后，就不再是可见的了
> - `$:` 语句还通过依赖项的静态分析来排序。在某些情况下可能会出现平局，从而导致排序错误，需要手动干预。在重构代码、某些依赖项不再可见时，排序也可能出错
>
> 最后，它对 TypeScript 不友好（我们的编辑器工具不得不绕一些弯才能让它对 TypeScript 有效），这也是让 Svelte 的响应式模型真正通用的一个阻碍。
>
> `$derived` 和 `$effect` 通过以下方式修复了所有这些问题：
>
> - 始终返回最新的值
> - 在需要稳定时尽可能频繁地运行
> - 在运行时确定依赖关系，因此不受重构影响
> - 按需执行依赖，因此不受排序问题影响
> - 对 TypeScript 友好

### export let → $props

在 Svelte 4 中，组件的属性是通过 `export let` 声明的。每个属性对应一个声明。在 Svelte 5 中，所有属性都通过 `$props` rune 以解构的方式声明：

```svelte
<script>
	---export let optional = 'unset';---
	---export let required;---
	+++let { optional = 'unset', required } = $props();+++
</script>
```

在以下几种情况下，声明属性会比写几个 `export let` 要复杂一些：

- 你想重命名某个属性，例如因为该名称是保留标识符（如 `class`）
- 你事先不知道还会期望哪些其他属性
- 你想把所有属性转发给另一个组件

这些情况在 Svelte 4 中都需要特殊语法：

- 重命名：`export { klass as class}`
- 其他属性：`$$restProps`
- 所有属性：`$$props`

在 Svelte 5 中，`$props` rune 让这一切变得简单直接，无需任何额外的 Svelte 专属语法：

- 重命名：使用属性重命名 `let { class: klass } = $props();`
- 其他属性：使用展开 `let { foo, bar, ...rest } = $props();`
- 所有属性：不解构 `let props = $props();`

```svelte
<script>
	---let klass = '';---
	---export { klass as class};---
	+++let { class: klass, ...rest } = $props();+++
</script>
<button class={klass} {...---$$restProps---+++rest+++}>click me</button>
```

> [!DETAILS] 我们为什么这样做
> `export let` 是争议较大的 API 决策之一，关于应该把属性视为 `export` 还是 `import` 曾有过很多争论。`$props` 没有这个特性。它与其他 runes 也保持一致，整体思路归结为"Svelte 中所有与响应式相关的特殊之处都是一个 rune"。
>
> 围绕 `export let` 还有诸多限制，需要额外的 API，如上所示。`$props` 将这一切统一到了一个极依赖常规 JavaScript 解构语法的语法概念中。

## 事件变更 {#Event-changes}

Svelte 5 对事件处理函数做了翻新。在 Svelte 4 中，我们使用 `on:` 指令来给元素附加事件监听器，而在 Svelte 5 中，它们变成了和其他属性一样的普通属性（换句话说——去掉冒号）：

```svelte
<script>
	let count = $state(0);
</script>

<button on---:---click={() => count++}>
	clicks: {count}
</button>
```

既然它们只是属性，你就可以使用常规的简写语法……

```svelte
<script>
	let count = $state(0);

	function onclick() {
		count++;
	}
</script>

<button {onclick}>
	clicks: {count}
</button>
```

……不过，在使用具名事件处理函数时，通常最好使用一个更具描述性的名称。

### 组件事件

在 Svelte 4 中，组件可以通过 `createEventDispatcher` 创建一个分发器来派发事件。

该函数在 Svelte 5 中已弃用。取而代之，组件应当接收 _回调 props_——也就是说，你应当把函数作为属性传给这些组件：

```svelte
<!--- file: App.svelte --->
<script>
	import Pump from './Pump.svelte';

	let size = $state(15);
	let burst = $state(false);

	function reset() {
		size = 15;
		burst = false;
	}
</script>

<Pump
	---on:---inflate={(power) => {
		size += power---.detail---;
		if (size > 75) burst = true;
	}}
	---on:---deflate={(power) => {
		if (size > 0) size -= power---.detail---;
	}}
/>

{#if burst}
	<button onclick={reset}>new balloon</button>
	<span class="boom">💥</span>
{:else}
	<span class="balloon" style="scale: {0.01 * size}">
		🎈
	</span>
{/if}
```

```svelte
<!--- file: Pump.svelte --->
<script>
	---import { createEventDispatcher } from 'svelte';---
	---const dispatch = createEventDispatcher();---

	+++let { inflate, deflate } = $props();+++
	let power = $state(5);
</script>

<button onclick={() => ---dispatch('inflate', power)---+++inflate(power)+++}>
	inflate
</button>
<button onclick={() => ---dispatch('deflate', power)---+++deflate(power)+++}>
	deflate
</button>
<button onclick={() => power--}>-</button>
Pump power: {power}
<button onclick={() => power++}>+</button>
```

### 冒泡事件

与其写 `<button on:click>` 来把事件从元素"转发"给组件，组件应当接收一个 `onclick` 回调 prop：

```svelte
<script>
	+++let { onclick } = $props();+++
</script>

<button ---on:click--- +++{onclick}+++>
	click me
</button>
```

注意，这也意味着你可以将事件处理函数和其他 props 一起"展开"到元素上，而不必逐个繁琐地转发每个事件：

```svelte
<script>
	let props = $props();
</script>

<button ---{...$$props} on:click on:keydown on:all_the_other_stuff--- +++{...props}+++>
	click me
</button>
```

### 事件修饰符

在 Svelte 4 中，你可以给处理函数添加事件修饰符：

```svelte
<button on:click|once|preventDefault={handler}>...</button>
```

修饰符专属于 `on:`，因此无法与现代事件处理函数配合使用。更好的做法是在处理函数内部直接加上 `event.preventDefault()` 之类的调用，因为这样一来所有逻辑都在一处，而非分散在处理函数和修饰符之间。

既然事件处理函数本身就是函数，你就可以按需创建自己的包装函数：

```svelte
<script>
	function once(fn) {
		return function (event) {
			if (fn) fn.call(this, event);
			fn = null;
		};
	}

	function preventDefault(fn) {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}
</script>

<button onclick={once(preventDefault(handler))}>...</button>
```

有三个修饰符——`capture`、`passive` 和 `nonpassive`——无法表示为包装函数，因为它们需要在绑定事件处理函数时（而非运行时）就应用上去。

对于 `capture`，我们将修饰符加到事件名上：

```svelte
<button onclickcapture={...}>...</button>
```

而要更改事件处理函数的 [`passive`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#using_passive_listeners) 选项，则不宜轻率为之。如果你确实有这样的用例——而你很可能并没有！——那么你需要使用一个 action 来亲自应用事件处理函数。

### 多个事件处理函数

在 Svelte 4 中，这是可行的：

```svelte
<button on:click={one} on:click={two}>...</button>
```

元素上重复的属性/property（现在也包括事件处理函数）是不允许的。应当改为：

```svelte
<button
	onclick={(e) => {
		one(e);
		two(e);
	}}
>
	...
</button>
```

在展开 props 时，本地事件处理函数必须放在展开 _之后_，否则有被覆盖的风险：

```svelte
<button
	{...props}
	onclick={(e) => {
		doStuff(e);
		props.onclick?.(e);
	}}
>
	...
</button>
```

> [!DETAILS] 我们为什么这样做
> `createEventDispatcher` 一直有点啰嗦：
>
> - 导入该函数
> - 调用该函数得到一个 dispatch 函数
> - 用字符串以及可能存在的 payload 调用该 dispatch 函数
> - 在另一端通过 `.detail` 属性取回 payload，因为事件本身始终是一个 `CustomEvent`
>
> 使用组件回调 props 一直都是可行的，但因为以前你必须通过 `on:` 来监听 DOM 事件，出于语法一致性的考量，使用 `createEventDispatch` 处理组件事件显得更合理。现在我们有了事件属性（`onclick`），情况正好反过来：回调 props 现在是更合理的选择。
>
> 移除事件修饰符可以说是一个看起来像是倒退的变更，对于那些喜欢事件修饰符简写语法的人来说尤其如此。考虑到它们使用频率并不高，我们用更小的表面积换取了更高的显式性。修饰符也存在不一致之处，因为其中大部分只能用在 DOM 元素上。
>
> 同一个事件的多个监听器也不再可行，但这本来多少也算一种反模式，因为它会损害可读性：如果属性很多，除非两个处理函数紧挨在一起，否则很难发现其实有两个处理器。它还暗示这两个处理器是相互独立的，而实际上 `one` 中的 `event.stopImmediatePropagation()` 会阻止 `two` 被调用。
>
> 通过弃用 `createEventDispatcher` 和 `on:` 指令，改用回调 props 和常规元素属性，我们：
>
> - 降低了 Svelte 的学习曲线
> - 移除了样板代码，尤其是围绕 `createEventDispatcher` 的那些
> - 减少了为可能没有监听器的事件创建 `CustomEvent` 对象的开销
> - 增加了展开事件处理函数的能力
> - 增加了能够知道哪些事件处理函数被提供给了组件的能力
> - 增加了能够表达某个事件处理函数是必需还是可选的能力
> - 增强了类型安全性（此前，Svelte 实际上无法保证某个组件不会派发某个特定事件）

## 用 snippets 取代 slots

在 Svelte 4 中，内容可以通过 slots 传给组件。Svelte 5 用更强大、更灵活的 snippets 取而代之，因此 slots 在 Svelte 5 中已被弃用。

不过它们仍然可以正常工作，而且你可以把 snippets 传给一个使用 slots 的组件：

```svelte
<!--- file: Child.svelte --->
<slot />
<hr />
<slot name="foo" message="hello" />
```

```svelte
<!--- file: Parent.svelte --->
<script>
	import Child from './Child.svelte';
</script>

<Child>
	default child content

	{#snippet foo({ message })}
		message from child: {message}
	{/snippet}
</Child>
```

（反过来则不成立——你不能把使用 slot 的内容传给一个使用 [`{@render ...}`](/docs/svelte/@render) 标签的组件。）

使用自定义元素时，你仍应像以前一样使用 `<slot />`。在未来的某个版本中，当 Svelte 移除其内部的 slots 实现时，它会原样保留这些 slot，即输出一个常规的 DOM 标签，而不是转换它。

### 默认内容

在 Svelte 4 中，向子组件传递一段 UI 最简单的方式是使用一个 `<slot />`。在 Svelte 5 中，这通过 `children` prop 来完成，然后用 `{@render children()}` 来显示：

```svelte
<script>
	+++let { children } = $props();+++
</script>

---<slot />---
+++{@render children?.()}+++
```

### 多个内容占位符

如果你想要多个 UI 占位符，以前必须使用具名 slots。在 Svelte 5 中，改用 props，随意命名，然后用 `{@render ...}` 渲染它们：

```svelte
<script>
	+++let { header, main, footer } = $props();+++
</script>

<header>
	---<slot name="header" />---
	+++{@render header()}+++
</header>

<main>
	---<slot name="main" />---
	+++{@render main()}+++
</main>

<footer>
	---<slot name="footer" />---
	+++{@render footer()}+++
</footer>
```

### 把数据传回去

在 Svelte 4 中，你会把一个数据传给 `<slot />`，然后在父组件中用 `let:` 取回它。在 Svelte 5 中，snippets 承担起了这个职责：

```svelte
<!--- file: App.svelte --->
<script>
	import List from './List.svelte';
</script>

<List items={['one', 'two', 'three']} ---let:item--->
	+++{#snippet item(text)}+++
		<span>{text}</span>
	+++{/snippet}+++
	---<span slot="empty">No items yet</span>---
	+++{#snippet empty()}
		<span>No items yet</span>
	{/snippet}+++
</List>
```

```svelte
<!--- file: List.svelte --->
<script>
	let { items, +++item, empty+++ } = $props();
</script>

{#if items.length}
	<ul>
		{#each items as entry}
			<li>
				---<slot item={entry} />---
				+++{@render item(entry)}+++
			</li>
		{/each}
	</ul>
{:else}
	---<slot name="empty" />---
	+++{@render empty?.()}+++
{/if}
```

> [!DETAILS] 我们为什么这样做
> Slots 上手很容易，但用例越高级，语法就越复杂、越令人困惑：
>
> - `let:` 语法让很多人感到困惑，因为它 _创建_ 了一个变量，而其他所有 `:` 指令都是 _接收_ 一个变量
> - 用 `let:` 声明的变量作用域并不清晰。在上面的例子中，看起来你似乎可以在 `empty` slot 中使用 `item` slot 的 prop，但事实并非如此
> - 具名 slots 必须使用 `slot` 属性应用到一个元素上。有时你并不想创建一个元素，于是我们不得不新增 `<svelte:fragment>` API
> - 具名 slots 也可以应用到一个组件上，这改变了 `let:` 指令可用位置的语义（直到今天，我们维护者自己也常常搞不清它到底是怎样生效的）
>
> Snippets 通过更强的可读性和清晰度解决了所有这些问题。与此同时它们也更强大，因为你可以定义一段 UI，并将其渲染到 _任何地方_，而不仅仅是作为 prop 传给某个组件。

## 迁移脚本 {#Migration-script}

至此，你应该已经对前后对比、以及旧语法与新语法的对应关系有了相当清晰的理解。你可能也意识到，这些迁移中有很多相当技术性且重复——而这正是你不愿意手动去做的事情。

我们也这么认为，因此我们提供了一个迁移脚本来自动完成大部分迁移。你可以使用 `npx sv migrate svelte-5` 来升级你的项目。它会做以下事情：

- 提升你 `package.json` 中的核心依赖
- 迁移到 runes（`let` → `$state` 等）
- 为 DOM 元素迁移到事件属性（`on:click` → `onclick`）
- 将 slot 创建迁移为 render 标签（`<slot />` → `{@render children()}`）
- 将 slot 使用迁移为 snippets（`<div slot="x">...</div>` → `{#snippet x()}<div>...</div>{/snippet}`）
- 迁移明显的组件创建（`new Component(...)` → `mount(Component, ...)`）

你也可以在 VS Code 中通过 `Migrate Component to Svelte 5 Syntax` 命令迁移单个组件，或在我们的 Playground 中通过 `Migrate` 按钮迁移。

并非一切都能自动迁移，有些迁移在之后需要手动清理。接下来的几节会更详细地描述这些内容。

### run

你可能会看到迁移脚本将你的一些 `$:` 语句转换为一个从 `svelte/legacy` 导入的 `run` 函数。当迁移脚本无法可靠地将某个语句迁移为 `$derived`，并判定它其实是个副作用时，就会发生这种情况。在某些情况下这可能判错，最好将其改成使用 `$derived`。在另一些情况下，这可能判对，但由于 `$:` 语句也会在服务器端运行，而 `$effect` 不会，因此将其如此转换并不安全。作为权宜之计，这里使用了 `run`。`run` 模拟了 `$:` 的大部分特征，它会在服务器端运行一次，并在客户端作为 `$effect.pre` 运行（`$effect.pre` 在变更应用到 DOM _之前_ 运行；大多数情况下你可能想用 `$effect`）。

```svelte
<script>
	---import { run } from 'svelte/legacy';---
	---run(() => {---
	+++$effect(() => {+++
		// 一些副作用代码
	})
</script>
```

### 事件修饰符

事件修饰符不适用于事件属性（例如你不能写 `onclick|preventDefault={...}`）。因此，在将事件指令迁移到事件属性时，我们需要一个函数形式的替代方案。它们从 `svelte/legacy` 导入，理想情况下应当被迁移掉，转而直接使用 `event.preventDefault()` 之类的方式。

```svelte
<script>
	---import { preventDefault } from 'svelte/legacy';---
</script>

<button
	onclick={---preventDefault---((event) => {
		+++event.preventDefault();+++
		// ...
	})}
>
	click me
</button>
```

### 不会被自动迁移的内容

迁移脚本不会转换 `createEventDispatcher`。你需要手动调整这些部分。它之所以不转换，是因为这样做风险太高——它可能导致组件的使用者出现破坏，而迁移脚本无法自行发现这一点。

迁移脚本不会转换 `beforeUpdate/afterUpdate`。它之所以不转换，是因为无法确定代码的实际意图。作为经验法则，你通常可以结合 `$effect.pre`（与 `beforeUpdate` 的运行时机相同）和 `tick`（从 `svelte` 导入，让你可以等到变更应用到 DOM 后再执行某些操作）来实现。

## 组件不再是类

在 Svelte 3 和 4 中，组件是类。在 Svelte 5 中，它们是函数，并且应当以不同的方式实例化。如果你需要手动实例化组件，应当改用 `mount` 或 `hydrate`（从 `svelte` 导入）。如果你在使用 SvelteKit 时看到此错误，请先尝试更新到最新版本的 SvelteKit，它已添加对 Svelte 5 的支持。如果你在没有 SvelteKit 的情况下使用 Svelte，你大概会有一个 `main.js` 文件（或类似文件）需要修改：

```js
+++import { mount } from 'svelte';+++
import App from './App.svelte'

---const app = new App({ target: document.getElementById("app") });---
+++const app = mount(App, { target: document.getElementById("app") });+++

export default app;
```

`mount` 和 `hydrate` 拥有完全一致的 API。区别在于 `hydrate` 会接管其目标内由 Svelte 服务端渲染的 HTML 并对其注水（hydrate）。二者都会返回一个对象，包含组件的导出以及潜在的可访问属性（若以 `accessors: true` 编译）。它们不再带有你可能熟悉的类组件 API 中的 `$on`、`$set` 和 `$destroy` 方法。它们的替代方案如下：

对于 `$on`，不要监听事件，而是通过 options 参数上的 `events` 属性传入。

```js
+++import { mount } from 'svelte';+++
import App from './App.svelte'

---const app = new App({ target: document.getElementById("app") });
app.$on('event', callback);---
+++const app = mount(App, { target: document.getElementById("app"), events: { event: callback } });+++
```

> [!NOTE] 注意，不推荐使用 `events`——应当 [改用回调](#Event-changes)

对于 `$set`，改用 `$state` 来创建一个响应式属性对象并操作它。如果你是在 `.js` 或 `.ts` 文件中执行此操作，请将后缀改为包含 `.svelte`，即 `.svelte.js` 或 `.svelte.ts`。

```js
+++import { mount } from 'svelte';+++
import App from './App.svelte'

---const app = new App({ target: document.getElementById("app"), props: { foo: 'bar' } });
app.$set({ foo: 'baz' });---
+++const props = $state({ foo: 'bar' });
const app = mount(App, { target: document.getElementById("app"), props });
props.foo = 'baz';+++
```

对于 `$destroy`，改用 `unmount`。

```js
+++import { mount, unmount } from 'svelte';+++
import App from './App.svelte'

---const app = new App({ target: document.getElementById("app"), props: { foo: 'bar' } });
app.$destroy();---
+++const app = mount(App, { target: document.getElementById("app") });
unmount(app);+++
```

作为权宜之计，你也可以使用 `createClassComponent` 或 `asClassComponent`（从 `svelte/legacy` 导入）实例化后保持与 Svelte 4 相同的已知 API。

```js
+++import { createClassComponent } from 'svelte/legacy';+++
import App from './App.svelte'

---const app = new App({ target: document.getElementById("app") });---
+++const app = createClassComponent({ component: App, target: document.getElementById("app") });+++

export default app;
```

如果这个组件不在你的掌控范围内，你可以使用 `compatibility.componentApi` 编译器选项来自动应用向后兼容，这意味着使用 `new Component(...)` 的代码无需修改即可继续工作（注意，这会为每个组件增加一点开销）。这还会为你通过 `bind:this` 获得的组件实例添加 `$set` 和 `$on` 方法。

```js
/// svelte.config.js
export default {
	compilerOptions: {
		compatibility: {
			componentApi: 4
		}
	}
};
```

注意，`mount` 和 `hydrate` _不是_ 同步的，因此在函数返回时，`onMount` 尚未被调用，promise 的待定块也尚未渲染（因为 `#await` 会等待一个微任务以等待一个可能立即 resolve 的 promise）。如果你需要这一保证，请在调用 `mount/hydrate` 之后调用 `flushSync`（从 `'svelte'` 导入）。

### 服务端 API 变更

类似地，为服务端渲染而编译的组件不再有 `render` 方法。取而代之，将该函数传给 `svelte/server` 中的 `render`：

```js
+++import { render } from 'svelte/server';+++
import App from './App.svelte';

---const { html, head } = App.render({ props: { message: 'hello' }});---
+++const { html, head } = render(App, { props: { message: 'hello' }});+++
```

在 Svelte 4 中，将一个组件渲染为字符串也会返回所有组件的 CSS。在 Svelte 5 中，默认不再如此，因为大多数情况下你使用的工具链会以其他方式处理它（例如 SvelteKit）。如果你需要 `render` 返回 CSS，可以将 `css` 编译器选项设为 `'injected'`，它会向 `head` 中添加 `<style>` 元素。

### 组件类型变更

从类转向函数的变化也反映在类型定义中：Svelte 4 的基类 `SvelteComponent` 已被弃用，改用新的 `Component` 类型，它定义了 Svelte 组件的函数形态。若要在 `d.ts` 文件中手动定义组件形态：

```ts
import type { Component } from 'svelte';
export declare const MyComponent: Component<{
	foo: string;
}>;
```

若要声明需要某个特定类型的组件：

```js
import { ComponentA, ComponentB } from 'component-library';
---import type { SvelteComponent } from 'svelte';---
+++import type { Component } from 'svelte';+++

---let C: typeof SvelteComponent<{ foo: string }> = $state(---
+++let C: Component<{ foo: string }> = $state(+++
	Math.random() ? ComponentA : ComponentB
);
```

两个工具类型 `ComponentEvents` 和 `ComponentType` 也已弃用。`ComponentEvents` 之所以过时，是因为事件现在被定义为回调 props；而 `ComponentType` 之所以过时，是因为新的 `Component` 类型本身就是组件类型（即 `ComponentType<SvelteComponent<{ prop: string }>>` 等价于 `Component<{ prop: string }>`）。

### bind:this 变更

因为组件不再是类，使用 `bind:this` 不再返回一个带有 `$set`、`$on` 和 `$destroy` 方法的类实例。它只返回实例的导出（`export function/const`），以及如果你使用了 `accessors` 选项时，为每个属性提供的一对 getter/setter。

## `<svelte:component>` 不再必要 {#svelte:component-is-no-longer-necessary}

在 Svelte 4 中，组件是 _静态的_——如果你渲染 `<Thing>`，而 `Thing` 的值发生变化，[什么也不会发生](/playground/7f1fa24f0ab44c1089dcbb03568f8dfa?version=4.2.18)。为了让它动态化，你必须使用 `<svelte:component>`。

在 Svelte 5 中这已不再成立：

```svelte
<script>
	import A from './A.svelte';
	import B from './B.svelte';

	let Thing = $state();
</script>

<select bind:value={Thing}>
	<option value={A}>A</option>
	<option value={B}>B</option>
</select>

<!-- 以下两者等价 -->
<Thing />
<svelte:component this={Thing} />
```

在迁移时请记住，你的组件名应当大写（`Thing`）以区别于元素，除非使用的是点记法。

### 点记法表示组件

在 Svelte 4 中，`<foo.bar>` 会创建一个标签名为 `"foo.bar"` 的元素。在 Svelte 5 中，`foo.bar` 会被当作一个组件。这在 `each` 块内部尤其有用：

```svelte
{#each items as item}
	<item.component {...item.props} />
{/each}
```

## 空白处理变更

此前，Svelte 采用了一套非常复杂的算法来决定是否保留空白。Svelte 5 简化了这一规则，让开发者更容易推理。规则如下：

- 节点之间的空白会被折叠为一个空白符
- 标签开头和结尾处的空白会被完全移除

  这一新行为与原生 HTML 渲染略有不同。例如，`<p>foo<span> - bar</span></p>` 会渲染为：

  - HTML 中：`foo - bar`
  - Svelte 5 中：`foo- bar`

  你可以通过将缺失的空格移到 `<span>` 外来重新引入它……

  ```svelte
  <p>foo <span>- bar</span></p>
  ```

  ……或者，如果出于样式原因有必要，将其作为表达式包含进来：

  ```svelte
  <p>foo<span>{' '}- bar</span></p>
  ```

- 某些例外情况适用，例如 `pre` 标签内的空白会被保留

和以前一样，你可以通过在编译器设置中设置 `preserveWhitespace` 选项，或在 `<svelte:options>` 中按组件设置，来禁用空白裁剪。

## 需要现代浏览器

Svelte 5 需要现代浏览器（换句话说，不是 Internet Explorer），原因有多种：

- 它使用了 [`Proxies`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- 带有 `clientWidth`/`clientHeight`/`offsetWidth`/`offsetHeight` 绑定的元素使用 [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)，而非复杂的 `<iframe>` 技巧
- `<input type="range" bind:value={...} />` 只使用 `input` 事件监听器，而不再额外监听 `change` 事件作为回退

用于生成体积更大但对 IE 友好的代码的 `legacy` 编译器选项已不复存在。

## 编译器选项变更

- 从 `css` 选项中移除了 `false`/`true`（此前已弃用）以及 `"none"` 这些有效取值
- `legacy` 选项被重新利用
- 移除了 `hydratable` 选项。Svelte 组件现在始终是可燃水的（hydratable）
- 移除了 `enableSourcemap` 选项。现在始终会生成 source map，工具链可以选择忽略它
- 移除了 `tag` 选项。请改用组件内部的 `<svelte:options customElement="tag-name" />`
- 移除了 `loopGuardTimeout`、`format`、`sveltePath`、`errorMode` 和 `varsReport` 选项

## `children` prop 是保留的

组件标签内部的内容会变成一个名为 `children` 的 snippet prop。你不能再有一个同名的独立 prop。

## runes 模式下的破坏性变更

一些破坏性变更仅在你组件处于 runes 模式时才生效。

### 不允许绑定到组件导出

runes 模式组件的导出不能被直接绑定。例如，在组件 `A` 中有 `export const foo = ...`，然后写 `<A bind:foo />` 会引发错误。请改用 `bind:this`——`<A bind:this={a} />`——然后以 `a.foo` 的方式访问该导出。这一变更让事情更容易推理，因为它强制在 props 和导出之间做出清晰划分。

### 绑定需要使用 `$bindable()` 显式声明

在 Svelte 4 语法中，每个属性（通过 `export let` 声明）都是可绑定的，也就是说你可以对其使用 `bind:`。在 runes 模式中，属性默认不可绑定：你需要用 `$bindable` rune 来标记可绑定的 props。

如果一个可绑定属性有默认值（例如 `let { foo = $bindable('bar') } = $props();`），那么在对它进行绑定时，你需要向该属性传入一个非 `undefined` 的值。这能避免模棱两可的行为——父组件和子组件必须具有相同的值——并且带来更好的性能（在 Svelte 4 中，默认值会被反映回父组件，导致浪费性的额外渲染周期）。

### `accessors` 选项被忽略

将 `accessors` 选项设为 `true` 会让组件的属性可以直接在组件实例上访问。

```svelte
<svelte:options accessors={true} />

<script>
	// 可通过 componentInstance.name 访问
	export let name;
</script>
```

在 runes 模式中，属性永远无法在组件实例上访问。如果你需要暴露它们，可以改用组件导出。

```svelte
<script>
	let { name } = $props();
	// 可通过 componentInstance.getName() 访问
	export const getName = () => name;
</script>
```

或者，如果组件实例化的地方在你的掌控范围内，你也可以通过将 `.js/.ts` 文件后缀改为包含 `.svelte`（即 `.svelte.js` 或 `.svelte.ts`），在文件内部使用 runes，然后改用 `$state`：

```js
+++import { mount } from 'svelte';+++
import App from './App.svelte'

---const app = new App({ target: document.getElementById("app"), props: { foo: 'bar' } });
app.foo = 'baz'---
+++const props = $state({ foo: 'bar' });
const app = mount(App, { target: document.getElementById("app"), props });
props.foo = 'baz';+++
```

### `immutable` 选项被忽略

设置 `immutable` 选项在 runes 模式中没有任何效果。这一概念已被 `$state` 及其变体的工作方式所取代。

### 类不再是"自动响应式"的

在 Svelte 4 中，执行以下操作会触发响应式：

```svelte
<script>
	let foo = new Foo();
</script>

<button on:click={() => (foo.value = 1)}>{foo.value}</button
>
```

这是因为 Svelte 编译器将对 `foo.value` 的赋值视为一条更新所有引用了 `foo` 之处的指令。在 Svelte 5 中，响应式是在运行时而非编译时确定的，因此你应当将 `value` 定义为 `Foo` 类上一个响应式的 `$state` 字段。用 `$state(...)` 包裹 `new Foo()` 不会有任何效果——只有普通对象和数组才会被深度响应式化。

### 触摸事件是 passive 的

当使用 `ontouchstart` 和 `ontouchmove` 事件属性时，这些处理函数是 [passive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#using_passive_listeners) 的，以与浏览器默认行为保持一致。这通过让浏览器可以立即滚动文档，而无需等待事件处理函数是否调用了 `event.preventDefault()`，从而极大地提升了响应速度。

在极少数你需要阻止这些事件默认行为的情况下，应当改用 [`on`](/docs/svelte/svelte-events#on)（例如在一个 action 内部）。

### 属性/prop 语法更加严格

在 Svelte 4 中，复杂的属性值不必加引号：

<!-- prettier-ignore -->
```svelte
<Component prop=this{is}valid />
```

这是一个陷阱（footgun）。在 runes 模式中，如果你想拼接内容，必须将值包裹在引号中：

```svelte
<Component prop="this{is}valid" />
```

注意，Svelte 5 还会在你用引号包裹单个表达式时发出警告，例如 `answer="{42}"`——在 Svelte 6 中，这会导致该值被转换为字符串，而非作为数字传入。

### HTML 结构更加严格

在 Svelte 4 中，你可以编写在服务器端渲染时会被浏览器修复的 HTML 代码。例如你可以写这个……

```svelte
<table>
	<tr>
		<td>hi</td>
	</tr>
</table>
```

……浏览器会自动插入一个 `<tbody>` 元素：

```svelte
<table>
	<tbody>
		<tr>
			<td>hi</td>
		</tr>
	</tbody>
</table>
```

Svelte 5 对 HTML 结构更加严格，并在浏览器本应修复 DOM 的情况下抛出编译器错误。

## 其他破坏性变更

### 更严格的 `@const` 赋值校验

不再允许对 `@const` 声明中解构出的部分进行赋值。这曾经被允许是个疏漏。

### `:is(...)`、`:has(...)` 和 `:where(...)` 是作用域内的

此前，Svelte 不会分析 `:is(...)`、`:has(...)` 和 `:where(...)` 内部的择器，实际上将它们当作全局的。Svelte 5 会在当前组件的上下文中分析它们。因此，如果某些选择器此前依赖这种处理方式，现在可能会被视为未被使用。要修复这个问题，请在 `:is(...)/:has(...)/:where(...)` 选择器内部使用 `:global(...)`。

当使用 Tailwind 的 `@apply` 指令时，请添加一个 `:global` 选择器，以保留那些使用 Tailwind 生成的 `:is(...)` 选择器的规则：

<!-- prettier-ignore -->
```css
main +++:global+++ {
	@apply bg-blue-100 dark:bg-blue-900;
}
```

### CSS 哈希位置不再确定

此前 Svelte 总会把 CSS 哈希插入到最后。Svelte 5 中不再对此做保证。只有当你的 [CSS 选择器非常奇怪](https://stackoverflow.com/questions/15670631/does-the-order-of-classes-listed-on-an-item-affect-the-css) 时，这才会成为破坏性变更。

### 作用域 CSS 使用 :where(...)

为了避免由不可预测的特异性变化所引发的问题，作用域 CSS 选择器现在在 `.svelte-xyz123` 之外，还会配合使用 `:where(.svelte-xyz123)` 选择器修饰符（其中 `xyz123` 与以前一样，是 `<style>` 内容的哈希值）。你可以在 [这里](https://github.com/sveltejs/svelte/pull/10443) 阅读更多细节。

如果你需要支持不实现 `:where` 的古老浏览器，可以手动修改生成的 CSS，代价是出现不可预测的特异性变化：

```js
// @errors: 2552
css = css.replace(/:where\((.+?)\)/, '$1');
```

### 错误/警告代码已重命名

错误和警告代码已重命名。此前它们用连字符分隔单词，现在改用下划线（例如 foo-bar 变为 foo_bar）。此外，少数代码略有重写。

### 命名空间数量减少

你可以传给编译器选项 `namespace` 的有效命名空间已减少到 `html`（默认值）、`mathml` 和 `svg`。

`foreign` 命名空间只对 Svelte Native 有用，我们计划在某个 5.x 的次要版本中以不同方式支持它。

### beforeUpdate/afterUpdate 变更

`beforeUpdate` 在初始渲染时，如果它修改了模板中引用的某个变量，不再会运行两次。

父组件中的 `afterUpdate` 回调现在会在任何子组件的 `afterUpdate` 回调 _之后_ 运行。

当组件包含 `<slot>` 且其内容被更新时，`beforeUpdate/afterUpdate` 不再运行。

这两个函数在 runes 模式中都不允许使用——请改用 `$effect.pre(...)` 和 `$effect(...)`。

### `contenteditable` 行为变更

如果你有一个 `contenteditable` 节点，它既带有对应的绑定，又包含其中的一个响应式值（例如 `<div contenteditable=true bind:textContent>count is {count}</div>`），那么 contenteditable 内部的值不会随 `count` 的更新而更新，因为绑定会立即完全接管内容，内容只应通过绑定来更新。

### `oneventname` 属性不再接受字符串值

在 Svelte 4 中，可以将 HTML 元素上的事件属性指定为字符串：

```svelte
<button onclick="alert('hello')">...</button>
```

这不推荐，并且在 Svelte 5 中已不可行，在 Svelte 5 中，`onclick` 等属性取代 `on:click` 成为添加事件处理函数的机制。

### `null` 和 `undefined` 变为空字符串

在 Svelte 4 中，`null` 和 `undefined` 会被打印为对应的字符串。在 100 次里有 99 次，你希望它们变为空字符串，这也是大多数其他框架的做法。因此，在 Svelte 5 中，`null` 和 `undefined` 变为空字符串。

### `bind:files` 的值只能是 `null`、`undefined` 或 `FileList`

`bind:files` 现在是一个双向绑定。因此，在设置值时，它必须是 falsy 值（`null` 或 `undefined`）或 `FileList` 类型。

### 绑定现在会响应表单重置

此前，绑定不会考虑表单的 `reset` 事件，因此值可能与 DOM 不同步。Svelte 5 通过在 document 上放置一个 `reset` 监听器，并在必要时调用绑定来修复了这个问题。

### `walk` 不再被导出

`svelte/compiler` 此前为了方便，从 `estree-walker` 再导出了 `walk`。在 Svelte 5 中这已不再成立，如果你需要它，请直接从该包中导入。

### `svelte:options` 内部的内容被禁止

在 Svelte 4 中，你可以在 `<svelte:options />` 标签内部放置内容。这些内容会被忽略，但你可以写点东西进去。在 Svelte 5 中，该标签内部的内容会导致编译器错误。

### 声明式 shadow root 中的 `<slot>` 元素被保留

Svelte 4 会把所有地方的 `<slot />` 标签替换成它自己版本的 slots。Svelte 5 会在它们是 `<template shadowrootmode="...">` 元素的子元素时保留它们。

### `<svelte:element>` 标签必须是一个表达式

在 Svelte 4 中，`<svelte:element this="div">` 是有效的代码。这没什么意义——你本应直接写 `<div>`。在极罕见的你 _确实_ 需要出于某种原因使用字面量值时，可以这样做：

```svelte
<svelte:element this=+++{+++"div"+++}+++>
```

注意，Svelte 4 会将 `<svelte:element this="input">`（例如）与 `<input>` 同等对待，以决定哪些 `bind:` 指令可以应用，而 Svelte 5 则不会。

### `mount` 默认播放过渡

用于渲染组件树的 `mount` 函数默认会播放过渡，除非将 `intro` 选项设为 `false`。这与旧的类组件不同——类组件在手动实例化时默认不播放过渡。

### `<img src={...}>` 和 `{@html ...}` 的水合不匹配不会被修复

在 Svelte 4 中，如果 `src` 属性或 `{@html ...}` 标签的值在服务端和客户端之间不同（即水合不匹配），该不匹配会被修复。这代价非常高昂：设置一个 `src` 属性（即便它求值结果相同）会导致图片和 iframe 被重新加载，而重新插入一大块 HTML 也很慢。

由于这类不匹配极为罕见，Svelte 5 假设这些值未发生变化，但在开发环境中如果它们确实不同，会向你发出警告。要强制更新，你可以这样做：

```svelte
<script>
	let { markup, src } = $props();

	if (typeof window !== 'undefined') {
		// 暂存这些值……
		const initial = { markup, src };

		// 清空它们……
		markup = src = undefined;

		$effect(() => {
			// ……并在挂载后重置
			markup = initial.markup;
			src = initial.src;
		});
	}
</script>

{@html markup}
<img {src} />
```

### 水合工作方式不同

Svelte 5 在服务端渲染时使用注释，以实现在客户端更稳定高效的水合。因此，如果你打算对 HTML 输出进行水合，就不应移除其中的注释；如果你手动编写了要由 Svelte 组件水合的 HTML，你需要调整该 HTML，在正确位置包含上述注释。

### `onevent` 属性是委托的

事件属性取代了事件指令：不要写 `on:click={handler}`，而是写 `onclick={handler}`。为了向后兼容，`on:event` 语法仍受支持，且行为与 Svelte 4 相同。不过，部分 `onevent` 属性是委托的，这意味着你需要注意不要手动阻止这些事件的传播，否则它们可能永远无法到达根节点处该事件类型的监听器。

### `--style-props` 使用了不同的元素

Svelte 5 在使用 CSS 自定义属性时，使用一个额外的 `<svelte-css-wrapper>` 元素来包裹组件，而非 `<div>`。

<!-- TODO in final docs, add link to corresponding section for more details -->
