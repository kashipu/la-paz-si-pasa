# Architecture

This project separates the public site from the CMS.

```text
Astro frontend
  Astro 7 static site generation
  renders public routes
  owns CSS, layout, components, SEO and performance
  fetches WordPress server-side at build time

WordPress CMS
  owns content, media, menus and editor configuration
  exposes a small normalized headless contract
  keeps admin, REST and uploads available

Dokploy
  deploys frontend, CMS and database as separate services
  persists WordPress files/uploads and database data
```

## Default Rendering Mode

Astro starts as SSG. This keeps the public site fast and simple in Dokploy. Content changes require a frontend rebuild.

Move specific routes to SSR only when content must update immediately, depends on request context, or needs authenticated preview behavior.

## API Strategy

Start with REST plus a custom `headless/v1/site` endpoint. Use WPGraphQL later only when REST creates real complexity through nested data, many roundtrips or unstable field contracts.
