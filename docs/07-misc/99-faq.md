---
title: 常见问题
---

## 我是 Svelte 新手，应该从哪里开始？

我们认为最好的入门方式是玩一遍交互式 [教程](/tutorial)。其中的每一步都主要聚焦于某一个具体方面，并且易于跟随。你将在浏览器中直接编辑并运行真正的 Svelte 组件。

五到十分钟就足以让你上手跑起来。一个半小时左右应该能让你通篇过完整个教程。

## 在哪里可以获得支持？

如果你的问题是关于某些语法的，[参考文档](/docs/svelte) 是个不错的起点。

Stack Overflow 是一个很受欢迎的论坛，适合提出代码层面的问题，或者当你被某个具体错误卡住时。浏览一下已有的、带有 [Svelte](https://stackoverflow.com/questions/tagged/svelte+or+svelte-3) 标签的问题，或者 [提出你自己的问题](https://stackoverflow.com/questions/ask?tags=svelte)！

还有一些在线论坛和聊天频道，是讨论最佳实践、应用架构，或者只是结识其他 Svelte 用户的好地方。[我们的 Discord](/chat) 或 [Reddit 频道](https://www.reddit.com/r/sveltejs/) 就是这样的例子。如果你有一个可以回答的代码层面问题，Stack Overflow 通常是更合适的选择。

## 有第三方资源吗？

Svelte Society 维护着一个 [书籍与视频清单](https://sveltesociety.dev/collection/a-list-of-books-and-courses-ac01dd10363184fa)。

## 如何让 VS Code 为我的 .svelte 文件提供语法高亮？

有一个 [官方的 Svelte VS Code 扩展](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)。

## 有自动格式化我的 .svelte 文件的工具吗？

你可以使用 prettier，配合 [prettier-plugin-svelte](https://www.npmjs.com/package/prettier-plugin-svelte) 插件。

## 如何为我的组件编写文档？

在使用 Svelte Language Server 的编辑器中，你可以通过特殊格式的注释为组件、函数和导出编写文档。

````svelte
<script>
	/** 我们应该怎么称呼这个用户？ */
	export let name = 'world';
</script>

<!--
@component
这是一些关于该组件的文档。
它会在悬停时显示出来。

- 你可以在这里使用 markdown。
- 你也可以在这里使用代码块。
- 用法：
  ```svelte
  <main name="Arethra">
  ```
-->
<main>
	<h1>
		Hello, {name}
	</h1>
</main>
````

注意：在你描述组件的 HTML 注释中，`@component` 是必需的。

## Svelte 能扩展吗？

最终会有一篇关于这个主题的博客文章，但与此同时，请查看 [这个 issue](https://github.com/sveltejs/svelte/issues/2546)。

## 有 UI 组件库吗？

有若干 [UI 组件库](/packages#component-libraries)，以及列在 [packages 页面](/packages) 上的独立组件。

## 如何测试 Svelte 应用？

你的应用如何组织、逻辑定义在哪里，将决定确保它被正确测试的最佳方式。需要注意，并非所有逻辑都属于组件内部——这包括数据转换、跨组件状态管理、日志等关注点。请记住，Svelte 库本身拥有自己的测试套件，因此你无需为验证 Svelte 提供的实现细节而编写测试。

一个 Svelte 应用通常会有三种不同类型的测试：单元测试（Unit）、组件测试（Component）和端到端测试（E2E）。

_单元测试_：专注于隔离地测试业务逻辑。通常这是验证独立的函数和边界情况。通过最小化这些测试的表面积，它们可以保持精简和快速；而将尽可能多的逻辑从 Svelte 组件中抽离出来，你就能用单元测试覆盖应用的更多部分。在创建新的 SvelteKit 项目时，你会被问到是否要设置 [Vitest](https://vitest.dev/) 用于单元测试。此外还有许多其他测试运行器可供使用。

_组件测试_：验证一个 Svelte 组件在其整个生命周期中是否如预期地挂载并交互，这需要一个能提供文档对象模型（DOM）的工具。组件可以被编译（因为 Svelte 是一个编译器，而非普通库）并挂载，以便对元素结构、监听器、状态以及 Svelte 组件提供的所有其他能力进行断言。组件测试工具的范围很广，从 jsdom 这类内存实现配合 [Vitest](https://vitest.dev/) 这样的测试运行器，到利用真实浏览器提供可视化测试能力（如 [Playwright](https://playwright.dev/docs/test-components) 或 [Cypress](https://www.cypress.io/)）的方案。

_端到端测试_：为了确保你的用户能够与你的应用交互，有必要以尽可能接近生产环境的方式对其进行整体测试。这是通过编写端到端（E2E）测试来完成的，这些测试会加载并与你应用的已部署版本交互，以模拟用户将如何与应用交互。在创建新的 SvelteKit 项目时，你会被问到是否要设置 [Playwright](https://playwright.dev/) 用于端到端测试。还有许多其他的 E2E 测试库可供使用。

一些入门测试的资源：

- [Svelte 关于测试的文档](/docs/svelte/testing)
- [使用 Svelte CLI 设置 Vitest](/docs/cli/vitest)
- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/example/)
- [Cypress 中的 Svelte 组件测试](https://docs.cypress.io/guides/component-testing/svelte/overview)
- [使用 JSDOM 的 uvu 测试运行器示例](https://github.com/lukeed/uvu/tree/master/examples/svelte)
- [使用 Vitest & Playwright 测试 Svelte 组件](https://davipon.hashnode.dev/test-svelte-component-using-vitest-playwright)
- [使用 WebdriverIO 进行组件测试](https://webdriver.io/docs/component-testing/svelte)

## 有路由器吗？

官方的路由库是 [SvelteKit](/docs/kit)。SvelteKit 在一个易于使用的包中提供了文件系统路由器、服务端渲染（SSR）和热模块替换（HMR）。它与 React 的 Next.js 和 Vue 的 Nuxt.js 有相似之处。SvelteKit 还支持用于客户端应用的基于 hash 的路由。

不过，你可以使用任何路由库。可用路由器的列举见 [packages 页面](/packages#routing)。

## 如何用 Svelte 编写移动应用？

虽然大多数移动应用并不使用 JavaScript 编写，但如果你想在构建移动应用时利用你现有的 Svelte 组件和 Svelte 知识，你可以将一个 [SvelteKit SPA](https://kit.svelte.dev/docs/single-page-apps) 通过 [Tauri](https://v2.tauri.app/start/frontend/sveltekit/) 或 [Capacitor](https://capacitorjs.com/solution/svelte) 转变为移动应用。相机、地理定位和推送通知等移动特性，在这两个平台上都可以通过插件获得。

你也可以使用 [Symbiote Native](https://docs.symbiote-native.dev/) 编写编译为原生组件的 Svelte 应用，它借助了 React Native 所提供的基础设施。

Svelte 5 还对[自定义渲染器](custom-renderers) 提供了实验性支持，它让 Svelte 组件可以渲染到 DOM 以外的目标。这将使 Lynx JS 和 Svelte Native 等更多的移动框架得到支持，Symbiote Native 也将采用这一 API。Svelte Native 是 Svelte 4 的一个可用选项，但 Svelte 5 目前并不支持它。Svelte Native 让你能够使用包含 [NativeScript UI 组件](https://docs.nativescript.org/ui/)（而非 DOM 元素）的 Svelte 组件来编写 NativeScript 应用。

## 我能告诉 Svelte 不要移除我未使用的样式吗？

不能。Svelte 会从组件中移除这些样式，并就此向你发出警告，以避免原本会由此引发的问题。

Svelte 的组件样式作用域机制会生成一个对给定组件唯一的类，将其添加到组件中处于 Svelte 控制之下的相关元素上，然后再将其添加到该组件样式中的每个选择器上。当编译器无法看出某个样式选择器适用于哪些元素时，要保留它只有两种糟糕的选择：

- 如果它保留了选择器并为其添加作用域类，该选择器很可能无法匹配组件中的预期元素，而如果它们是由子组件或 `{@html ...}` 创建的，那就肯定匹配不上。
- 如果它保留了选择器却没有为其添加作用域类，该样式就会变成全局样式，影响你的整个页面。

如果你需要为 Svelte 在编译时无法识别的内容设置样式，你需要通过使用 `:global(...)` 显式地选择加入全局样式。但也要记住，你可以只将 `:global(...)` 包裹在选择器的一部分外面。`.foo :global(.bar) { ... }` 会为出现在组件 `.foo` 元素内部的任何 `.bar` 元素设置样式。只要当前组件中有某个父元素可以作为起点，像这样的部分全局选择器几乎总能让你得到想要的效果。

## Svelte v2 还可用吗？

它不会再添加新特性，而且 bug 大概只会在极其恶劣或存在某种安全漏洞时才会被修复。

文档仍可在 [这里](https://github.com/sveltejs/v2.svelte.dev/tree/master/content) 获取。

## 如何进行热模块替换？

我们推荐使用 [SvelteKit](/docs/kit)，它开箱即用地支持 HMR，并且构建在 [Vite](https://vitejs.dev/) 和 [svelte-hmr](https://github.com/sveltejs/svelte-hmr) 之上。社区也有 [rollup](https://github.com/rixo/rollup-plugin-svelte-hot) 和 [webpack](https://github.com/sveltejs/svelte-loader) 的插件可用。
