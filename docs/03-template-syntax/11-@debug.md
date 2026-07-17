---
title: {@debug ...}
---

`{@debug ...}` 标签提供了一种 `console.log(...)` 之外的替代方案。它会在特定变量发生变化时记录其值，并在你打开开发者工具时暂停代码执行。

```svelte
<script>
	let user = {
		firstname: 'Ada',
		lastname: 'Lovelace'
	};
</script>

{@debug user}

<h1>Hello {user.firstname}!</h1>
```

`{@debug ...}` 接受以逗号分隔的变量名列表（而不是任意表达式）。

```svelte
<!-- Compiles -->
{@debug user}
{@debug user1, user2, user3}

<!-- WON'T compile -->
{@debug user.firstname}
{@debug myArray[0]}
{@debug !isReady}
{@debug typeof user === 'object'}
```

不带任何参数的 `{@debug}` 标签会插入一个 `debugger` 语句，它会在_任何_状态发生变化时触发，而不是仅在指定变量变化时触发。
