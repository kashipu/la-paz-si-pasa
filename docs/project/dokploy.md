# Dokploy Deployment

Single "Docker Compose" application in Dokploy, pointed at this repo, using
`compose.prod.yaml` (not `compose.yaml`, which is dev-only: it publishes the
DB port and runs the Astro dev server).

```text
frontend  Astro SSR, node adapter standalone (docker/astro/Dockerfile)
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

## Frontend Env

Set both as build args (Dockerfile `ARG`/`ENV`) and as the `frontend` service's runtime `environment` in `compose.prod.yaml` — SSR fetches WordPress on every request, so the running process needs them too, not just the build:

```text
WORDPRESS_URL=https://cms.example.com
PUBLIC_SITE_URL=https://example.com
```

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
4. `mu-plugins` (`headless-core`, `headless-redirect`) load automatically — no activation step. After any code change to a file under `apps/wordpress/mu-plugins`, restart the `cms` container once so PHP picks it up (opcache does not see bind-mount changes made after the process started).
5. Deploy Astro frontend.
6. Verify pages, assets, 404 and cache headers.

No rebuild webhook needed: the frontend is SSR, so publishing content in WordPress shows up on the next request.
