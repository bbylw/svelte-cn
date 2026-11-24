<script>
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';

	let { onMenu, showMenu = false, menuOpen = false } = $props();

	const links = [
		{ href: '/docs', label: '文档' },
		{ href: '/docs/introduction', label: '入门' },
		{ href: '/docs/runes', label: 'Runes' },
		{ href: '/docs/reference', label: '参考' }
	];

	/**
	 * 只高亮最具体的一个链接：/docs 作为整个文档区的兜底，
	 * 但存在更精确的匹配时（如 /docs/runes）以它为准，避免同时亮起两项。
	 * @param {string} href
	 */
	function matches(href) {
		const path = page.url.pathname;
		if (href === '/docs') return path === '/docs' || path.startsWith('/docs/');
		return path === href || path.startsWith(href + '/');
	}

	const activeHref = $derived(
		links
			.filter((l) => matches(l.href))
			.sort((a, b) => b.href.length - a.href.length)[0]?.href
	);
</script>

<header class="site-header">
	{#if showMenu}
		<button
			class="icon-btn menu-btn"
			onclick={onMenu}
			aria-label="菜单"
			aria-expanded={menuOpen}
			aria-controls="docs-nav"
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M3 6h18M3 12h18M3 18h18" />
			</svg>
		</button>
	{/if}

	<a class="brand" href="/">
		<img src="/favicon.svg" alt="Svelte" />
		<span>Svelte</span>
	</a>

	<nav>
		{#each links as l}
			<a href={l.href} class:active={l.href === activeHref}>{l.label}</a>
		{/each}
	</nav>

	<div class="header-spacer"></div>

	<ThemeToggle />
</header>
