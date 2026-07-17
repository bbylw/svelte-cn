---
title: in: and out:
tags: transitions
---

`in:` 和 `out:` 指令与 [`transition:`](transition) 完全相同，唯一的区别是所产生的过渡不是双向的——如果在一个过渡进行期间该块开始离场，一个 `in` 过渡会与 `out` 过渡"并列"继续播放，而不是反转。如果离场过渡被中止，过渡会从头重新开始。

```svelte
<script>
  import { fade, fly } from 'svelte/transition';

  let visible = $state(false);
</script>

<label>
  <input type="checkbox" bind:checked={visible}>
  visible
</label>

{#if visible}
	<div in:fly={{ y: 200 }} out:fade>flies in, fades out</div>
{/if}
```
