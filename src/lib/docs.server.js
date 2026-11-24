import fs from 'node:fs';
import path from 'node:path';
import { slugify } from '#lib/slug.js';

/**
 * @typedef {Object} DocMeta
 * @property {string} slug
 * @property {string} title
 * @property {string} path
 * @property {string} content
 * @property {string} order
 */

/**
 * @typedef {Object} Section
 * @property {string} slug
 * @property {string} title
 * @property {DocMeta | null} indexPage
 * @property {DocMeta[]} pages
 * @property {string} order
 */

/**
 * @typedef {Object} FlatNav
 * @property {string} slug
 * @property {string} title
 */

/**
 * @typedef {Object} NavItem
 * @property {string} slug
 * @property {string} title
 * @property {FlatNav[]} pages
 */

/**
 * @typedef {Object} TocItem
 * @property {number} level
 * @property {string} text
 * @property {string} id
 */

/**
 * 轻量 frontmatter 解析：仅提取我们需要的 `title` 字段。
 * 官方文档中部分标题包含 `{#if ...}`、`<svelte:window>` 等字符，
 * 标准 YAML 解析会失败，因此这里用正则直接抓取 title 行。
 *
 * @param {string} raw
 * @returns {{ title: string; content: string }}
 */
function parseFrontmatter(raw) {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
	if (!m) return { title: '', content: raw };
	const fm = m[1];
	const titleMatch = /^title:\s*(.+)$/m.exec(fm);
	const title = titleMatch ? titleMatch[1].trim().replace(/^["']|["']$/g, '') : '';
	return { title, content: raw.slice(m[0].length) };
}

const DOCS_DIR = path.join(process.cwd(), 'docs');

/** 把 `01-introduction` 这类文件夹名转换为 `introduction` 形式的 slug。
 * @param {string} name
 * @returns {string}
 */
function slugFromName(name) {
	return name.replace(/^\d+-/, '').replace(/\.md$/, '');
}

/** @type {Section[] | null} */
let _cache = null;

/** 读取 docs 目录，构建章节与页面树（带缓存）。
 * @returns {Section[]}
 */
export function loadDocs() {
	if (_cache) return _cache;
	const sections = [];

	const dirEntries = fs.readdirSync(DOCS_DIR, { withFileTypes: true });
	for (const entry of dirEntries) {
		if (!entry.isDirectory()) continue;
		const dir = path.join(DOCS_DIR, entry.name);
		const sectionSlug = slugFromName(entry.name);

		const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
		let indexPage = null;
		const pages = [];

		for (const file of files) {
			const full = path.join(dir, file);
			const raw = fs.readFileSync(full, 'utf-8');
			const { title, content } = parseFrontmatter(raw);
			const fileSlug = slugFromName(file);
			const meta = {
				slug: fileSlug,
				title: title || fileSlug,
				path: full,
				content,
				order: file
			};
			if (file === 'index.md') indexPage = meta;
			else pages.push(meta);
		}

		pages.sort((a, b) => a.order.localeCompare(b.order));

		sections.push({
			slug: sectionSlug,
			title: indexPage?.title || sectionSlug,
			indexPage,
			pages,
			order: entry.name
		});
	}

	sections.sort((a, b) => a.order.localeCompare(b.order));
	_cache = sections;
	return sections;
}

/** 根据扁平 slug 查找具体文档（官方文档采用扁平 URL 结构）。
 * @param {string} slug
 * @returns {({ slug: string; title: string; path: string; content: string; order: string; section: Section; isIndex: boolean }) | null}
 */
export function getDocBySlugFlat(slug) {
	const sections = loadDocs();
	const sec = sections.find((s) => s.slug === slug);
	if (sec?.indexPage) return { ...sec.indexPage, section: sec, isIndex: true };
	for (const s of sections) {
		const page = s.pages.find((p) => p.slug === slug);
		if (page) return { ...page, section: s, isIndex: false };
	}
	return null;
}

/** 扁平化的导航列表，用于上一页/下一页。
 * @returns {FlatNav[]}
 */
export function renderNavFlat() {
	const sections = loadDocs();
	const flat = [];
	for (const sec of sections) {
		if (sec.indexPage) flat.push({ slug: sec.slug, title: sec.indexPage.title });
		for (const p of sec.pages) flat.push({ slug: p.slug, title: p.title });
	}
	return flat;
}

/** 供侧边栏使用的导航树（使用扁平 slug）。
 * @returns {NavItem[]}
 */
export function buildNav() {
	return loadDocs().map((s) => ({
		slug: s.slug,
		title: s.title,
		pages: s.pages.map((p) => ({ slug: p.slug, title: p.title }))
	}));
}

/** 从 Markdown 内容中提取标题，生成右侧目录（TOC）。
 * @param {string} content
 * @returns {TocItem[]}
 */
export function buildToc(content) {
	const lines = content.split('\n');
	const toc = [];
	let inFence = false;

	for (const line of lines) {
		if (/^\s*```/.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		const m = /^(#{2,4})\s+(.+?)\s*#*\s*$/.exec(line);
		if (m) {
			const level = m[1].length;
			let text = m[2];
			let id = slugify(text);
			const idm = /\{#([\w$.:-]+)\}\s*$/.exec(text);
			if (idm) {
				id = idm[1].toLowerCase();
				text = text.replace(/\{#([\w$.:-]+)\}\s*$/, '').trim();
			}
			toc.push({ level, text: text.replace(/`/g, ''), id });
		}
	}
	return toc;
}
