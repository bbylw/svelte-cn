---
title: {#key ...}
tags: template-key
---

```svelte
<!--- copy: false  --->
{#key expression}...{/key}
```

当表达式的值发生变化时，key 块会销毁并重建其内部内容。当它包裹组件时，会导致组件被重新实例化并重新初始化：

```svelte
{#key value}
	<Component />
{/key}
```

当你希望某个过渡在值发生变化时播放，它也很有用：

```svelte
{#key value}
	<div transition:fade>{value}</div>
{/key}
```
