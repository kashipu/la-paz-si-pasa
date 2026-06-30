# Decisions To Feed The Skill

## 2026-06-30: Keep Skill Separate From Project Docs

Decision: keep `skills/astro-wordpress-headless/` as a reusable skill and `docs/project/` as project documentation.

Why: the skill should accumulate reusable knowledge, while the project docs should describe only this implementation.

## 2026-06-30: Pure CSS For Astro

Decision: use CSS foundations plus scoped component styles instead of Tailwind.

Why: this keeps the base portable, avoids utility-class coupling with WordPress and makes design tokens explicit.

## 2026-06-30: REST First, GraphQL Later

Decision: start with REST and a normalized `headless/v1/site` endpoint.

Why: the initial content model is simple enough for REST. WPGraphQL remains available when nested data or schema guarantees justify it.

## 2026-06-30: Astro 7 Baseline Validated

Decision: use Astro 7 for the frontend baseline.

Why: the current project does not use removed experimental flags, `src/fetch.ts`, Markdown-specific rendering behavior, custom Vite plugins, or Astro DB. The upgrade was validated with `astro check` and `astro build` against local WordPress.

Validation:

```text
astro check: 0 errors, 0 warnings
astro build: 5 pages generated
```

## 2026-06-30: WordPress 7 Features To Adopt Selectively

Decision: use WordPress 7's PHP-only block registration and pattern editing improvements as the first CMS-side customization layer.

Why: PHP-only block registration fits the headless base because it avoids adding a WordPress JavaScript build pipeline too early while still giving editors structured blocks and safe attributes. Pattern overrides and `contentOnly` can later support reusable sections without exposing raw CSS.

Not adopting in the base:

- AI Client and Connectors
- frontend Interactivity API
- raw block-level custom CSS as public frontend styling

Validation:

```text
local WordPress core version: 7.0
```
