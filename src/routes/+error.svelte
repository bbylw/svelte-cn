<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>出错了 · Svelte 中文</title>
</svelte:head>

<div class="home">
	<section class="hero">
		<h1>{$page.status}</h1>
		<p>{$page.error?.message || '页面未找到'}</p>
		<div class="cta">
			<a class="btn primary" href="/">返回首页</a>
			<a class="btn ghost" href="/docs">浏览文档</a>
		</div>
	</section>
</div>
