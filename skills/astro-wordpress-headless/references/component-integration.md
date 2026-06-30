# Component Integration, Menus, Tokens, And Gutenberg Fidelity

Use this reference when WordPress must control menus, logos, colors, global options, component variants, layout parameters, or Gutenberg editing previews for Astro components.

## Core Model

Treat WordPress as a structured configuration and content editor, not just an HTML source.

```text
WordPress
  site settings: logo, menus, colors, social links, footer, contact data
  page content: Gutenberg blocks with attributes
  field data: SCF/ACF option fields and post fields

Astro
  typed client: fetch normalized contracts
  layouts: consume site settings
  component registry: map blocks to Astro components
  styles: consume tokens as CSS variables
```

Best rule: if an editor needs to control presentation safely, expose a small explicit parameter such as `variant`, `layout`, `tone`, `columns`, `showImage`, or `density`. Do not ask editors to paste classes or arbitrary CSS.

## Recommended Astro Shape

```text
src/
  components/
    wordpress/
      WordPressBlocks.astro
      WordPressMenu.astro
    blocks/
      HeroBlock.astro
      FeatureGridBlock.astro
      CtaBlock.astro
      GalleryBlock.astro
  lib/
    site-settings.ts
    wordpress-blocks.ts
    wordpress.ts
```

## Normalized Site Settings Endpoint

Create a small headless plugin or theme helper that exposes exactly what Astro needs. This avoids coupling layouts to WordPress internals, menu plugins, or theme-specific option names.

Even when this endpoint is public, return only frontend-safe values. Normalize URLs, IDs, labels, colors, and booleans; never return raw option dumps, secrets, user records, private fields, or arbitrary plugin settings.

```php
add_action('rest_api_init', function () {
  register_rest_route('headless/v1', '/site', [
    'methods' => 'GET',
    'permission_callback' => '__return_true',
    'callback' => function () {
      $logo_id = get_theme_mod('custom_logo');
      $logo = $logo_id ? wp_get_attachment_image_src($logo_id, 'full') : null;

      return [
        'name' => get_bloginfo('name'),
        'description' => get_bloginfo('description'),
        'logo' => $logo ? [
          'id' => $logo_id,
          'src' => $logo[0],
          'width' => $logo[1],
          'height' => $logo[2],
          'alt' => get_post_meta($logo_id, '_wp_attachment_image_alt', true),
        ] : null,
        'menus' => [
          'primary' => headless_menu('primary'),
          'footer' => headless_menu('footer'),
        ],
        'tokens' => [
          'colors' => [
            'brand' => get_option('headless_brand_color', '#111111'),
            'accent' => get_option('headless_accent_color', '#0f766e'),
          ],
        ],
      ];
    },
  ]);
});

function headless_menu($location) {
  $locations = get_nav_menu_locations();

  if (!isset($locations[$location])) {
    return [];
  }

  $items = wp_get_nav_menu_items($locations[$location]) ?: [];

  return array_map(function ($item) {
    return [
      'id' => $item->ID,
      'label' => $item->title,
      'url' => $item->url,
      'parentId' => (int) $item->menu_item_parent,
      'order' => (int) $item->menu_order,
      'target' => $item->target,
    ];
  }, $items);
}
```

Register menu locations in WordPress:

```php
add_action('after_setup_theme', function () {
  register_nav_menus([
    'primary' => 'Primary navigation',
    'footer' => 'Footer navigation',
  ]);
});
```

If using SCF/ACF options pages, feed those values into the same `headless/v1/site` response rather than making Astro call many option endpoints.

## Astro Site Settings Client

```ts
// src/lib/site-settings.ts
import { wpApiFetch } from "./wordpress";

export type MenuItem = {
  id: number;
  label: string;
  url: string;
  parentId: number;
  order: number;
  target?: string;
};

export type SiteSettings = {
  name: string;
  description: string;
  logo: null | {
    id: number;
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  menus: {
    primary: MenuItem[];
    footer: MenuItem[];
  };
  tokens: {
    colors: {
      brand: string;
      accent: string;
    };
  };
};

let settingsPromise: Promise<SiteSettings> | undefined;

export function getSiteSettings() {
  settingsPromise ??= wpApiFetch<SiteSettings>("headless/v1/site");
  return settingsPromise;
}
```

Use settings in a layout:

```astro
---
import WordPressMenu from "../components/wordpress/WordPressMenu.astro";
import { getSiteSettings } from "../lib/site-settings";

const settings = await getSiteSettings();
---

<html style={`--color-brand: ${settings.tokens.colors.brand}; --color-accent: ${settings.tokens.colors.accent};`}>
  <body>
    <header>
      {settings.logo && (
        <img
          src={settings.logo.src}
          width={settings.logo.width}
          height={settings.logo.height}
          alt={settings.logo.alt || settings.name}
        />
      )}
      <WordPressMenu items={settings.menus.primary} />
    </header>
    <slot />
  </body>
</html>
```

## Menu Component

```astro
---
import type { MenuItem } from "../../lib/site-settings";

type Props = {
  items: MenuItem[];
};

const { items } = Astro.props;
const topLevel = items.filter((item) => item.parentId === 0).sort((a, b) => a.order - b.order);
const childrenByParent = new Map<number, MenuItem[]>();

for (const item of items) {
  if (item.parentId === 0) continue;
  const children = childrenByParent.get(item.parentId) ?? [];
  children.push(item);
  childrenByParent.set(item.parentId, children);
}
---

<nav aria-label="Primary">
  <ul>
    {topLevel.map((item) => (
      <li>
        <a href={item.url} target={item.target || undefined}>{item.label}</a>
        {childrenByParent.has(item.id) && (
          <ul>
            {childrenByParent.get(item.id)!.map((child) => (
              <li><a href={child.url} target={child.target || undefined}>{child.label}</a></li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
</nav>
```

## Gutenberg Blocks As Astro Component Props

For maximum control, expose parsed Gutenberg blocks through REST. This lets Astro render known blocks as first-class components while keeping Gutenberg as the editor UI.

```php
add_action('rest_api_init', function () {
  foreach (['page', 'post'] as $post_type) {
    register_rest_field($post_type, 'headless_blocks', [
      'get_callback' => function ($post) {
        return headless_normalize_blocks(parse_blocks(get_post_field('post_content', $post['id'])));
      },
      'schema' => [
        'description' => 'Parsed blocks for the headless Astro renderer',
        'type' => 'array',
        'context' => ['view', 'edit'],
      ],
    ]);
  }
});

function headless_normalize_blocks($blocks) {
  return array_values(array_filter(array_map(function ($block) {
    if (empty($block['blockName'])) {
      return null;
    }

    return [
      'name' => $block['blockName'],
      'attrs' => $block['attrs'] ?? [],
      'innerHTML' => $block['innerHTML'] ?? '',
      'innerBlocks' => headless_normalize_blocks($block['innerBlocks'] ?? []),
    ];
  }, $blocks)));
}
```

Fetch blocks from Astro:

```ts
export type WpBlock = {
  name: string;
  attrs: Record<string, unknown>;
  innerHTML: string;
  innerBlocks: WpBlock[];
};

export type PageWithBlocks = WpPost & {
  headless_blocks?: WpBlock[];
};

export async function getPageBySlug(slug: string) {
  const pages = await wpFetch<PageWithBlocks[]>("pages", {
    slug,
    _fields: "id,slug,title,headless_blocks",
  });

  return pages[0] ?? null;
}
```

## Astro Block Registry

```ts
// src/lib/wordpress-blocks.ts
import HeroBlock from "../blocks/HeroBlock.astro";
import FeatureGridBlock from "../blocks/FeatureGridBlock.astro";
import CtaBlock from "../blocks/CtaBlock.astro";

export const blockRegistry = {
  "acf/hero": HeroBlock,
  "acf/feature-grid": FeatureGridBlock,
  "acf/cta": CtaBlock,
} as const;

export type KnownBlockName = keyof typeof blockRegistry;

export function isKnownBlock(name: string): name is KnownBlockName {
  return name in blockRegistry;
}
```

Renderer:

```astro
---
// src/components/wordpress/WordPressBlocks.astro
import { blockRegistry, isKnownBlock } from "../../lib/wordpress-blocks";
import type { WpBlock } from "../../lib/wordpress";

type Props = {
  blocks: WpBlock[];
};

const { blocks } = Astro.props;
---

{blocks.map((block) => {
  if (!isKnownBlock(block.name)) {
    return <Fragment set:html={block.innerHTML} />;
  }

  const Component = blockRegistry[block.name];
  return <Component {...block.attrs} innerBlocks={block.innerBlocks} />;
})}
```

Use a fallback only for trusted core blocks. For custom blocks, prefer failing visibly in development so missing mappings are caught early.

## Parametrizable Components

Design Astro components with an explicit, editor-safe prop surface.

```astro
---
type Props = {
  eyebrow?: string;
  title: string;
  summary?: string;
  imageId?: number;
  variant?: "split" | "centered" | "editorial";
  tone?: "light" | "dark" | "brand";
  showCta?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
};

const {
  eyebrow,
  title,
  summary,
  variant = "split",
  tone = "light",
  showCta = false,
  ctaLabel,
  ctaUrl,
} = Astro.props;
---

<section class:list={["hero", `hero--${variant}`, `hero--${tone}`]}>
  {eyebrow && <p class="hero__eyebrow">{eyebrow}</p>}
  <h1>{title}</h1>
  {summary && <p>{summary}</p>}
  {showCta && ctaUrl && <a href={ctaUrl}>{ctaLabel || "Learn more"}</a>}
</section>
```

Good editor-facing parameters:
- `variant`: changes layout family.
- `tone`: maps to approved colors.
- `density`: compact, normal, spacious.
- `columns`: constrained numeric choice such as 2, 3, or 4.
- `mediaPosition`: left, right, top.
- `show...`: boolean feature toggles.

Avoid:
- Raw Tailwind classes.
- Arbitrary CSS.
- Free-form JSON fields.
- Parameters that let editors break accessibility, contrast, spacing, or responsive layout.

## Gutenberg Block Schema

A custom block should define attributes that mirror Astro props. Keep names and allowed values aligned.

```json
{
  "apiVersion": 3,
  "name": "acf/hero",
  "title": "Hero",
  "category": "layout",
  "attributes": {
    "eyebrow": { "type": "string" },
    "title": { "type": "string" },
    "summary": { "type": "string" },
    "variant": {
      "type": "string",
      "enum": ["split", "centered", "editorial"],
      "default": "split"
    },
    "tone": {
      "type": "string",
      "enum": ["light", "dark", "brand"],
      "default": "light"
    },
    "showCta": {
      "type": "boolean",
      "default": false
    },
    "ctaLabel": { "type": "string" },
    "ctaUrl": { "type": "string" }
  }
}
```

The editor UI should expose these as selects, toggles, text inputs, media pickers, and URL controls. Do not expose implementation classes.

## Editor Preview Fidelity

The Gutenberg editor cannot automatically render Astro components. Make it faithful by sharing the contract and visual tokens.

Use this order of fidelity:
1. Same attribute schema as Astro props.
2. Same labels, defaults, enum choices, and validation.
3. Same color tokens from `theme.json` or the normalized settings endpoint.
4. Editor CSS that approximates the Astro component spacing, typography, and breakpoints.
5. Optional server-rendered block preview when the WordPress side can render a close approximation.
6. Astro preview route for exact final rendering.

For exact preview, create an authenticated Astro preview endpoint:

```text
WordPress editor preview button
  -> https://example.com/api/preview?secret=...&id=123&type=page
  -> Astro fetches draft/edit context from WordPress server-side
  -> Astro renders the real component registry
```

Preview rules:
- Preview requests must be authenticated.
- Draft fetching must happen server-side.
- Preview responses should use `Cache-Control: no-store`.
- The preview route should use the same block registry as production pages.

## Theme Tokens

Use WordPress `theme.json` or SCF/ACF options to define editor-approved colors and spacing names, then map them to Astro CSS variables.

Example normalized token response:

```json
{
  "tokens": {
    "colors": {
      "brand": "#111111",
      "accent": "#0f766e",
      "surface": "#ffffff"
    },
    "radii": {
      "card": "8px"
    }
  }
}
```

Astro layout:

```astro
<html
  style={`
    --color-brand: ${settings.tokens.colors.brand};
    --color-accent: ${settings.tokens.colors.accent};
    --color-surface: ${settings.tokens.colors.surface};
    --radius-card: ${settings.tokens.radii.card};
  `}
>
```

Keep token names semantic. Use `brand`, `accent`, `surface`, `muted`, `danger`; avoid editor-facing names like `blue-500` unless the whole design system already uses utility token naming.

## Quality Checklist

- Menus and global settings come from one normalized endpoint.
- Menu trees preserve order, parent/child relationships, labels, URLs, and targets.
- Logo data includes `src`, dimensions, and alt text.
- Color and spacing tokens are semantic and editor-safe.
- Gutenberg attributes mirror Astro component props.
- Visual variants are constrained with enums.
- Unknown custom blocks fail visibly in development.
- Preview uses the same block registry as production whenever exact fidelity is required.
- Editors cannot inject arbitrary classes, CSS, or unaudited JSON.
- Astro layouts do not fetch WordPress menus/options repeatedly per component.
