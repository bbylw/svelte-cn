<script>
	import PrevNext from '#lib/components/PrevNext.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title} · Svelte 中文</title>
</svelte:head>

<article class="doc-article">
	<p class="breadcrumb">
		<a href="/docs">文档</a><span class="sep">/</span>{data.breadcrumb}
	</p>
	<h1>{data.title}</h1>

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.html}

	<PrevNext prev={data.prev} next={data.next} />
</article>
