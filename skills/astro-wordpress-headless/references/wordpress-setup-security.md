# WordPress Headless Setup And Security

Use this reference when configuring WordPress as a headless CMS, exposing REST contracts, hiding the default frontend, handling SCF/ACF, previews, or hardening the CMS.

## Domain Model

Use separate domains:

```text
https://example.com      -> Astro public frontend
https://cms.example.com  -> WordPress admin, REST API, media
```

Set WordPress `home` and `siteurl` to the CMS domain unless the project has a deliberate reverse-proxy setup.

```php
define('WP_HOME', 'https://cms.example.com');
define('WP_SITEURL', 'https://cms.example.com');
```

Astro should use:

```env
WORDPRESS_URL=https://cms.example.com
PUBLIC_SITE_URL=https://example.com
WORDPRESS_PREVIEW_SECRET=replace-me
```

Never expose application passwords or preview secrets as `PUBLIC_*`.

## Required WordPress Configuration

- Pretty permalinks enabled.
- REST API reachable at `/wp-json/wp/v2/`.
- Custom post types registered with `show_in_rest => true`.
- Custom taxonomies registered with `show_in_rest => true`.
- SCF/ACF field groups enabled for REST when raw `acf` output is acceptable.
- Minimal plugins: fields, SEO metadata if needed, preview bridge, security, cache only when justified.
- Updates enabled and operational for core, plugins, and themes.
- Admin users use strong passwords and MFA where the auth stack supports it.

## Custom Post Types

```php
register_post_type('product', [
  'public' => true,
  'show_in_rest' => true,
  'rest_base' => 'products',
  'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions'],
]);

register_taxonomy('product_category', ['product'], [
  'public' => true,
  'show_in_rest' => true,
  'rest_base' => 'product-categories',
]);
```

Fetch CPTs from Astro by REST base:

```ts
export function getProducts() {
  return wpFetch<WpPost[]>("products", {
    per_page: 100,
    _fields: "id,slug,title,excerpt",
  });
}
```

## SCF And ACF Fields

Use custom fields for structured content that should not be parsed from `content.rendered`: hero settings, product specs, CTA links, gallery relationships, SEO overrides, prices, coordinates, badges, and layout choices.

When using Secure Custom Fields or Advanced Custom Fields, enable REST exposure for the field group and verify the endpoint output before writing Astro code. Typical REST output appears under `acf`.

```json
{
  "id": 42,
  "slug": "sample-post",
  "acf": {
    "hero_title": "A better headline",
    "hero_image": 123,
    "featured": true
  }
}
```

Request only the fields needed:

```ts
type PostFields = {
  hero_title?: string;
  hero_image?: number;
  featured?: boolean;
};

type PostWithFields = WpPost & {
  acf?: PostFields;
};

export async function getPostHero(slug: string) {
  const posts = await wpFetch<PostWithFields[]>("posts", {
    slug,
    _fields: "id,slug,title,acf.hero_title,acf.hero_image,acf.featured",
    acf_format: "light",
  });

  return posts[0] ?? null;
}
```

Use `acf_format=light` for lighter machine-friendly values. Use `acf_format=standard` only when the frontend needs formatted values from WordPress field logic.

Prefer IDs in fields, then resolve related resources intentionally:

```ts
export async function getMediaById(id: number) {
  return wpFetch("media/" + id, {
    _fields: "id,source_url,alt_text,media_details",
  });
}
```

## Normalized Headless Contract

For heavily reused fields, expose a clean `headless` field instead of coupling Astro to editor-facing field names.

```php
add_action('rest_api_init', function () {
  register_rest_field('post', 'headless', [
    'get_callback' => function ($post) {
      return [
        'heroTitle' => get_post_meta($post['id'], 'hero_title', true),
        'featured' => (bool) get_post_meta($post['id'], 'featured', true),
      ];
    },
    'schema' => [
      'description' => 'Headless frontend fields',
      'type' => 'object',
      'context' => ['view'],
    ],
  ]);
});
```

Use this pattern when field names are unstable, editors need to reorganize field groups, PHP formatting is required, or the frontend should consume a versioned API contract.

## Hide The WordPress Frontend

Do not rely on hiding WordPress as the primary security model. Hide the frontend to prevent duplicate public pages, accidental indexing, and editor confusion. Security still requires hardening, updates, least privilege, and safe REST contracts.

Recommended approach:
- Keep `wp-admin`, `wp-login.php`, `wp-json`, and `wp-content/uploads` public as needed.
- Redirect normal frontend page requests to the Astro domain.
- Add `noindex` headers to CMS responses that are not intended for public SEO.
- Keep media public only if Astro needs direct remote images from WordPress.

Minimal headless theme:

```php
<?php
// wp-content/themes/headless/index.php
wp_safe_redirect('https://example.com', 301);
exit;
```

Better theme guard:

```php
<?php
// wp-content/themes/headless/functions.php
add_action('template_redirect', function () {
  $request_uri = $_SERVER['REQUEST_URI'] ?? '';

  if (
    is_admin()
    || wp_doing_ajax()
    || wp_is_json_request()
    || (defined('REST_REQUEST') && REST_REQUEST)
    || str_starts_with($request_uri, '/wp-json')
    || str_starts_with($request_uri, '/wp-content/uploads')
  ) {
    return;
  }

  wp_safe_redirect('https://example.com', 301);
  exit;
});
```

nginx guard for a dedicated WordPress container:

```nginx
location / {
    return 301 https://example.com$request_uri;
}

location = /wp-login.php {
    try_files $uri =404;
    fastcgi_pass wordpress:9000;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}

location ^~ /wp-admin/ {
    try_files $uri $uri/ /index.php?$args;
}

location ^~ /wp-json/ {
    try_files $uri $uri/ /index.php?$args;
}

location ^~ /wp-content/uploads/ {
    try_files $uri =404;
    expires 30d;
    add_header Cache-Control "public";
}
```

Adjust nginx syntax to the actual WordPress image used by the deployment. Apache deployments should use equivalent rewrite rules outside the WordPress-managed block.

## REST Authentication

Public reads can usually be anonymous. Drafts, previews, private posts, writes, and user data must authenticate.

Use:
- Cookie + nonce only for code running inside WordPress admin.
- Application passwords over HTTPS for server-to-server scripts, preview endpoints, or build systems.
- OAuth/JWT only when the project already has that auth layer and it is maintained.

Do not:
- Send WordPress username/password from browser JavaScript.
- Expose application passwords in Astro client bundles.
- Use development-only basic-auth plugins in production.
- Grant admin credentials to build systems when read-only/editor-scoped access is enough.

## Hardening Checklist

In `wp-config.php`:

```php
define('DISALLOW_FILE_EDIT', true);
define('FORCE_SSL_ADMIN', true);
```

Operational checklist:
- Use HTTPS for admin, REST auth, and previews.
- Keep WordPress core, plugins, and themes updated.
- Delete unused plugins and themes.
- Avoid plugins that execute arbitrary PHP from database content.
- Use least-privilege users for editors and API access.
- Avoid `admin`, `webmaster`, or obvious admin usernames.
- Protect `wp-config.php` at the server level when possible.
- Restrict write permissions to uploads and required cache directories.
- Add a WAF or reverse-proxy filtering when the CMS is internet-facing.
- Back up database and uploads; test restores.
- Keep access logs and WordPress/PHP error logs available for incident review.

## Common Failure Modes

- Blocking `/wp-json` while hiding the frontend, which breaks Astro builds.
- Redirecting `/wp-content/uploads`, which breaks remote images.
- Exposing private SCF/ACF fields because the whole `acf` object was requested.
- Using `_embed` everywhere and making every list page slow.
- Treating hidden WordPress frontend as sufficient security.
- Baking secrets into Astro static bundles.
- Forgetting that SSG output will not update until Dokploy rebuilds.
