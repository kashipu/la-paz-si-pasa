# Performance And Fast WordPress Queries

Use this reference when the task touches build speed, page speed, REST payload size, slow WordPress responses, Astro SSG/SSR decisions, or cache strategy.

## Query Rules

- Use `_fields` on every REST request. Fetch only fields rendered by that route.
- Avoid `_embed` on index pages unless the listing renders embedded media, authors, or terms.
- Prefer one wider request over many per-card requests. N+1 calls are the most common headless WordPress slowdown.
- Use `per_page=100` for build-time collection fetches, then paginate through response headers for larger sites.
- Request by stable filters such as `slug`, `categories`, `tags`, `parent`, `modified_after`, or custom REST query vars.
- Cache repeated taxonomy, menu, options, and settings calls inside module-level promises during build.
- Keep browser-side WordPress requests rare. Server-side fetches avoid CORS friction, hide secrets, and make CDN caching easier.
- Use WPGraphQL when REST would require multiple endpoint roundtrips for related data such as posts plus authors plus media plus categories plus menus.

## REST Or WPGraphQL

REST is usually enough for:
- Small lists with `_fields`.
- Single post/page fetches by slug.
- Custom normalized endpoints such as `headless/v1/site`.
- Health checks and deployment smoke tests.
- Highly cacheable public JSON endpoints.

WPGraphQL can be better for:
- Nested data that would otherwise produce REST N+1 calls.
- Menus, pages, media, authors, taxonomies, and settings needed together.
- Stronger schema and tooling around SCF/ACF fields.
- Cursor pagination on large datasets.
- Query fragments that mirror Astro component prop contracts.

Do not adopt GraphQL only because it sounds faster. Compare the actual route: number of requests, payload size, response time, cacheability, and schema stability.

## Pagination Helper

```ts
type WpListResult<T> = {
  items: T[];
  totalPages: number;
};

export async function wpFetchList<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
): Promise<WpListResult<T>> {
  const url = new URL(`/wp-json/wp/v2/${path.replace(/^\//, "")}`, WP_URL);
  url.searchParams.set("per_page", "100");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`WordPress list request failed: ${response.status} ${url}`);
  }

  return {
    items: await response.json() as T[],
    totalPages: Number(response.headers.get("X-WP-TotalPages") ?? "1"),
  };
}

export async function wpFetchAll<T>(
  path: string,
  params: Record<string, string | number | boolean> = {},
): Promise<T[]> {
  const firstPage = await wpFetchList<T>(path, params);
  const pages = [firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await wpFetchList<T>(path, { ...params, page });
    pages.push(nextPage.items);
  }

  return pages.flat();
}
```

## Build-Time Cache

```ts
const cache = new Map<string, Promise<unknown>>();

export function wpCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    cache.set(key, loader());
  }

  return cache.get(key) as Promise<T>;
}

export function getSiteCategories() {
  return wpCached("categories", () =>
    wpFetchAll("categories", {
      _fields: "id,slug,name,count",
    }),
  );
}
```

Use this for categories, menus, site options, SEO defaults, and low-change settings. Do not cache preview, authenticated draft responses, or per-user responses in shared module state.

## SSG Vs SSR

Use SSG when:
- Public content can lag until a rebuild.
- Pages are mostly posts, pages, landing pages, catalogs, or docs.
- Dokploy can rebuild from Git or a webhook.

Use SSR when:
- Content must update immediately after publish.
- Pages depend on request cookies, geolocation, auth, or personalization.
- Preview mode must render drafts without a separate preview endpoint.

For SSR, use platform/CDN caching rather than a custom cache layer first. Public pages can usually use short `s-maxage` plus `stale-while-revalidate`; authenticated preview responses should use `no-store`.

## WordPress Performance

- Keep plugins minimal. Every plugin can affect admin, REST responses, and database queries.
- Use object caching only when the site has enough traffic or editor activity to justify Redis.
- Keep media sizes intentional. Generate the image sizes Astro actually uses.
- Prefer media IDs in SCF/ACF fields and resolve only when needed.
- Avoid rendering WordPress shortcodes in API output unless the frontend intentionally supports them.
- Use a webhook on publish/update/delete to rebuild the Astro SSG app.
- For huge sites, build routes from `modified_after` or a content manifest instead of full-site rebuilds when the deploy system supports partial rebuild logic.

## Astro Page Speed

- Serve static Astro through nginx with immutable caching for hashed assets.
- Use Astro image optimization when remote WordPress image domains are configured.
- Set explicit image width/height or aspect ratio to avoid layout shift.
- Keep React/Vue/Svelte islands small and hydrate with `client:visible` or `client:idle` unless immediate interactivity is required.
- Generate RSS, sitemap, and JSON-LD at build time when possible.
