/**
 * 去掉 Markdown 语法标记，仅保留纯文本用于生成锚点与目录。
 * @param {string} s
 */
export function stripMd(s) {
	return s
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/__([^_]+)__/g, '$1')
		.replace(/_([^_]+)_/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.trim();
}

/**
 * 根据标题文本生成稳定的锚点 id（兼容中文）。
 * @param {string} s
 */
export function slugify(s) {
	return stripMd(s)
		.toLowerCase()
		.replace(/[^\w一-龥\- ]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}
