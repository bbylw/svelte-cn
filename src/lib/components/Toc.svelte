<script>
	let { toc } = $props();
</script>

{#if toc && toc.length > 0}
	<nav class="toc">
		<div class="toc-title">本页目录</div>
		{#each toc as item}
			<a href={`#${item.id}`} class={`lvl-${item.level}`}>{item.text}</a>
		{/each}
	</nav>
{/if}
