# Dokploy Deployment

Single "Docker Compose" application in Dokploy, pointed at this repo, using
`compose.prod.yaml` (not `compose.yaml`, which is dev-only: it publishes the
DB port and runs the Astro dev server).

```text
frontend  Astro build served by nginx (docker/astro/Dockerfile)
cms       WordPress (official image, no custom Dockerfile)
db        MariaDB, internal network only (no published port)
```

## Dokploy Setup

1. New Project → New Application → **Docker Compose**, source = this git repo.
2. Compose path: `compose.prod.yaml`.
3. Set the env vars below in the Dokploy app's Environment tab.
4. Add two domains in Dokploy, each pointed at the matching compose service
   and container port `80`:
   - `cms` service → `cms.<domain>`
   - `frontend` service → `<domain>`
5. Deploy.

Required env vars (Dokploy Environment tab, not committed):

```text
WORDPRESS_URL=https://cms.<domain>
PUBLIC_SITE_URL=https://<domain>
WORDPRESS_DB_NAME=wordpress
WORDPRESS_DB_USER=wordpress
WORDPRESS_DB_PASSWORD=<strong random value>
WORDPRESS_DB_ROOT_PASSWORD=<strong random value>
WORDPRESS_TABLE_PREFIX=wp_
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
