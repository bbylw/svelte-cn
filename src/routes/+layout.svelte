<script>
	import '../app.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Toc from '$lib/components/Toc.svelte';

	let { children, data } = $props();

	let menuOpen = $state(false);
	const isDocs = $derived($page.url.pathname.startsWith('/docs'));
	const hasToc = $derived(Array.isArray($page.data.toc) && $page.data.toc.length > 0);
</script>

<Header onMenu={() => (menuOpen = !menuOpen)} />

{#if isDocs}
	{#if menuOpen}
		<button class="scrim" onclick={() => (menuOpen = false)} aria-label="关闭菜单"></button>
	{/if}
	<div class="docs-shell" class:no-toc={!hasToc}>
		<Sidebar nav={data.nav} onNavigate={() => (menuOpen = false)} />
		<main class="content">
			{@render children()}
		</main>
		<Toc toc={$page.data.toc} />
	</div>
{:else}
	{@render children()}
{/if}

<footer class="site-footer">
	<p>
		本网站内容为 Svelte 官方文档的中文翻译，仅供学习参考。Svelte 及其 Logo 版权归 Svelte 团队所有。
	</p>
</footer>

<style>
	.docs-shell.no-toc {
		grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
	}
</style>
