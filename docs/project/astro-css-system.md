# Astro CSS System

The frontend uses pure CSS.

## Rules

- `src/styles/global.css` imports foundations.
- Foundations define reset, tokens, typography and layout helpers.
- Components keep their own scoped `<style>` blocks.
- Components inherit global custom properties.
- WordPress can choose semantic tokens and variants, but cannot inject arbitrary classes or CSS.

## Foundation Files

```text
src/styles/foundations/reset.css
src/styles/foundations/tokens.css
src/styles/foundations/typography.css
src/styles/foundations/layout.css
```

## Component Contract

Good editor-facing controls:

```text
variant
tone
density
columns
mediaPosition
showCta
```

Avoid:

```text
raw CSS
raw class names
free-form JSON
layout values that can break accessibility or responsive behavior
```
