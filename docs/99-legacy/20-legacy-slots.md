---
title: <slot>
---

在 Svelte 5 中，内容可以以 [代码片段（snippets）](snippet) 的形式传给组件，并使用 [render 标签](@render) 渲染。

在 legacy 模式中，组件标签内部的内容被视为 _插槽内容（slotted content）_，组件可以通过一个 `<slot>` 元素将其渲染出来：

```svelte
<!--- file: App.svelte --->
<script>
	import Modal from './Modal.svelte';
</script>

<Modal>这是一些插槽内容</Modal>
```

```svelte
<!--- file: Modal.svelte --->
<div class="modal">
	<slot></slot>
</div>
```

> [!NOTE] 如果你想渲染一个普通的 `<slot>` 元素，可以使用 `<svelte:element this={'slot'} />`。

## 具名插槽

除了默认插槽，一个组件还可以拥有 _具名_ 插槽。在父组件一侧，在组件标签内部直接给某个元素、组件或 [`<svelte:fragment>`](legacy-svelte-fragment) 加上一个 `slot="..."` 属性。

```svelte
<!--- file: App.svelte --->
<script>
	import Modal from './Modal.svelte';

	let open = true;
</script>

{#if open}
	<Modal>
		这是一些插槽内容

		+++<div slot="buttons">+++
			<button on:click={() => open = false}>
				close
			</button>
		+++</div>+++
	</Modal>
{/if}
```

在子组件一侧，添加一个对应的 `<slot name="...">` 元素：

```svelte
<!--- file: Modal.svelte --->
<div class="modal">
	<slot></slot>
	<hr>
	+++<slot name="buttons"></slot>+++
</div>
```

## 回退内容

如果没有提供插槽内容，组件可以通过在 `<slot>` 元素内部放置内容来定义回退内容：

```svelte
<slot>
	如果没有提供插槽内容，就会渲染这里
</slot>
```

## 向插槽内容传递数据

插槽可以被渲染零次或多次，并且可以通过 props 将值 _传回_ 父组件。父组件使用 `let:` 指令将这些值暴露给插槽模板。

```svelte
<!--- file: FancyList.svelte --->
<ul>
	{#each items as data}
		<li class="fancy">
			<!-- 这里的 'item' …… -->
			<slot item={process(data)} />
		</li>
	{/each}
</ul>
```

```svelte
<!--- file: App.svelte --->
<!-- ……对应这里的 'item'： -->
<FancyList {items} let:item={processed}>
	<div>{processed.text}</div>
</FancyList>
```

常规的简写规则同样适用——`let:item` 等价于 `let:item={item}`，而 `<slot {item}>` 等价于 `<slot item={item}>`。

具名插槽也可以暴露值。`let:` 指令放在带有 `slot` 属性的那个元素上。

```svelte
<!--- file: FancyList.svelte --->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot name="item" item={process(data)} />
		</li>
	{/each}
</ul>

<slot name="footer" />
```

```svelte
<!--- file: App.svelte --->
<FancyList {items}>
	<div slot="item" let:item>{item.text}</div>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</FancyList>
```
