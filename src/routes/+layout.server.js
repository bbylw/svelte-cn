import { buildNav } from '$lib/docs.server.js';

export const prerender = true;

export function load() {
	const nav = buildNav();
	const sections = nav.map((n) => ({ slug: n.slug, title: n.title }));
	return { nav, sections };
}
