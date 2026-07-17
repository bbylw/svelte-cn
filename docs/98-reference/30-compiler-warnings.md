---
title: 'Compiler warnings'
---

如果 Svelte 在编译时发现了潜在的错误（例如编写了无法访问的标记），它会在编译时向你发出警告。

在某些具体用例中，某些警告可能是不正确的。你可以通过在引发警告的那一行上方放置一个 `<!-- svelte-ignore <code> -->` 注释来禁用这类误报。示例：

```svelte
<!-- svelte-ignore a11y_autofocus -->
<input autofocus />
```

你可以在一条注释中列出多条规则（以逗号分隔），并随附一条解释性说明（放在括号内）：

```svelte
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
<div onclick>...</div>
```

## 常见警告代码

### 可访问性 (a11y)

- **a11y_autofocus** — 元素使用了 `autofocus`。
- **a11y_click_events_have_key_events** — 可点击元素缺少对应的键盘事件。
- **a11y_no_static_element_interactions** — 静态元素上绑定了交互事件（如 `onclick`）。
- **a11y_missing_content** — 链接或按钮缺少可访问的文本内容。
- **a11y_role_has_required_aria_props** — 元素声明的 role 缺少必需的 `aria-*` 属性。

### 样式

- **css_unused_selector** — 样式规则未被任何元素使用。
- **css_unused_id_selector** — `id` 选择器未被使用。

### 其他

- **unused-export-let** — 导出的 `export let` 未被使用（在 runes 模式下应为 `$props`）。
- **state_referenced_locally** — 响应式状态在组件初始化之外被引用。
- **legacy_code** — 使用了旧版 API，建议迁移到 runes。
- **const_tag_invalid_placement** — `{@const}` 放置在了无效的位置。
