import { marked } from 'marked';
import { createHighlighter } from 'shiki';
import { slugify } from '#lib/slug.js';
import { renderNavFlat } from '#lib/docs.server.js';

/** @type {ReturnType<typeof createHighlighter> | null} */
let highlighterPromise = null;
function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ['github-light', 'github-dark'],
			langs: [
				'svelte',
				'javascript',
				'typescript',
				'html',
				'css',
				'bash',
				'json',
				'diff',
				'plaintext'
			]
		});
	}
	return highlighterPromise;
}

/** @type {Record<string, string>} */
const LANG_ALIAS = {
	js: 'javascript',
	ts: 'typescript',
	sh: 'bash',
	shell: 'bash',
	html: 'html',
	xml: 'html',
	text: 'plaintext',
	'': 'plaintext'
};

/**
 * @param {string} lang
 * @returns {string}
 */
function normalizeLang(lang) {
	if (!lang) return 'plaintext';
	const lower = lang.toLowerCase();
	return LANG_ALIAS[lower] || lower;
}

/**
 * 清理 Svelte 官方文档特有的代码注释标记，使示例更干净：
 *  - `// ---cut---` 预览裁剪标记
 *  - `// @errors: 7006 2554` 预期错误标记
 *  - `// @filename: index.js` / `/// file:` 文件名标记
 *  - `+++text+++` 差异高亮标记
 *
 * @param {string} code
 * @returns {string}
 */
function cleanCode(code) {
	return code
		.split('\n')
		.filter((line) => !/^\s*\/\/\s*---cut---/.test(line))
		.filter((line) => !/^\s*\/\/\s*@errors:/.test(line))
		.filter((line) => !/^\s*\/\/\s*@filename:/.test(line))
		.filter((line) => !/^\s*\/\/\/\s*file:/.test(line))
		.join('\n')
		.replace(/\+\+\+/g, '')
		.replace(/\n{3,}/g, '\n\n');
}

/** GitHub 风格提示框扩展：> [!NOTE] / [!WARNING] / [!TIP] / [!LEGACY] 等。 */
/** @type {any} */
const calloutExtension = {
	name: 'callout',
	level: 'block',
	/**
	 * @param {string} src
	 * @returns {number | undefined}
	 */
	start(src) {
		const m = /^[ \t]*>[ \t]*\[!/m.exec(src);
		return m ? m.index : undefined;
	},
	/**
	 * @param {string} src
	 * @returns {{
	 *   type: string;
	 *   raw: string;
	 *   calloutType: string;
	 *   title: string;
	 *   body: string;
	 * } | undefined}
	 */
	tokenizer(src) {
		const rule =
			/^[ \t]*>\[ \t]*\[!(NOTE|WARNING|TIP|LEGACY|INFO|CAUTION|IMPORTANT|DANGER)\]([^\n]*)\n((?:>[ \t]?.*(?:\n|$))*)/;
		const match = rule.exec(src);
		if (!match) return;
		const type = match[1].toLowerCase();
		const title = match[2].trim();
		const body = match[3].replace(/^[ \t]*>[ \t]?/gm, '');
		return {
			type: 'callout',
			raw: match[0],
			calloutType: type,
			title,
			body
		};
	},
	/**
	 * @param {{ calloutType: string; title: string; body: string }} token
	 * @returns {string}
	 */
	renderer(token) {
		const titleHtml = token.title ? `<p class="callout-title">${marked.parseInline(token.title)}</p>` : '';
		const bodyHtml = marked.parse(token.body);
		return `<aside class="callout callout-${token.calloutType}">${titleHtml}${bodyHtml}</aside>`;
	}
};

/** @type {any} */
const markedOpts = {
	gfm: true,
	extensions: [calloutExtension],
	renderer: {
		/**
		 * @param {any} token
		 * @returns {string}
		 */
		heading(token) {
			let text = token.text;
			let id = slugify(text);
			// 支持显式锚点：## 标题 {#anchor}，用于翻译后保留原始英文锚点链接
			const m = /\{#([\w$.:-]+)\}\s*$/.exec(text);
			if (m) {
				id = m[1].toLowerCase();
				text = text.replace(/\{#([\w$.:-]+)\}\s*$/, '').trim();
			}
			return `<h${token.depth} id="${id}" class="doc-heading">${marked.parseInline(text)}</h${token.depth}>`;
		},
		/**
		 * @param {any} token
		 * @returns {string}
		 */
		link(token) {
			const href = token.href || '';
			const t = token.title ? ` title="${token.title}"` : '';
			const external = /^https?:\/\//.test(href);
			const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
			return `<a href="${href}"${t}${attrs}>${marked.parseInline(token.text)}</a>`;
		}
	}
};
marked.use(markedOpts);

/** 解码被转义的 HTML 实体，恢复原始代码。
 * @param {string} str
 * @returns {string}
 */
function decodeEntities(str) {
	return str
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&');
}

/** 将渲染后的 HTML 中的代码块替换为 shiki 高亮结果。
 * @param {string} html
 * @returns {Promise<string>}
 */
async function highlightCodeBlocks(html) {
	const hl = await getHighlighter();
	if (!hl) return html;
	const regex = /<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g;
	const matches = [];
	let m;
	while ((m = regex.exec(html))) {
		matches.push({ index: m.index, length: m[0].length, lang: m[1], code: decodeEntities(m[2]) });
	}
	if (matches.length === 0) return html;

	const results = await Promise.all(
		matches.map(async (mt) => {
			const lang = normalizeLang(mt.lang);
			const cleaned = cleanCode(mt.code);
			try {
				return hl.codeToHtml(cleaned, {
					lang,
					themes: { light: 'github-light', dark: 'github-dark' },
					defaultColor: false
				});
			} catch {
				return hl.codeToHtml(cleaned, {
					lang: 'plaintext',
					themes: { light: 'github-light', dark: 'github-dark' },
					defaultColor: false
				});
			}
		})
	);

	let out = '';
	let cursor = 0;
	matches.forEach((mt, i) => {
		out += html.slice(cursor, mt.index);
		out += results[i];
		cursor = mt.index + mt.length;
	});
	out += html.slice(cursor);
	return out;
}

/** 将 Markdown 文本渲染为带高亮与提示框的 HTML。
 * @param {string} md
 * @returns {Promise<string>}
 */
export async function renderMarkdown(md) {
	let html = await marked.parse(md);
	html = await highlightCodeBlocks(html);
	html = rewriteDocLinks(html);
	return html;
}

const _slugs = new Set();
function ensureSlugs() {
	if (_slugs.size) return;
	for (const f of renderNavFlat()) _slugs.add(f.slug);
}

/**
 * 重写文档内部链接：
 *  - 把相对/带前缀的 slug 链接解析为绝对的 `/docs/<slug>`（官方文档为扁平结构）
 *  - 把 `/kit`、`/tutorial`、`/playground` 等指向 svelte.dev 官方资源
 *
 * @param {string} href
 * @returns {string | null}
 */
function resolveLink(href) {
	if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:')) return null;
	// 纯同页锚点：统一小写以匹配标题 id（标题 id 均为小写）
	if (href.startsWith('#')) return '#' + href.slice(1).toLowerCase();
	let norm = href.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');

	if (norm === 'docs/kit' || norm.startsWith('docs/kit/')) return 'https://svelte.dev/' + norm;
	if (norm === 'kit' || norm.startsWith('kit/')) return 'https://svelte.dev/docs/' + norm;
	if (norm.startsWith('docs/cli/')) return 'https://svelte.dev/' + norm;
	if (
		norm.startsWith('tutorial') ||
		norm.startsWith('playground') ||
		norm.startsWith('packages') ||
		norm.startsWith('chat')
	)
		return 'https://svelte.dev/' + norm;

	let path = norm;
	let hash = '';
	const hIdx = path.indexOf('#');
	if (hIdx >= 0) {
		hash = path.slice(hIdx + 1);
		path = path.slice(0, hIdx);
	}
	const qIdx = path.indexOf('?');
	if (qIdx >= 0) path = path.slice(0, qIdx);
	if (!path) return hash ? '#' + hash.toLowerCase() : null;

	const parts = path.split('/').filter(Boolean);
	const slug = parts.length ? parts[parts.length - 1] : '';
	ensureSlugs();
	if (_slugs.has(slug)) return '/docs/' + slug + (hash ? '#' + hash.toLowerCase() : '');
	return null;
}

/**
 * @param {string} html
 * @returns {string}
 */
function rewriteDocLinks(html) {
	return html.replace(/<a href="([^"]+)">/g, (m, href) => {
		const resolved = resolveLink(href);
		if (!resolved) return m;
		if (resolved.startsWith('http'))
			return `<a href="${resolved}" target="_blank" rel="noopener noreferrer">`;
		return `<a href="${resolved}">`;
	});
}
