<script>
	const counterCode = `<script>
	let count = $state(0);
<\/script>

<button onclick={() => count++}>
	点击了 {count} 次
</button>`;

	const effectCode = `let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
	console.log(\`count 变为 \${count}\`);
});`;
</script>

<svelte:head>
	<title>Svelte · 用于构建 Web 用户界面的编译器框架</title>
</svelte:head>

<div class="home">
	<section class="hero">
		<span class="eyebrow">Svelte 5 · Runes</span>
		<h1>编写更少的代码，<br /><span class="grad">构建更快的应用</span></h1>
		<p>
			Svelte 是一个用于构建 Web 用户界面的框架。它是一款编译器，能把你用 HTML、CSS 和
			JavaScript 编写的声明式组件，编译为高效、精简的 JavaScript，精确更新 DOM。
		</p>
		<div class="cta">
			<a class="btn primary" href="/docs/introduction">开始阅读</a>
			<a class="btn ghost" href="/docs/runes">了解 Runes</a>
		</div>
	</section>

	<section class="features">
		<div class="feature-card">
			<h3>编译器驱动</h3>
			<p>没有运行时框架开销，组件在构建期被编译为最小的命令式代码，应用体积更小、速度更快。</p>
		</div>
		<div class="feature-card">
			<h3>真正的响应式</h3>
			<p>通过 <code>$state</code>、<code>$derived</code>、<code>$effect</code> 等 Runes，以最小的样板表达响应式逻辑。</p>
		</div>
		<div class="feature-card">
			<h3>熟悉的语法</h3>
			<p>组件就是增强的 HTML、CSS 与 JavaScript，无需学习大量新的抽象概念即可上手。</p>
		</div>
		<div class="feature-card">
			<h3>全栈能力</h3>
			<p>配合应用框架 SvelteKit，可构建从独立组件到完整全栈应用的任何东西。</p>
		</div>
	</section>

	<section class="prose-section">
		<h2>什么是 Svelte？</h2>
		<p>
			与 React、Vue 等主流框架不同，Svelte 没有把「差异比对（虚拟 DOM）」的工作放在浏览器运行时，
			而是把这份工作前置到<strong>构建阶段</strong>。当你编写组件时，Svelte 编译器会分析你的代码，
			生成直接操作 DOM 的高度优化过的 JavaScript。结果就是：更小的产物体积、更快的首屏与更新性能，
			以及几乎为零的框架运行时开销。
		</p>
		<p>
			一个 Svelte 组件就是一个 <code>.svelte</code> 文件，它把结构（HTML）、样式（CSS）与逻辑（JavaScript）
			聚合在一起。样式默认是<strong>局部作用域</strong>的，不会意外泄漏到其他组件。
		</p>
	</section>

	<section class="showcase">
		<div class="showcase-text">
			<h2>直观的组件模型</h2>
			<p>
				声明一段状态，把它用在标记里，Svelte 会在状态变化时自动、精确地更新对应的 DOM 节点——
				无需手动订阅，也无需依赖数组。
			</p>
		</div>
		<pre class="code-demo"><code>{counterCode}</code></pre>
	</section>

	<section class="showcase reverse">
		<div class="showcase-text">
			<h2>Runes：显式而细粒度的响应式</h2>
			<p>
				Svelte 5 引入了 Runes——一组以 <code>$</code> 开头的编译器符号。
				<code>$state</code> 声明响应式状态，<code>$derived</code> 声明派生值，
				<code>$effect</code> 处理副作用。它们让响应式逻辑在函数、模块与组件间保持一致且可预测。
			</p>
		</div>
		<pre class="code-demo"><code>{effectCode}</code></pre>
	</section>

	<section class="prose-section">
		<h2>不只是一个 UI 库</h2>
		<p>
			需要路由、服务端渲染、数据加载与构建部署时，官方框架
			<strong>SvelteKit</strong> 提供了一整套开箱即用的方案。你可以从一个小的独立组件起步，
			逐步扩展到完整的全栈应用，而无需切换心智模型。
		</p>
		<div class="cta center">
			<a class="btn primary" href="/docs/introduction">阅读入门指南</a>
			<a class="btn ghost" href="/docs/reference">查阅 API 参考</a>
		</div>
	</section>
</div>
