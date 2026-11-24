<script>
	import { onMount } from 'svelte';

	/** @returns {HTMLMetaElement | null} */
	function colorSchemeMeta() {
		return document.querySelector('meta[name="color-scheme"]');
	}

	/** 系统当前的配色偏好 */
	function systemScheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	/** 页面当前实际渲染的配色：显式覆盖优先，否则跟随系统 */
	function resolved() {
		const content = colorSchemeMeta()?.content;
		if (content === 'light' || content === 'dark') return content;
		return systemScheme();
	}

	function toggle() {
		const meta = colorSchemeMeta();
		if (!meta) return;

		const system = systemScheme();
		const target = resolved() === 'dark' ? 'light' : 'dark';

		// 目标与系统一致时回到「跟随系统」，避免把当前系统值永久固定下来
		meta.content = target === system ? 'light dark' : target;

		try {
			if (target === system) {
				localStorage.removeItem('color-scheme');
				localStorage.removeItem('theme');
			} else {
				localStorage.setItem('color-scheme', target);
			}
		} catch {
			// 存储不可用时，本次会话仍然按 meta 生效
		}
	}

	// 其他标签页更改主题时保持同步
	onMount(() => {
		function syncFromStorage() {
			const meta = colorSchemeMeta();
			if (!meta) return;
			let stored = null;
			try {
				stored = localStorage.getItem('color-scheme') || localStorage.getItem('theme');
			} catch {
				return;
			}
			meta.content = stored === 'light' || stored === 'dark' ? stored : 'light dark';
		}

		window.addEventListener('storage', syncFromStorage);
		return () => window.removeEventListener('storage', syncFromStorage);
	});
</script>

<button class="icon-btn theme-toggle" onclick={toggle} aria-label="切换明暗主题" title="切换明暗主题">
	<svg class="i-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
	</svg>
	<svg class="i-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
	</svg>
</button>
