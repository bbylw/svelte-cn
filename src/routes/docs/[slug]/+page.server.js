import { error } from '@sveltejs/kit';
import { loadDocs, getDocBySlugFlat, renderNavFlat, buildToc } from '$lib/docs.server.js';
import { renderMarkdown } from '$lib/markdown.js';

export const prerender = true;

export function entries() {
	const sections = loadDocs();
	const slugs = [];
	for (const s of sections) {
		if (s.indexPage) slugs.push({ slug: s.slug });
		for (const p of s.pages) slugs.push({ slug: p.slug });
	}
	return slugs;
}

export async function load({ params }) {
	const doc = getDocBySlugFlat(params.slug);
	if (!doc) throw error(404, '页面未找到');

	const html = await renderMarkdown(doc.content);
	const toc = buildToc(doc.content);

	const flat = renderNavFlat();
	const idx = flat.findIndex((f) => f.slug === params.slug);
	const prev = idx > 0 ? flat[idx - 1] : null;
	const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

	return {
		title: doc.title,
		html,
		toc,
		prev,
		next,
		breadcrumb: doc.section?.title || ''
	};
}
