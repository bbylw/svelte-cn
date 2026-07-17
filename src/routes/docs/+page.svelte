<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>文档总览 · Svelte 中文</title>
</svelte:head>

<div class="doc-article">
	<h1>文档总览</h1>
	<p class="breadcrumb">Svelte 中文文档</p>

	<div class="doc-cards" style="padding-bottom: 24px;">
		{#each data.sections as section}
			<div class="doc-card">
				<h3><a href={`/docs/${section.slug}`}>{section.title}</a></h3>
				<ul>
					{#each (data.nav.find((n) => n.slug === section.slug)?.pages || []).slice(0, 6) as p}
						<li><a href={`/docs/${p.slug}`}>{p.title}</a></li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</div>
