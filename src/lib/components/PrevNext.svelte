<script>
	let { prev, next } = $props();
</script>

{#if prev || next}
	<div class="prevnext">
		{#if prev}
			<a class="prev" href={`/docs/${prev.slug}`}>
				<div class="pn-label">← 上一篇</div>
				<div class="pn-title">{prev.title}</div>
			</a>
		{:else}
			<span></span>
		{/if}
		{#if next}
			<a class="next" href={`/docs/${next.slug}`}>
				<div class="pn-label">下一篇 →</div>
				<div class="pn-title">{next.title}</div>
			</a>
		{:else}
			<span></span>
		{/if}
	</div>
{/if}
