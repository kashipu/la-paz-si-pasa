# WordPress Headless Contract

WordPress exposes only frontend-safe data.

## Endpoints

```text
/wp-json/wp/v2/posts
/wp-json/wp/v2/pages
/wp-json/wp/v2/media/{id}
/wp-json/headless/v1/site
```

## Site Settings

The `headless/v1/site` endpoint returns:

```text
name
description
logo
menus.primary
menus.footer
tokens.colors
```

## Performance Rules

- Use `_fields` on REST requests.
- Avoid `_embed` on listing pages.
- Paginate large collections.
- Cache settings, menus, media and taxonomy lookups during build.
- Fetch WordPress from Astro server-side, not from browser JavaScript.
- Resolve media by ID only where the route actually renders media.

## Security Rules

- Public reads can be anonymous.
- Never expose application passwords in public bundles.
- Keep admin, login, REST and uploads reachable.
- Redirect the default WordPress frontend to Astro.
- Keep `DISALLOW_FILE_EDIT` enabled.
