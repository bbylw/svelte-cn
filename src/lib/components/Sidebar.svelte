<script>
	import { page } from '$app/state';

	/**
	 * @type {{
	 *   nav: Array<{ slug: string; title: string; pages: Array<{ slug: string; title: string }> }>;
	 *   onNavigate: () => void;
	 *   open?: boolean;
	 * }}
	 */
	let { nav, onNavigate, open = false } = $props();

	let query = $state('');

	function currentPath() {
		return page.url.pathname;
	}

	/**
	 * @param {string} title
	 */
	function matches(title) {
		if (!query.trim()) return true;
		return title.toLowerCase().includes(query.trim().toLowerCase());
	}
</script>

<aside class="sidebar" id="docs-nav" class:open>
	<input class="search" type="search" placeholder="搜索文档…" bind:value={query} />

	{#each nav as group}
		<div class="nav-group">
			<span class="group-title">{group.title}</span>
			{#if group.pages.some((p) => matches(p.title))}
				<a
					href={`/docs/${group.slug}`}
					class:active={currentPath() === `/docs/${group.slug}`}
					class:sub={true}
					onclick={onNavigate}
				>
					概述
				</a>
			{/if}
			{#each group.pages as p}
				{#if matches(p.title)}
					<a
						href={`/docs/${p.slug}`}
						class:active={currentPath() === `/docs/${p.slug}`}
						class:sub={true}
						onclick={onNavigate}
					>
						{p.title}
					</a>
				{/if}
			{/each}
		</div>
	{/each}
</aside>
