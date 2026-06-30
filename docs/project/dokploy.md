# Dokploy Deployment

Use separate services.

```text
frontend  Astro static build served by nginx
cms       WordPress
db        MariaDB or MySQL
```

## Frontend Build Args

For Astro SSG:

```text
WORDPRESS_URL=https://cms.example.com
PUBLIC_SITE_URL=https://example.com
```

These values are baked into the static build. Changing them requires a rebuild.

## CMS Runtime Env

```text
WORDPRESS_DB_HOST
WORDPRESS_DB_NAME
WORDPRESS_DB_USER
WORDPRESS_DB_PASSWORD
WORDPRESS_CONFIG_EXTRA
```

Persist:

```text
/var/www/html
/var/lib/mysql
```

## Deploy Order

1. Deploy database.
2. Deploy WordPress CMS and configure SSL.
3. Verify `/wp-json/wp/v2/`.
4. Activate `Headless Core` plugin and `Headless Redirect` theme.
5. Deploy Astro frontend.
6. Verify pages, assets, 404 and cache headers.
7. Add a publish/update webhook or documented manual redeploy flow.
