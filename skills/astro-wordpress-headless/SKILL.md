---
name: astro-wordpress-headless
description: Build production-ready Astro sites backed by headless WordPress. Use when creating, reviewing, deploying, or hardening an Astro project that consumes WordPress content through REST or GraphQL, including SSG/SSR routing, custom post types, SCF/ACF custom fields, menus, logos, design tokens, Gutenberg-driven component props, editor preview fidelity, performance, Docker/Dokploy deployment, hiding the WordPress frontend, and WordPress API security.
---

# Astro + WordPress Headless

Use this skill when WordPress is the CMS and Astro owns the public frontend. Prefer the WordPress REST API first unless the project already uses WPGraphQL or needs strongly typed nested queries that REST cannot serve cleanly.

Primary references:
- Astro WordPress CMS guide: https://docs.astro.build/en/guides/cms/wordpress/
- WordPress REST authentication: https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
- WordPress hardening: https://developer.wordpress.org/advanced-administration/security/hardening/
- WordPress security APIs: https://developer.wordpress.org/apis/security/
- ACF REST API integration: https://www.advancedcustomfields.com/resources/wp-rest-api-integration/
- WordPress `register_rest_field()`: https://developer.wordpress.org/reference/functions/register_rest_field/
- Gutenberg block attributes: https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/
- WordPress `theme.json`: https://developer.wordpress.org/block-editor/how-to-guides/themes/global-settings-and-styles/
- WPGraphQL introduction: https://www.wpgraphql.com/docs/introduction
- WPGraphQL performance: https://www.wpgraphql.com/docs/performance
- WPGraphQL security: https://www.wpgraphql.com/docs/security
- WPGraphQL vs REST: https://www.wpgraphql.com/docs/wpgraphql-vs-wp-rest-api

## Required Reading

Read only the reference needed for the task:

- `references/performance.md`: faster WordPress REST queries, pagination, caching, rebuild strategy, image handling, and Astro SSG/SSR tradeoffs.
- `references/wordpress-setup-security.md`: correct WordPress headless setup, SCF/ACF fields, custom post types, hiding the WordPress frontend, REST authentication, and hardening.
- `references/component-integration.md`: menus, logos, colors, global settings, Gutenberg blocks, component props, and editor preview fidelity.
- `references/graphql-strategy.md`: when to use REST vs WPGraphQL, query examples, typed fragments, caching, security, and validation gates.
- `references/dokploy-docker.md`: Dockerfiles, nginx config, Dokploy environment rules, domains, volumes, SSL, and deployment checklist.

Reusable checks:
- `scripts/check-wpgraphql.mjs`: smoke-test WPGraphQL before deployment when GraphQL is part of the data path.

## Operating Principles

- Keep WordPress responsible for content editing, users, media, taxonomies, custom post types, and editorial previews.
- Keep Astro responsible for routing, layout, components, image rendering, SEO, performance, and public delivery.
- Keep project documentation separate from this skill. Use project docs for implementation-specific details, and feed reusable decisions, problems, and fixes back into the skill after they are validated.
- On Windows, document PowerShell and `cmd` friendly commands. Prefer Docker named volumes for database and WordPress core data, and mount only project-owned plugin/theme folders.
- On Windows sandboxed environments, Docker may warn that it cannot read the user-level `.docker/config.json` while still producing valid Compose output. Treat this as non-blocking unless the operation needs registry authentication or Docker Desktop credentials.
- Fetch WordPress data server-side in Astro frontmatter, endpoints, or library modules. Use client islands only for real browser interactivity.
- Choose SSG for mostly public content. Choose SSR only when content must change immediately per request, per user, or per region.
- Centralize WordPress access in `src/lib/wordpress.ts`.
- Fetch only rendered fields with `_fields`; use `_embed` only when related resources are actually displayed.
- Use WPGraphQL when the route needs typed nested data, menus plus pages plus media in one request, ACF/SCF schemas, or cursor pagination. Keep REST for simple stable endpoints, custom normalized endpoints, health checks, and tiny payloads.
- Treat WordPress-rendered HTML as external input. Sanitize or deliberately trust by source, then render with `set:html`.
- Keep secrets server-only. Never expose application passwords, preview secrets, or write-capable tokens with `PUBLIC_`.
- When a project chooses pure CSS, use global foundations for reset, tokens, typography, spacing, and layout primitives. Keep component styles local to Astro components and drive visual variation through semantic CSS variables and editor-safe props.

## Recommended Project Shape

```text
src/
  components/
    wordpress/
      PostCard.astro
      FeaturedImage.astro
      RenderedHtml.astro
  layouts/
    BaseLayout.astro
    PostLayout.astro
  lib/
    wordpress.ts
    wordpress-graphql.ts
    wordpress-types.ts
    wordpress-blocks.ts
    site-settings.ts
    seo.ts
  pages/
    index.astro
    blog/
      index.astro
      [slug].astro
    api/
      preview.ts
  styles/
    global.css
```

## Minimal WordPress Client

```ts
// src/lib/wordpress.ts
const WP_URL = import.meta.env.WORDPRESS_URL;

if (!WP_URL) {
  throw new Error("WORDPRESS_URL is required");
}

export async function wpApiFetch<T>(
  apiPath: string,
  params: Record<string, string | number | boolean> = {},
): Promise<T> {
  const path = apiPath.replace(/^\/?wp-json\//, "").replace(/^\//, "");
  const url = new URL(`/wp-json/${path}`, WP_URL);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`WordPress request failed: ${response.status} ${url}`);
  }

  return response.json() as Promise<T>;
}

export function wpFetch<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
) {
  return wpApiFetch<T>(`wp/v2/${path.replace(/^\//, "")}`, params);
}

export type WpRendered = {
  rendered: string;
};

export type WpPost = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  link: string;
  title: WpRendered;
  excerpt: WpRendered;
  content?: WpRendered;
  acf?: Record<string, unknown>;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: Record<string, { source_url: string; width: number; height: number }>;
      };
    }>;
  };
};

export function getPosts() {
  return wpFetch<WpPost[]>("posts", {
    per_page: 100,
    _fields: "id,slug,date,modified,link,title,excerpt",
  });
}

export async function getPostBySlug(slug: string) {
  const posts = await wpFetch<WpPost[]>("posts", {
    slug,
    _embed: true,
    _fields: "id,slug,date,modified,link,title,excerpt,content,_embedded",
  });

  return posts[0] ?? null;
}
```

## Static Route Pattern

```astro
---
// src/pages/blog/[slug].astro
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getPostBySlug, getPosts } from "../../lib/wordpress";

export async function getStaticPaths() {
  const posts = await getPosts();

  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

const { slug } = Astro.params;
const post = slug ? await getPostBySlug(slug) : null;

if (!post?.content) {
  return Astro.redirect("/404");
}
---

<BaseLayout title={post.title.rendered}>
  <article>
    <h1 set:html={post.title.rendered} />
    <Fragment set:html={post.content.rendered} />
  </article>
</BaseLayout>
```

For SSR, do not export `getStaticPaths()`. Fetch by `Astro.params.slug` during the request and return a 404 when no post exists.

## Headless WordPress Setup

For details, read `references/wordpress-setup-security.md`.

Minimum setup:
- Set WordPress on a CMS domain such as `cms.example.com`; set Astro on `example.com`.
- Confirm REST works at `https://cms.example.com/wp-json/wp/v2/`.
- Publish custom post types with `show_in_rest => true`.
- Enable REST output for SCF/ACF field groups when using custom fields.
- Use stable slugs and permalinks.
- Keep only the plugins required for content, fields, SEO metadata, previews, and security.
- Hide or redirect the public WordPress frontend without blocking `wp-admin`, `wp-login.php`, `wp-json`, or `wp-content/uploads`.

## Component Integration

For details, read `references/component-integration.md`.

Use a deliberate contract between WordPress and Astro:
- Menus, logo, colors, social links, footer content, and design tokens come from one normalized site settings endpoint.
- Gutenberg block attributes map to Astro component props.
- Blocks that need multiple visualizations expose an explicit `variant`, `layout`, `theme`, `density`, or `behavior` attribute.
- Astro renders known blocks through a component registry; unknown blocks fall back to sanitized `innerHTML` or a development warning.
- The Gutenberg editor preview should use the same attribute schema, labels, options, and design tokens as the Astro component.
- Do not make Astro parse arbitrary WordPress HTML when a structured block or custom field can express the same intent.

## Performance Rules

For full patterns, read `references/performance.md`.

- Use `_fields` everywhere.
- Avoid `_embed` on index/listing pages unless the embedded resource is rendered.
- Consider WPGraphQL when REST would need multiple endpoints, unstable `acf` object shapes, or repeated relationship lookups.
- Fetch by `slug`, taxonomy, `parent`, or `modified_after` instead of fetching everything and filtering in Astro.
- Use paginated helpers for collections over 100 records.
- Cache low-change resources in module-level promises during build.
- Prefer WordPress IDs in custom fields, then resolve media/relations deliberately.
- Use WordPress webhooks to rebuild Astro static sites after publish/update.
- Put Astro behind nginx/CDN immutable asset caching in production.

## Dokploy Deployment

For Dockerfiles and config, read `references/dokploy-docker.md`.

Default Dokploy shape:
- `frontend`: Astro app, built as static output and served by nginx.
- `cms`: WordPress app on `cms.example.com`.
- `db`: MariaDB/MySQL with persistent volume.
- Optional `redis`: object/page cache for WordPress when traffic or editor load justifies it.

Dokploy rules:
- For Astro SSG, pass `WORDPRESS_URL` as a build arg and environment variable during image build.
- For Astro SSR, pass `WORDPRESS_URL` as a runtime environment variable.
- Configure domains and SSL in Dokploy for both Astro and WordPress.
- Persist WordPress uploads and database volumes.
- Never commit `.env`; keep `.env.example` only.

## Quality Checklist

- `WORDPRESS_URL` points to the CMS domain and is not confused with the public Astro domain.
- Static routes use `getStaticPaths()`; SSR routes do not.
- REST calls request only rendered fields.
- Large collections paginate through `X-WP-TotalPages`.
- REST vs WPGraphQL choice is documented per project, and complex routes have query fixtures or contract checks.
- Custom post types and taxonomies are exposed with `show_in_rest`.
- WPGraphQL-enabled post types and taxonomies are exposed with `show_in_graphql` and stable GraphQL names.
- SCF/ACF fields are typed in Astro and requested with `_fields`.
- Menus, logo, colors, and global options are normalized before entering Astro layouts.
- Gutenberg block attributes map to typed Astro component props, including variants and visualization parameters.
- Public WordPress frontend is hidden or redirected, but `wp-admin`, `wp-login.php`, `wp-json`, and uploads still work.
- WordPress dashboard file editing is disabled.
- WordPress plugins/themes/core are updateable and minimal.
- Write-capable REST auth uses application passwords or a stronger auth flow over HTTPS, never public browser credentials.
- Dokploy has persistent volumes, SSL domains, and correct build/runtime env separation.
- GraphQL projects run `scripts/check-wpgraphql.mjs` or an equivalent contract check before deployment.
- `npm run build` succeeds before handoff.
