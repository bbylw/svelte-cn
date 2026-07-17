const { marked } = require('marked');
marked.use({
	renderer: {
		heading(t) {
			return JSON.stringify({ depth: t.depth, text: t.text, raw: t.raw }) + '\n';
		},
		link(t) {
			return JSON.stringify({ href: t.href, title: t.title, text: t.text }) + '\n';
		}
	}
});
console.log(marked.parse('# Hi **there**\n\n[text](http://x.com "T")'));
