<script>
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';

	let { onMenu } = $props();

	const links = [
		{ href: '/docs', label: '文档' },
		{ href: '/docs/introduction', label: '入门' },
		{ href: '/docs/runes', label: 'Runes' },
		{ href: '/docs/reference', label: '参考' }
	];

	/**
	 * @param {string} href
	 */
	function isActive(href) {
		const path = $page.url.pathname;
		if (href === '/docs') return path === '/docs' || path.startsWith('/docs/');
		return path.startsWith(href);
	}
</script>

<header class="site-header">
	<button class="icon-btn menu-btn" onclick={onMenu} aria-label="菜单">
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M3 6h18M3 12h18M3 18h18" />
		</svg>
	</button>

	<a class="brand" href="/">
		<img src="/favicon.svg" alt="Svelte" />
		<span>Svelte<span class="cn">中文</span></span>
	</a>

	<nav>
		{#each links as l}
			<a href={l.href} class:active={isActive(l.href)}>{l.label}</a>
		{/each}
	</nav>

	<div class="header-spacer"></div>

	<ThemeToggle />
</header>
