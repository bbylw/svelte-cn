---
title: Runes
---

Runes（符文）是 Svelte 中用来控制编译器的符号，以 `$` 开头。它们是 Svelte 响应式系统的核心，用于声明状态、派生值、副作用以及组件之间的数据流动。

如果把 Svelte 看作一门语言，那么 runes 就是这门语言的关键字——你无需导入它们，它们只在特定的位置生效。

## 本章内容

- [什么是 runes？](/docs/what-are-runes)：理解符文背后的设计理念
- [$state](/docs/$state)：声明响应式状态
- [$derived](/docs/$derived)：声明由其他状态派生而来的值
- [$effect](/docs/$effect)：声明响应式的副作用
- [$props](/docs/$props)：声明组件的入参
- [$bindable](/docs/$bindable)：声明可双向绑定的属性
- [$inspect](/docs/$inspect)：在开发时输出响应式值的变化
- [$host](/docs/$host)：在自定义元素中访问宿主元素

> [!NOTE]
> 建议先阅读[什么是 runes？](/docs/what-are-runes)，建立整体认知后再逐一深入各个 rune。
