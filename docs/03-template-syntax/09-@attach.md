---
title: {@attach ...}
tags: attachments
---

附件（attachments）是一些函数，当元素被挂载到 DOM 时，或当函数内部读取的[状态]($state) 发生更新时，它们会在一个[effect]($effect) 中运行。

可选地，它们可以返回一个函数，该函数在附件重新运行之前，或元素之后从 DOM 中移除时被调用。

> [!NOTE]
> 附件在 Svelte 5.29 及更高版本中可用。

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {import('svelte/attachments').Attachment} */
	function myAttachment(element) {
		console.log(element.nodeName); // 'DIV'

		return () => {
			console.log('cleaning up');
		};
	}
</script>

<div {@attach myAttachment}>...</div>
```

一个元素可以拥有任意数量的附件。

## 附件工厂

一种有用的模式是让某个函数（例如下面示例中的 `tooltip`）_返回_一个附件（[演示](/playground/untitled#H4sIAAAAAAAAE3VT0XLaMBD8lavbDiaNCUlbHhTItG_5h5AH2T5ArdBppDOEMv73SkbGJGnH47F9t3un3TsfMyO3mInsh2SW1Sa7zlZKo8_E0zHjg42pGAjxBPxp7cTvUHOMldLjv-IVGUbDoUw295VTlh-WZslqa8kxsLL2ACtHWxh175NffnQfAAGikSGxYQGfPEvGfPSIWtOH0TiBVo2pWJEBJtKhQp4YYzjG9JIdcuMM5IZqHMPioY8vOSA997zQoevf4a7heO7cdp34olRiTGr07OhwH1IdoO2A7dLMbwahZq6MbRhKZWqxk7rBxTGVbuHmhCgb5qDgmIx_J6XtHHukHTrYYqx_YpzYng8aO4RYayql7hU-1ZJl0akqHBE_D9KLolwL-Dibzc7iSln9XjtqTF1UpMkJ2EmXR-BgQErsN4pxIJKr0RVO1qrxAqaTO4fbc9bKulZm3cfDY3aZDgvFGErWjmzhN7KmfX5rXyDeX8Pt1mU-hXjdBOrtuB97vK4GPUtmJ41XcRMEGDLD8do0nJ73zhUhSlyRw0t3vPqD8cjfLs-axiFgNBrkUd9Ulp50c-GLxlXAVlJX-ffpZyiSn7H0eLCUySZQcQdXlxj4El0Yv_FZvIKElqqGTruVLhzu7VRKCh22_5toOyxsWqLwwzK-cCbYNdg-hy-p9D7sbiZWUnts_wLUOF3CJgQAAA==))：

```svelte
<!--- file: App.svelte --->
<script>
	import tippy from 'tippy.js';

	let content = $state('Hello!');

	/**
	 * @param {string} content
	 * @returns {import('svelte/attachments').Attachment}
	 */
	function tooltip(content) {
		return (element) => {
			const tooltip = tippy(element, { content });
			return tooltip.destroy;
		};
	}
</script>

<input bind:value={content} />

<button {@attach tooltip(content)}>
	Hover me
</button>
```

由于 `tooltip(content)` 表达式是在一个[effect]($effect) 内部运行的，因此每当 `content` 发生变化时，该附件都会被销毁并重新创建。对于在附件函数首次运行时_内部_读取的任何状态，也会发生同样的情况。（如果这不是你想要的，请参阅[控制附件何时重新运行](#Controlling-when-attachments-re-run)。）

## 内联附件

附件也可以以内联方式创建（[演示](/playground/untitled#H4sIAAAAAAAAE71Wf3OaWBT9KoyTTnW3MS-I3dYmnWXVtnRAazRJzbozRSQEApiRhwKO333vuY8m225m_9yZGOT9OPfcc84D943UTfxGr_G7K6Xr3TVeNW7D2M8avT_3DVk-YAoDNF4vNB8e2tnWjyXGlm7mPzfurVPpp5JgGmeZtwkf5PtFupCxLzVvHa832rl2lElX-s2Xm2DZFNqp_hs-rZetd4v07ORpT3qmQHu7MF2td0BZp8k6z_xkvfXP902_pZ2_1_aYWEiqm0kN8I4r79qbdZ6umnq3q_2iNf22F4dE6qt2oimwdpim_uY6XMm7Fuo-IQT_iTD_CeGTHwZ38ieIJUFQRxirR1Xf39Dw0X5z0I72Af4tD61vvPNwWKQnqmfPTbduhsEd2J3vO_oBd3dc6fF2X7umNdWGf0vBRhSS6qoV7cCXfTXWfKmvWG61_si_vfU92Wz-E4RhsLhNIYinsox9QKGVd8-tuACCeKXRX12P-T_eKf7fhTq0Hvt-f3ailtSeoxJHRo1-58NoPe1UiBc1hkL8Yeh45y_vQ3mcuNl9T8s3cXPRWLnS7YWJG_gn2Tb4tUjid8jua-PVl08j_ab8I14mH8Llx0s5Tz5Err4ql52r_GYg0mVy1bEGZuD0ze64b5TWYFiM-16wSuJ4JT5vfVpDcztrcG_YkRU4s6HxufzDWF4XuVeJ1P10IbzBemt3Vp1V2e04ZXfrJd7Wicyd039brRIv_RIVu_nXi7X1cfL2sy66ztToUp1TO7qJ7NlwZ0f30pld5qNSVE5o6PbMojFHjgZB7oSicPpGteyLclQap7SvY0dXtM_LR1NT2JFHey3aaxa0VxCeYJ7RMHemoiCcgPZV9pR7o7kgcOjeGliYk9hjDZx8FAq6enwlTPSZj_vYPw9Il64dXdIY8ZmapzwfEd8-1ZyaxWhqkIZOibXUd-6Upqi1pD4uMicCV1GA_7zi73UN8BaF4sC8peJtMjfmjbHZBFwq5ov50qRaE0l96NZggnW4KqypYRAW-uhSz9ADvklwJF2J-5W0Z5fQPBhDX92R6I_0IFxRgDftge4l4dP-gH1hjD7uqU6fsOEZ9UNrCdPB-nys6uXgY6O3ZMd9sy5T9PghqrWHdjo4jB51CgLiKJaDYYA-7WgYONf1FbjkI-mE3EAfUY_rijfuJ_CVPaR50oe9JF7Q0pI8Dw3osxxYHdYPGbp2CnwHF8KvwJv2wEv0Z3ilQI6U9uwbZxbYJXvEmjjQjjCHkvNLvNg3yhzXQd1olamsT4IRrZmX0MUDpwL7R8zzHj7pSh9hPHFSHjLezKqAST51uC5zmtQ87skDUaneLokT5RbXkPWSYz53Abgjc8_o4KFGUZ-Hgv2Z1l5OTYM9D-HfUD0L-EwxH5wRnIG61gS-khfgY1bq7IAP_DA4l5xRuh9xlm8yGjutc8t-wHtkhWv3hc7aqGwiK5KzgvM5xRkZYn193uEln-su55j1GaIv7oM4iPrsVHiG0Dx7TR9-1lBfqFdwfvSd5LNL5xyZVp5NoHFZ57FkfiF6vKs4k5zvIfrX5xX6MXmt0gM5MTu8DjnhukrHHzTRd3jm0dma0_f_x5cxP9f4jBdqHvmbq2fUjzqcKh2Cp-yWj9ntcHanXmBXxhu7Q--eyjhfNFpaV7zgz4nWEUb7zUOhpevjjf_gu_KZ99pxFlZ-T3sttkmYqrco_26q35v0Ewzv5EZPbnL_8BfduWGMnyyN3q0bZ_7hb_7KG_L4CQAA))：

```svelte
<!--- file: App.svelte --->
<canvas
	width={32}
	height={32}
	{@attach (canvas) => {
		const context = canvas.getContext('2d');

		$effect(() => {
			context.fillStyle = color;
			context.fillRect(0, 0, canvas.width, canvas.height);
		});
	}}
></canvas>
```

> [!NOTE]
> 嵌套的 effect 会在 `color` 发生变化时运行，而外部的 effect（即调用 `canvas.getContext(...)` 的地方）只运行一次，因为它没有读取任何响应式状态。

## 条件式附件

像 `false` 或 `undefined` 这样的假值会被视为"无附件"，从而支持条件式使用：

```svelte
<div {@attach enabled && myAttachment}>...</div>
```

## 将附件传递给组件

当用于组件时，`{@attach ...}` 会创建一个键为 [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 的 prop。如果该组件随后将 props [展开](/tutorial/svelte/spread-props) 到一个元素上，该元素就会接收到这些附件。

这让你能够创建_包装组件_，用以增强元素（[演示](/playground/untitled#H4sIAAAAAAAAE3VUS3ObMBD-KxvajnFqsJM2PhA7TXrKob31FjITAbKtRkiMtDhJPfz3LiAMdpxhGJvdb1_fPnaeYjn3Iu-WIbJ04028lZDcetHDzsO3olbVApI74F1RhHbLJdayhFl-Sp5qhVwhufEWNjWiwJtYxSjyQhsEFEXxBiujcxg1_8O_dnQ9APwsEbVyiHDafjrvDZCgkiO4MLCEzxYZcn90z6XUZ6OxA61KlaIgV6i1pFC-sxjDrlbHaDiWRoGvdMbHsLzp5DES0mJnRxGaRBvcBHb7yFUTCQeunEWYcYtGv12TqgFUDbCK1WLaM6IWQhUlQiJUFm2ZLPly51xXMG0Rjoyd69C7UqqG2nu95QZyXvtvLVpri2-SN4hoLXXCZFfhQ8aQBU1VgdEaH_vSgyBZR_BpPp_vi0tY-rw2ulRZkGqpTQRbZvwa2BPgFC8bgbw31CbjJjAsE6WNYBZeGp7vtQXLMqHWnZx-5kM1TR5ycpkZXQR2wzL94l8Ur1C_3-g168SfQf1MyfRi3LW9fs77emJEw5QV9SREoLTq06tcczq7d6xEUcJX2vAhO1b843XK34e5unZEMBr15ekuKEusluWAF8lXhE2ZTP2r2RcIHJ-163FPKerCgYJLOB9i4GvNwviI5-gAQiFFBk3tBTOU3HFXEk0R8o86WvUD64aINhv5K3oRmpJXkw8uxMG6Hh6JY9X7OwGSqfUy9tDG3sHNoEi0d_d_fv9qndxRU0VClFqo3KVo3U655Hnt1PXB3Qra2Y2QGdEwgTAMCxopsoxOe6SD0gD8movDhT0LAnhqlE8gVCpLWnRoV7OJCkFAwEXitrYL1W7p7pbiE_P7XH6E_rihODm5s52XtiH9Ekaw0VgI9exadWL1uoEYjPtg2672k5szsxbKyWB2fdT0w5Y_0hcT8oXOlRetmLS8-g-6TLXXQgYAAA==))：

```svelte
<!--- file: Button.svelte --->
<script>
	/** @type {import('svelte/elements').HTMLButtonAttributes} */
	let { children, ...props } = $props();
</script>

<!-- `props` includes attachments -->
<button {...props}>
	{@render children?.()}
</button>
```

```svelte
<!--- file: App.svelte --->
<script>
	import tippy from 'tippy.js';
	import Button from './Button.svelte';

	let content = $state('Hello!');

	/**
	 * @param {string} content
	 * @returns {import('svelte/attachments').Attachment}
	 */
	function tooltip(content) {
		return (element) => {
			const tooltip = tippy(element, { content });
			return tooltip.destroy;
		};
	}
</script>

<input bind:value={content} />

<Button {@attach tooltip(content)}>
	Hover me
</Button>
```

## 控制附件何时重新运行 {#Controlling-when-attachments-re-run}

与[actions](use) 不同，附件是完全响应式的：`{@attach foo(bar)}` 会在 `foo` _或_ `bar`（或 `foo` 内部读取的任何状态）发生变化时重新运行：

```js
// @errors: 7006 2304 2552
function foo(bar) {
	return (node) => {
		veryExpensiveSetupWork(node);
		update(node, bar);
	};
}
```

在极少数情况下，这会成为问题（例如，如果 `foo` 做了昂贵且不可避免的设置工作），可以考虑将数据放在一个函数内部传递，并在一个子 effect 中读取它：

```js
// @errors: 7006 2304 2552
function foo(+++getBar+++) {
	return (node) => {
		veryExpensiveSetupWork(node);

+++		$effect(() => {
			update(node, getBar());
		});+++
	}
}
```

## 以编程方式创建附件

要向一个将被展开到组件或元素上的对象添加附件，请使用 [`createAttachmentKey`](svelte-attachments#createAttachmentKey)。

## 将 actions 转换为附件

如果你正在使用一个只提供 actions 的库，可以通过 [`fromAction`](svelte-attachments#fromAction) 将它们转换为附件，从而让你可以（例如）将它们与组件一起使用。
