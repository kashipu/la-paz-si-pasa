# WordPress 7 Opportunities For This Project

WordPress 7.0 is active in the local Docker CMS. This project should use the new platform features selectively, keeping Astro responsible for the public frontend.

## Recommended For This Base

### PHP-Only Block Registration

Use WordPress 7 PHP-only block registration for the first headless blocks:

- `headless/hero`
- `headless/feature-grid`
- `headless/cta`
- `headless/gallery`
- `headless/faq`

Why:

- Keeps the WordPress side lightweight.
- Avoids a JavaScript build pipeline inside the CMS at the beginning.
- Lets PHP own block schema, attributes and editor controls.
- Lets Astro consume the normalized `headless_blocks` contract.

Implementation direction:

```text
apps/wordpress/plugins/headless-core/
  blocks/
    hero.php
    feature-grid.php
    cta.php
```

Each block should expose editor-safe attributes only:

```text
variant
tone
density
columns
mediaPosition
showCta
```

### Pattern Overrides And contentOnly

Use pattern-level editing for reusable page sections once the first block set exists.

Rules:

- Blocks that represent content must mark content attributes clearly.
- Editors should change text, media and constrained variants.
- Editors should not receive raw CSS or arbitrary class controls.

### Block Bindings

Use Block Bindings later for global values that are shared across pages:

- site phone
- contact email
- address
- social links
- reusable CTA URL

Astro should still consume normalized data from REST instead of parsing rendered HTML.

### Font Library And Design Tokens

Use WordPress 7 font management as an editor/admin convenience, but expose only approved frontend tokens to Astro through `headless/v1/site`.

Astro remains the final source of frontend CSS:

```text
WordPress settings -> headless/v1/site -> Astro CSS variables
```

### Breadcrumbs

Do not render the core Breadcrumbs block HTML directly in Astro. Use the idea, but expose structured hierarchy data and let Astro render an accessible breadcrumb component.

### Gallery Lightbox And Icons

Use WordPress editor controls for gallery/icon content, but render frontend behavior in Astro:

- gallery data from WordPress
- Astro image markup
- optional small client island only when lightbox interaction is needed

## Use Later, Not In The Base

### AI Client, Abilities API And Connectors

WordPress 7 introduces AI integration, abilities and connector management. Keep this out of the base template for now.

Good future uses:

- draft title suggestions
- excerpt suggestions
- image alt text suggestions
- editorial workflow helpers

Rules before adoption:

- no provider keys in public bundles
- no AI calls during Astro public render unless deliberate
- no automatic content mutation without editor approval
- document provider, cost and data policy

### Interactivity API

WordPress Interactivity API is useful for WordPress-rendered frontend experiences. Since Astro owns the public frontend here, prefer Astro islands for public interactivity.

Use only inside WordPress editor/admin previews if needed.

## Avoid For This Project

- Raw block-level custom CSS from WordPress into Astro.
- Arbitrary classes coming from WordPress content.
- Rendering unknown custom blocks as trusted frontend layout.
- Depending on AI features for core publishing.

## Immediate Next Step

Implement PHP-registered `headless/*` blocks in `headless-core`, then update Astro's block registry to consume those schemas as the canonical template system.
