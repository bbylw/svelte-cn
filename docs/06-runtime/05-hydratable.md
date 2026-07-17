---
title: 可水合数据（Hydratable data）
---

在 Svelte 中，当你想要在服务端渲染异步内容数据时，你可以简单地 `await` 它。这很棒！不过它也带来了一个陷阱：当在客户端对这段内容进行 hydration 时，Svelte 必须重做一遍异步工作，这会阻塞 hydration，直到它完成：

```svelte
<script>
  import { getUser } from 'my-database-library';

  // This will get the user on the server, render the user's name into the h1,
  // and then, during hydration on the client, it will get the user _again_,
  // blocking hydration until it's done.
  const user = await getUser();
</script>

<h1>{user.name}</h1>
```

不过这很愚蠢。如果我们在服务端已经完成了获取数据这一艰苦工作，我们就不想在客户端的 hydration 期间再获取一次。`hydratable` 正是为解决这一问题而构建的一个底层 API。你可能不会经常需要它——你使用的任何数据获取库都会在背后用到它。例如，它为 [SvelteKit 中的远程函数](/docs/kit/remote-functions) 提供了支持。

修复上面的示例：

```svelte
<script>
  import { hydratable } from 'svelte';
  import { getUser } from 'my-database-library';

  // During server rendering, this will serialize and stash the result of `getUser`, associating
  // it with the provided key and baking it into the `head` content. During hydration, it will
  // look for the serialized version, returning it instead of running `getUser`. After hydration
  // is done, if it's called again, it'll simply invoke `getUser`.
  const user = await hydratable('user', () => getUser());
</script>

<h1>{user.name}</h1>
```

这个 API 也可以用来提供在服务器端渲染和 hydration 之间保持稳定（stable）的随机值或基于时间的值。例如，获取一个在 hydration 时不会更新的随机数：

```ts
import { hydratable } from 'svelte';
const rand = hydratable('random', () => Math.random());
```

如果你是一个库作者，请务必为你 `hydratable` 值的键加上你的库名作为前缀，这样你的键才不会与其他库冲突。

## 序列化

所有从 `hydratable` 函数返回的数据都必须是可序列化的。但这并不意味着你只能使用 JSON——Svelte 使用了 [`devalue`](https://npmjs.com/package/devalue)，它可以序列化各种各样的东西，包括 `Map`、`Set`、`URL` 和 `BigInt`。请查看文档页面以获取完整列表。除此之外，得益于 Svelte 的一些魔法，你还可以放心地使用 promise：

```svelte
<script>
  import { hydratable } from 'svelte';
  const promises = hydratable('random', () => {
    return {
      one: Promise.resolve(1),
      two: Promise.resolve(2)
    }
  });
</script>

{await promises.one}
{await promises.two}
```

## CSP

`hydratable` 会向 `render` 返回的 `head` 中添加一个内联 `<script>` 块。如果你正在使用[内容安全策略](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)（CSP），这段脚本很可能会运行失败。你可以向 `render` 提供一个 `nonce`：

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';
// ---cut---
const nonce = crypto.randomUUID();

const { head, body } = await render(App, {
	csp: { nonce }
});
```

这会将 `nonce` 添加到脚本块中，前提是假设你会随后将同一个 nonce 添加到包含它的文档的 CSP 头部中：

```js
/// file: server.js
let response = new Response();
let nonce = 'xyz123';
// ---cut---
response.headers.set(
  'Content-Security-Policy',
  `script-src 'nonce-${nonce}'`
 );
```

`nonce`（抛开英式俚语的定义，它意为"一次性使用的数字"）仅在动态服务端渲染单个响应时使用，这一点至关重要。

相反，如果你是提前生成静态 HTML，则必须使用哈希：

```js
/// file: server.js
import { render } from 'svelte/server';
import App from './App.svelte';
// ---cut---
const { head, body, hashes } = await render(App, {
	csp: { hash: true }
});
```

`hashes.script` 将是一个类似 `["sha256-abcd123"]` 的字符串数组。与 `nonce` 一样，这些哈希应当被用于你的 CSP 头部：

```js
/// file: server.js
let response = new Response();
let hashes = { script: ['sha256-xyz123'] };
// ---cut---
response.headers.set(
  'Content-Security-Policy',
  `script-src ${hashes.script.map((hash) => `'${hash}'`).join(' ')}`
);
```

如果可以，我们推荐使用 `nonce` 而非 `hash`，因为 `hash` 在将来会干扰流式 SSR。
