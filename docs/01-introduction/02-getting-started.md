---
title: 快速开始
---

我们推荐使用 [SvelteKit](../kit)，它可以让你[构建几乎任何类型的应用](../kit/project-types)。它是 Svelte 团队官方推出的应用框架，由 [Vite](https://vite.dev/) 提供支持。使用以下命令创建新项目：

```sh
npx sv create myapp
cd myapp
npm install
npm run dev
```

如果你还不了解 Svelte，也不必担心！目前你可以先忽略 SvelteKit 额外提供的那些优秀特性，之后再深入学习。

## SvelteKit 的替代方案

你也可以直接配合 Vite 使用 Svelte：运行 `npm create vite@latest` 并选择 `svelte` 选项（如果是已有项目，则将该插件添加到你的 `vite.config.js` 文件中），通过 [vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) 实现。这样，`npm run build` 会在 `dist` 目录下生成 HTML、JS 和 CSS 文件。在大多数情况下，你可能还需要[选择一个路由库](/packages#routing)。

> [!NOTE] Vite 常用于独立模式构建[单页应用（SPA）](../kit/glossary#SPA)，你也可以使用 [SvelteKit 构建单页应用](../kit/single-page-apps)。

此外还有[适用于其他打包工具的插件](/packages#bundler-plugins)，但我们推荐使用 Vite。

如果要为由 Rails、Laravel 等非 JavaScript 后端所服务的页面添加 Svelte，请遵循 Vite 的[后端集成指南](https://vite.dev/guide/backend-integration)，并使用 [`mount`](imperative-component-api#mount) 将组件渲染到页面中。

## 编辑器工具

Svelte 团队维护了一款 [VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)，同时也提供了与各种其他[编辑器](https://sveltesociety.dev/collection/editor-support-c85c080efc292a34)和工具的集成支持。

你还可以使用 [`npx sv check`](https://svelte.dev/docs/cli/sv-check) 在命令行中检查代码。

## 获取帮助

欢迎在 [Discord 聊天室](/chat)中大胆提问！你也可以在 [Stack Overflow](https://stackoverflow.com/questions/tagged/svelte) 上找到答案。
