---
title: 测试
---

测试帮助你编写和维护代码，并防止出现回归（regression）。测试框架可以帮你做到这一点，让你能够描述关于代码应当如何行为的断言或期望。Svelte 对你使用哪个测试框架持开放态度——你可以使用 [Vitest](https://vitest.dev/)、[Jasmine](https://jasmine.github.io/)、[Cypress](https://www.cypress.io/) 和 [Playwright](https://playwright.dev/) 等方案来编写单元测试、集成测试和端到端测试。

## 使用 Vitest 进行单元测试与组件测试 {#unit-and-component-tests-with-vitest-component-testing}

单元测试允许你测试代码中小的、隔离的部分。集成测试允许你测试应用的部分内容，看看它们是否能协同工作。如果你使用的是 Vite（包括通过 SvelteKit 使用），我们推荐使用 [Vitest](https://vitest.dev/)。你可以使用 Svelte CLI 在[创建项目时或之后](/docs/cli/vitest)来[配置 Vitest](/docs/cli/vitest)。

要手动配置 Vitest，首先安装它：

```sh
npm install -D vitest
```

然后调整你的 `vite.config.js`：

<!-- prettier-ignore -->
```js
/// file: vite.config.js
import { defineConfig } from +++'vitest/config'+++;

export default defineConfig({
	// ...
	// Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
```

> [!NOTE] 如果加载所有包的浏览器版本并不合适（例如，因为你也在测试后端库），[你可能需要改用别名配置](https://github.com/testing-library/svelte-testing-library/issues/222#issuecomment-1909993331)

你现在可以为 `.js/.ts` 文件中的代码编写单元测试：

```js
/// file: multiplier.svelte.test.js
// @filename: multiplier.svelte.ts
export function multiplier(initial: number, k: number) {
	let count = $state(initial);

	return {
		get value() {
			return count * k;
		},
		set: (c: number) => {
			count = c;
		}
	};
}
// @filename: multiplier.svelte.test.js
// ---cut---
import { flushSync } from 'svelte';
import { expect, test } from 'vitest';
import { multiplier } from './multiplier.svelte.js';

test('Multiplier', () => {
	let double = multiplier(0, 2);

	expect(double.value).toEqual(0);

	double.set(5);

	expect(double.value).toEqual(10);
});
```

```js
/// file: multiplier.svelte.js
/**
 * @param {number} initial
 * @param {number} k
 */
export function multiplier(initial, k) {
	let count = $state(initial);

	return {
		get value() {
			return count * k;
		},
		/** @param {number} c */
		set: (c) => {
			count = c;
		}
	};
}
```

### 在测试文件中使用符文

由于 Vitest 处理你的测试文件的方式与处理源文件相同，因此只要文件名包含 `.svelte`，你就可以在测试中使用符文：

```js
/// file: multiplier.svelte.test.js
// @filename: multiplier.svelte.ts
export function multiplier(getCount: () => number, k: number) {
	return {
		get value() {
			return getCount() * k;
		}
	};
}
// @filename: multiplier.svelte.test.js
// ---cut---
import { flushSync } from 'svelte';
import { expect, test } from 'vitest';
import { multiplier } from './multiplier.svelte.js';

test('Multiplier', () => {
	let count = $state(0);
	let double = multiplier(() => count, 2);

	expect(double.value).toEqual(0);

	count = 5;

	expect(double.value).toEqual(10);
});
```

```js
/// file: multiplier.svelte.js
/**
 * @param {() => number} getCount
 * @param {number} k
 */
export function multiplier(getCount, k) {
	return {
		get value() {
			return getCount() * k;
		}
	};
}
```

如果被测代码使用了 effects，你需要将测试包裹在 `$effect.root` 内部：

```js
/// file: logger.svelte.test.js
// @filename: logger.svelte.ts
export function logger(fn: () => void) {}
// @filename: logger.svelte.test.js
// ---cut---
import { flushSync } from 'svelte';
import { expect, test } from 'vitest';
import { logger } from './logger.svelte.js';

test('Effect', () => {
	const cleanup = $effect.root(() => {
		let count = $state(0);

		// logger uses an $effect to log updates of its input
		let log = logger(() => count);

		// effects normally run after a microtask,
		// use flushSync to execute all pending effects synchronously
		flushSync();
		expect(log).toEqual([0]);

		count = 1;
		flushSync();

		expect(log).toEqual([0, 1]);
	});

	cleanup();
});
```

```js
/// file: logger.svelte.js
/**
 * @param {() => any} getValue
 */
export function logger(getValue) {
	/** @type {any[]} */
	let log = [];

	$effect(() => {
		log.push(getValue());
	});

	return log;
}
```

### 组件测试

可以单独测试你的组件，这让你能够（在真实或模拟的）浏览器中渲染它们、模拟行为并做出断言，而无需启动整个应用。

> [!NOTE] 在编写组件测试之前，先想清楚你究竟是需要测试组件本身，还是更关心组件_内部_的逻辑。如果是后者，考虑把那段逻辑抽取出来单独测试，从而避免组件带来的额外开销。

要开始，请安装 jsdom（一个对 DOM API 做填充的库）：

```sh
npm install -D jsdom
```

然后调整你的 `vite.config.js`：

```js
/// file: vite.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		/* ... */
	],
	test: {
		// If you are testing components client-side, you need to set up a DOM environment.
		// If not all your files should have this environment, you can use a
		// `// @vitest-environment jsdom` comment at the top of the test files instead.
		environment: 'jsdom'
	},
	// Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
```

之后，你可以创建一个测试文件，在其中导入要测试的组件，以编程方式与它交互，并对结果编写断言：

```js
/// file: component.test.js
import { flushSync, mount, unmount } from 'svelte';
import { expect, test } from 'vitest';
import Component from './Component.svelte';

test('Component', () => {
	// Instantiate the component using Svelte's `mount` API
	const component = mount(Component, {
		target: document.body, // `document` exists because of jsdom
		props: { initial: 0 }
	});

	expect(document.body.innerHTML).toBe('<button>0</button>');

	// Click the button, then flush the changes so you can synchronously write expectations
	document.body.querySelector('button')?.click();
	flushSync();

	expect(document.body.innerHTML).toBe('<button>1</button>');

	// Remove the component from the DOM
	unmount(component);
});
```

虽然这个过程非常直接，但它也比较底层且有些脆弱，因为组件的确切结构可能会频繁变化。像 [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/) 这样的工具可以帮你简化测试。上面的测试可以像这样重写：

```js
// @errors: 2339
/// file: component.test.js
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import Component from './Component.svelte';

test('Component', async () => {
	const user = userEvent.setup();
	render(Component);

	const button = screen.getByRole('button');
	expect(button).toHaveTextContent(0);

	await user.click(button);
	expect(button).toHaveTextContent(1);
});
```

在编写涉及双向绑定、上下文或代码片段 props 的组件测试时，最好为你的特定测试创建一个包装组件并与之交互。`@testing-library/svelte` 包含一些[示例](https://testing-library.com/docs/svelte-testing-library/example)。

## 使用 Storybook 进行组件测试

[Storybook](https://storybook.js.org) 是一个用于开发和记录 UI 组件的工具，它也可以用来测试你的组件。它们通过 Vitest 的浏览器模式运行，该模式在真实浏览器中渲染你的组件，以提供最真实的测试环境。

要开始，首先在你的项目中安装 Storybook（[使用 Svelte 的 CLI](/docs/cli/storybook)），通过 `npx sv add storybook` 并选择包含测试功能的推荐配置。如果你已经在使用 Storybook，或想了解更多关于 Storybook 测试能力的信息，请遵循 [Storybook 测试文档](https://storybook.js.org/docs/writing-tests?renderer=svelte) 开始。

你可以为组件的变体创建 stories，并使用 [play 函数](https://storybook.js.org/docs/writing-tests/interaction-testing?renderer=svelte#writing-interaction-tests) 来测试交互，该函数允许你使用 Testing Library 和 Vitest 的 API 来模拟行为并做出断言。下面是一个可以测试的 stories 的示例，其中一个渲染了一个空的 LoginForm 组件，另一个模拟了用户填写表单：

```svelte
/// file: LoginForm.stories.svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn } from 'storybook/test';

	import LoginForm from './LoginForm.svelte';

	const { Story } = defineMeta({
		component: LoginForm,
		args: {
			// Pass a mock function to the `onSubmit` prop
			onSubmit: fn(),
		}
	});
</script>

<Story name="Empty Form" />

<Story
	name="Filled Form"
	play={async ({ args, canvas, userEvent }) => {
		// Simulate a user filling out the form
		await userEvent.type(canvas.getByTestId('email'), 'email@provider.com');
		await userEvent.type(canvas.getByTestId('password'), 'a-random-password');
		await userEvent.click(canvas.getByRole('button'));

		// Run assertions
		await expect(args.onSubmit).toHaveBeenCalledTimes(1);
		await expect(canvas.getByText('You’re in!')).toBeInTheDocument();
	}}
/>
```

## 使用 Playwright 进行端到端测试

E2E（"端到端"的缩写）测试允许你以用户的视角来测试整个应用。本节以 [Playwright](https://playwright.dev/) 为例，但你也可以使用其他方案，如 [Cypress](https://www.cypress.io/) 或 [NightwatchJS](https://nightwatchjs.org/)。

你可以使用 Svelte CLI 在[创建项目时或之后](/docs/cli/playwright)来[配置 Playwright](/docs/cli/playwright)。你也可以使用 [`npm init playwright`](https://playwright.dev/docs/intro) 来配置它。此外，你可能还想安装一个 IDE 插件，例如 [VS Code 扩展](https://playwright.dev/docs/getting-started-vscode)，以便能从 IDE 内部执行测试。

如果你运行过 `npm init playwright` 或者没有使用 Vite，你可能需要调整 Playwright 配置，告诉它在运行测试之前该做什么——主要是以某个端口启动你的应用。例如：

```js
/// file: playwright.config.js
const config = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
```

现在你可以开始编写测试了。这些测试完全不知道 Svelte 是一个框架，因此你主要在与 DOM 交互并编写断言。

```js
// @errors: 2307 7031
/// file: tests/hello-world.spec.js
import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});
```
