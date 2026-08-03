---
name: wordpress-scf-headless
description: Add or modify versioned Secure Custom Fields (SCF) custom post types, taxonomies, and field groups for this Docker-based headless WordPress and Astro project. Use when creating a CMS content model from code, exposing SCF fields through the REST API, syncing it locally, or troubleshooting Astro consumption of WordPress media.
---

# WordPress SCF Headless

Keep SCF JSON in `apps/wordpress/scf-json/`; WordPress owns editor-entered content and Astro consumes the REST response through adapters.

## Implement

1. Read the affected Astro contract, mapper, endpoint, `apps/wordpress/mu-plugins/headless-core.php`, and Compose files.
2. Add one SCF JSON definition for the post type and one for its field group. Give fields stable `key` and `name` values. Set the group `show_in_rest` to `1` and match the group's `location` rule to the CPT slug.
3. Configure text and textarea limits with `maxlength`. Editors can change the number later in **SCF → Field Groups → field → Character Limit**.
4. Do not register the same CPT with both SCF JSON and `register_post_type()`. Remove only the duplicate application registration; do not delete WordPress posts or uploads without explicit approval.
5. Make the JSON directory load and save through the `acf/settings/load_json` and `acf/settings/save_json` filters in `headless-core.php`, then bind-mount `apps/wordpress/scf-json` to `wp-content/scf-json` for `cms` and `wpcli`.
6. Map `wpPost.acf.<field_name>` to the existing Astro contract. Preserve mocks as a fallback unless their removal is explicitly requested.

## REST and Astro

Use WordPress's query-form REST URL in the adapter because it works even when local pretty permalink rewrites are unavailable:

```ts
const url = new URL("/index.php", WORDPRESS_URL);
url.searchParams.set("rest_route", "/wp/v2/<rest-base>");
```

When remote images are rendered with `astro:assets`, add the hostname derived from the effective `WORDPRESS_URL` to `image.domains`. Load `.env` with Vite's `loadEnv()` and merge `process.env` last so a command-line local URL wins.

## Local verification

Start WordPress, install SCF once, then sync definitions:

```bash
docker compose up -d db cms
docker compose --profile tools run --rm --entrypoint wp wpcli plugin install secure-custom-fields --activate
docker compose --profile tools run --rm --entrypoint wp wpcli scf json status
docker compose --profile tools run --rm --entrypoint wp wpcli scf json sync
```

Create a published item in WordPress and verify the exact endpoint:

```bash
curl 'http://localhost:8080/index.php?rest_route=/wp/v2/<rest-base>'
```

Restart Astro after changing `WORDPRESS_URL`; config and environment changes do not hot-reload:

```bash
WORDPRESS_URL=http://localhost:8080 npm run dev
```

Run `npm --prefix apps/frontend run check`. Treat 404 fallbacks for deliberately removed CPTs as expected until their adapters are also removed or migrated.
