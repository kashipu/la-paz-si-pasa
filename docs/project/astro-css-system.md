# Astro CSS System

The frontend uses pure CSS.

## Rules

- `src/styles/global.css` imports foundations.
- Foundations define reset, tokens, typography and layout helpers.
- Components keep their own scoped `<style>` blocks.
- Components inherit global custom properties.
- WordPress can choose semantic tokens and variants, but cannot inject arbitrary classes or CSS.

## Breakpoints

Two breakpoints only, desktop-first: base styles are the desktop layout, `@media` blocks only override what changes.

```css
@media (max-width: 849px) { /* tablet / mobile */ }
@media (max-width: 360px) { /* small mobile */ }
```

No `min-width` queries and no other pixel values — consolidate to these two everywhere. CSS custom properties can't be used inside a `@media` condition without a PostCSS plugin (none configured, this is pure CSS), so the values stay as literals.

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
