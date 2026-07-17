# Svelte 中文文档站

Svelte 官方文档的中文翻译站点，使用 SvelteKit 构建，部署于 GitHub Pages。

- 线上地址：<https://svelte.ndjp.net>
- 内容来源：Svelte 官方文档的中文翻译

## 技术栈

- [SvelteKit](https://kit.svelte.dev/) —— 应用框架
- [Svelte 5](https://svelte.dev/) —— 带 Runes 的 UI 框架
- [@sveltejs/adapter-static](https://kit.svelte.dev/docs/adapter-static) —— 静态站点适配器
- [marked](https://marked.js.org/) + [shiki](https://shiki.style/) —— Markdown 解析与代码高亮
- [gray-matter](https://github.com/jonschlinkert/gray-matter) —— 解析文档 frontmatter

## 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（默认 http://localhost:5173）
```

## 构建与预览

```bash
npm run build    # 构建静态产物到 build/ 目录
npm run preview  # 本地预览构建结果
```

## 目录结构

```
docs/                 # 文档内容（Markdown，按章节分目录）
src/lib/              # 文档加载、Markdown 渲染等核心逻辑
src/routes/           # 页面与布局（首页 / 文档页 / 错误页）
static/               # 静态资源（含 CNAME 自定义域名配置）
```

## 部署

项目通过 GitHub Actions（`.github/workflows/deploy.yml`）自动部署到 GitHub Pages：

- 每次推送到 `main` 分支即触发构建并发布。
- 自定义域名 `svelte.ndjp.net` 由仓库根 `static/CNAME` 文件指定。

## 许可

本站内容基于 Svelte 官方文档翻译，仅供学习参考。Svelte 及其 Logo 版权归 Svelte 团队所有。
