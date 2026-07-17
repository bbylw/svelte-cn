---
title: 生命周期钩子
---

<!-- - onMount/onDestroy
- mention that `$effect` might be better for your use case
- beforeUpdate/afterUpdate with deprecation notice?
- or skip this entirely and only have it in the reference docs? -->

在 Svelte 5 中，组件的生命周期只包含两个部分：它的创建和它的销毁。介于两者之间的——当某些状态被更新时——并不与组件整体相关；只有那些需要对状态变化做出反应的部分才会被通知。这是因为在底层，变化的最小单位实际上并不是组件，而是组件在初始化时建立的（渲染）effects。因此，并不存在所谓的"更新前"/"更新后"钩子。

## `onMount`

`onMount` 函数会安排一个回调，在组件被挂载到 DOM 后立即运行。它必须在组件初始化期间被调用（但不需要_位于_组件内部；它可以从外部模块调用）。

`onMount` 不会在服务器端渲染的组件中运行。

```svelte
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('the component has mounted');
	});
</script>
```

如果从 `onMount` 返回一个函数，它会在组件被卸载时被调用。

```svelte
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		const interval = setInterval(() => {
			console.log('beep');
		}, 1000);

		return () => clearInterval(interval);
	});
</script>
```

> [!NOTE] 这一行为只有当传入 `onMount` 的函数是_同步_的时才会生效。`async` 函数总是返回一个 `Promise`。

## `onDestroy`

安排一个回调，在组件被卸载之前立即运行。

在 `onMount`、`beforeUpdate`、`afterUpdate` 和 `onDestroy` 之中，这是唯一会在服务端组件中运行的钩子。

```svelte
<script>
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('the component is being destroyed');
	});
</script>
```

## `tick`

虽然没有"更新后"钩子，但你可以使用 `tick` 来确保 UI 在继续之前已经更新。`tick` 返回一个 promise，一旦任何待处理的状态变更被应用，或者在下一个微任务（如果没有变更时）它就会 resolve。

```svelte
<script>
	import { tick } from 'svelte';

	$effect.pre(() => {
		console.log('the component is about to update');
		tick().then(() => {
				console.log('the component just updated');
		});
	});
</script>
```

## 已弃用：`beforeUpdate` / `afterUpdate`

Svelte 4 包含了在组件整体更新之前和之后运行的钩子。为了向后兼容，这些钩子在 Svelte 5 中被做了填充（shim），但在使用符文的组件中不可用。

```svelte
<script>
	import { beforeUpdate, afterUpdate } from 'svelte';

	beforeUpdate(() => {
		console.log('the component is about to update');
	});

	afterUpdate(() => {
		console.log('the component just updated');
	});
</script>
```

请改用 `$effect.pre` 来替代 `beforeUpdate`，用 `$effect` 来替代 `afterUpdate`——这些符文提供了更细粒度的控制，并且只对你真正感兴趣的变化做出反应。

### 聊天窗口示例

要实现一个在新消息出现时自动滚动到底部（但仅当你_已经_滚动到底部时）的聊天窗口，我们需要在更新 DOM 之前先测量它。

在 Svelte 4 中，我们使用 `beforeUpdate` 来做这件事，但这是一种有缺陷的方法——它会在_每一次_更新前触发，无论是否相关。在下面的示例中，我们需要引入像 `updatingMessages` 这样的检查，以确保在有人切换深色模式时不会干扰滚动位置。

使用符文，我们可以使用 `$effect.pre`，它的行为与 `$effect` 相同，但会在 DOM 更新之前运行。只要我们在 effect 函数体内显式引用 `messages`，它就会在 `messages` 变化时运行，但_不会_在 `theme` 变化时运行。

因此，`beforeUpdate` 及其同样麻烦的对应项 `afterUpdate` 在 Svelte 5 中已被弃用。

- [Before](/playground/untitled#H4sIAAAAAAAAE31WXa_bNgz9K6yL1QmWOLlrC-w6H8MeBgwY9tY9NfdBtmlbiywZkpyPBfnvo2zLcZK28AWuRPGI5OGhkEuQc4EmiL9eAskqDOLg97oOZoE9125jDigs0t6oRqfOsjap5rXd7uTO8qpW2sIFEsyVxn_qjFmcAcstar-xPN3DFXKtKgi768IVgQku0ELj3Lgs_kZjWIEGNpAzYXDlHWyJFZI1zJjeh4O5uvl_DY8oUkVeVoFuJKYls-_CGYS25Aboj0EtWNqel0wWoBoLTGZgmdgDS9zW4Uz4NsrswPHoyutN4xInkylstnBxdmIhh8m7xzqmoNE2Wq46n1RJQzEbq4g-JQSl7e-HDx-GdaTy3KD9E3lRWvj5Zu9QX1QN20dj7zyHz8s-1S6lW7Cpz3RnXTcm04hIlfdFuO8p2mQ5-3a06cqjrn559bF_2NHOnRZ5I1PLlXQNyQT-hedMHeUEDyjtdMxsa4n2eIbNhlTwhyRthaOKOmYtniwF6pwt0wXa6MBEg0OibZec27gz_dk3UrZ6hB2LLYoiv521Yd8Gt-foTrfhiCDP0lC9VUUhcDLU49Xe_9943cNvEArHfAjxeBTovvXiNpFynfEDpIIZs9kFbg52QbeNHWZzebz32s7xHco3nJAJl1nshmhz8dYOQJDyZetnbb2gTWe-vEeWlrfpZMavr56ldb29eNt6UXvgwgFbp_WC0tl2RK25rGk6lYz3nUI2lzvBXGHhPZPGWmKUXFNBKqdaW259wl_aHbiqoVIZdpE60Nax6IOujT0LbFFxIVTCxCRR2XloUcYNvSbnGHKBp763jHoj59xiZWJI0Wm0P_m3MSS985xkasn-cFq20xTDy3J5KFcjgUTD69BHdcHIjz431z28IqlxGcPSfdFnrGDZn6gD6lyo45zyHAD-btczf-98nhQxHEvKfeUtOVkSejD3q-9X7JbzjGtsdUxlKdFU8qGsT78uaw848syWMXz85Waq2Gnem4mAn3prweq4q6Y3JEpnqMmnPoFRgmd3ySW0LLRqSKlwYHriCvJvUs2yjMaaoA-XzTXLeGMe45zmhv_XAno3Mj0xF7USuqNvnE9H343QHlq-eAgxpbTPNR9yzUkgLjwSR0NK4wKoxy-jDg-9vy8sUSToakzW-9fX13Em9Q8T6Z26uZhBN36XUYo5q7ggLXBZoub2Ofv7g6GCZfTxe034NCjiudXj7Omla0eTfo7QBPOcYxbE7qG-vl3_B1G-_i_JCAAA)
- [After](/playground/untitled#H4sIAAAAAAAAE31WXa-jNhD9K7PsdknUQJLurtRLPqo-VKrU1327uQ8GBnBjbGSb5KZR_nvHgMlXtyIS9njO-MyZGZRzUHCBJkhez4FkNQZJ8HvTBLPAnhq3MQcUFmlvVKszZ1mbTPPGbndyZ3ndKG3hDJZne7hAoVUNYY8JV-RBPgIt2ArrhA18MpZZnIQ50_twuvLHNRrDSjRXj9fwiCJTBLIKdCsxq5j9EM4gtBU3QD8GjWBZd14xWYJqLTCZg2ViDyx1W4cz4dv0hsiB49FRHkyfsCgws3GjcTKZwmYLZ2feWc9o1W8zJQ2Fb62i5JUQRNRHgs-fx3WsisKg_RN5WVn4-WrvUd9VA9tH4-AcwbfFQIpkLWByvWzqSe2sk3kyjUlOec_XPU-3TRaz_75tuvKoi19e3OvipSpamVmupJM2F_gXnnJ1lBM8oLQjHceys8R7PMFms4HwD2lRhzeEe-EsvluSrHe2TJdo4wMTLY48XKwPzm0KGm2r5ajFtRYU4TWOY7-ddWHfxhDP0QkQhnf5PWRnVVkKnIx8fZsOb5dR16nwG4TCCRdCMphWQ7z1_DoOcp3zA2SCGbPZBa5jd0G_TRxmc36Me-mG6A7l60XIlMs8ce2-OXtrDyBItdz6qVjPadObzx-RZdV1nJjx64tXad1sz962njceOHfAzmk9JzrbXqg1lw3NkZL7vgE257t-uMDcO6attSSokpmgFqVMO2U93e_dDlzOUKsc-3t6zNZp6K9cG3sS2KGSUqiUiUmq8tNYoJwbmvpTAoXA96GyjCojI26xNglk6DpwOPm7NdRYp4ia0JL94bTqRiGB5WJxqFY37RGPoz3c6i4jP3rcUA7wmhqNywQW7om_YQ2L4UQdUBdCHSPiOQJ8bFcxHzeK0jKBY0XcV95SkCWlD9t-9eOM3TLKucauiyktJdpaPqT19ddF4wFHntsqgS-_XE01e48GMwnw02AtWZP02QyGVOkcNfk072CU4PkduZSWpVYt9SkcmJ64hPwHpWF5ziVls3wIFmmW89Y83vMeGf5PBxjcyPSkXNy10J18t3x6-a6CDtBq6SGklNKeazFyLahB3PVIGo2UbhOgGi9vKjzW_j6xVFFD17difXx5ebll0vwvkcGpn4sZ9MN3vqFYsJoL6gUuK9TcPrO_PxgzWMRfflSEr2NHPJf6lj1957rRpH8CNMG84JgHidUtXt4u_wK21LXERAgAAA==)

<!-- prettier-ignore -->
```svelte
<script>
	import { ---beforeUpdate, afterUpdate,--- tick } from 'svelte';

	---let updatingMessages = false;---
	let theme = +++$state('dark')+++;
	let messages = +++$state([])+++;

	let viewport;

	---beforeUpdate(() => {---
	+++$effect.pre(() => {+++
		---if (!updatingMessages) return;---
		+++messages;+++
		const autoscroll = viewport && viewport.offsetHeight + viewport.scrollTop > viewport.scrollHeight - 50;

		if (autoscroll) {
			tick().then(() => {
				viewport.scrollTo(0, viewport.scrollHeight);
			});
		}

		---updatingMessages = false;---
	});

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			const text = event.target.value;
			if (!text) return;

			---updatingMessages = true;---
			messages = [...messages, text];
			event.target.value = '';
		}
	}

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
	}
</script>

<div class:dark={theme === 'dark'}>
	<div bind:this={viewport}>
		{#each messages as message}
			<p>{message}</p>
		{/each}
	</div>

	<input +++onkeydown+++={handleKeydown} />

	<button +++onclick+++={toggle}> Toggle dark mode </button>
</div>
```
