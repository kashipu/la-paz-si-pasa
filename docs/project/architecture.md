# Architecture

This project separates the public site from the CMS.

```text
Astro frontend
  Astro 7 server-rendered (SSR, node adapter, standalone mode)
  renders public routes
  owns CSS, layout, components, SEO and performance
  fetches WordPress server-side on every request

WordPress CMS
  owns content, media, menus and editor configuration
  exposes a small normalized headless contract
  keeps admin, REST and uploads available

Dokploy
  deploys frontend, CMS and database as separate services
  persists WordPress files/uploads and database data
```

## Default Rendering Mode

Astro runs as SSR: every request fetches fresh data from WordPress, so publishing content shows up immediately without a frontend rebuild or redeploy.

`apps/frontend/src/adapters/wordpress/cache.ts` intentionally does not memoize across requests for this reason. Move back to SSG (or add a short TTL to that cache) only if WordPress load becomes a real problem — most of this site's content changes rarely enough that per-request fetches are cheap.

## API Strategy

Start with REST plus a custom `headless/v1/site` endpoint. Use WPGraphQL later only when REST creates real complexity through nested data, many roundtrips or unstable field contracts.
