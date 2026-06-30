# Dokploy And Docker Deployment

Use this reference when deploying Astro + headless WordPress on Dokploy or preparing Docker/nginx files for production.

## Recommended Dokploy Topology

```text
frontend app
  Astro SSG or SSR
  domain: example.com

cms app
  WordPress
  domain: cms.example.com
  volume: wordpress files/uploads

database
  MariaDB or MySQL
  volume: database data

optional redis
  object cache for WordPress
```

Keep the Astro frontend and WordPress CMS as separate Dokploy apps/services. This makes rebuilds, rollbacks, domains, SSL, and logs easier to reason about.

## Astro SSG Dockerfile

Use this when `output: "static"` or default Astro static output is enough.

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

ARG WORDPRESS_URL
ARG PUBLIC_SITE_URL
ENV WORDPRESS_URL=${WORDPRESS_URL}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

In Dokploy, configure SSG variables as build args:

```text
WORDPRESS_URL=https://cms.example.com
PUBLIC_SITE_URL=https://example.com
```

Static output is already built. Changing runtime env vars after build will not change generated pages; rebuild the image.

## Astro nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /404.html;
    }

    location ~* \.(js|css|woff2?|ttf|eot|ico|png|jpg|jpeg|svg|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location ~* \.(html|xml|json)$ {
        add_header Cache-Control "public, max-age=300, stale-while-revalidate=86400";
        try_files $uri =404;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
}
```

For SPAs, use `/index.html` fallback. For content sites, prefer real Astro routes and `/404.html`.

## Astro SSR Dockerfile

Use SSR only when needed. Install the Node adapter in the project first.

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
```

For SSR, set runtime env vars in Dokploy:

```text
WORDPRESS_URL=https://cms.example.com
PUBLIC_SITE_URL=https://example.com
WORDPRESS_PREVIEW_SECRET=...
```

## WordPress Docker Compose

Use Dokploy managed MySQL/MariaDB when available. If using compose, persist both database and uploads.

```yaml
services:
  wordpress:
    image: wordpress:php8.3-apache
    restart: unless-stopped
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: ${WORDPRESS_DB_PASSWORD}
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_CONFIG_EXTRA: |
        define('WP_HOME', 'https://cms.example.com');
        define('WP_SITEURL', 'https://cms.example.com');
        define('DISALLOW_FILE_EDIT', true);
        define('FORCE_SSL_ADMIN', true);
    volumes:
      - wordpress_data:/var/www/html
    depends_on:
      - db

  db:
    image: mariadb:11
    restart: unless-stopped
    environment:
      MARIADB_DATABASE: wordpress
      MARIADB_USER: wordpress
      MARIADB_PASSWORD: ${WORDPRESS_DB_PASSWORD}
      MARIADB_ROOT_PASSWORD: ${MARIADB_ROOT_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wordpress_data:
  db_data:
```

Do not commit real passwords. Keep only `.env.example`.

## Dokploy Setup Steps

1. Create project in Dokploy.
2. Create WordPress CMS app on `cms.example.com`.
3. Attach persistent volumes for WordPress and database.
4. Configure SSL for `cms.example.com`.
5. Install and configure required WordPress plugins and headless theme.
6. Create Astro frontend app on `example.com`.
7. Add `WORDPRESS_URL` and `PUBLIC_SITE_URL` as build args for SSG or runtime env for SSR.
8. Add Astro Dockerfile and nginx config.
9. Deploy CMS first, verify `/wp-json/wp/v2/`.
10. Deploy Astro, verify pages, assets, sitemap, and 404.
11. Add a WordPress webhook or manual Dokploy redeploy process for SSG content updates.
12. Verify logs and backups.

## Webhook Strategy

For SSG:
- On WordPress publish/update/delete, trigger a Dokploy redeploy of the Astro app.
- Protect the webhook with a secret.
- Debounce frequent updates if editors publish many changes in a short window.

For SSR:
- Rebuild only for code changes.
- Use runtime caching for public pages.
- Use `no-store` for preview and authenticated responses.

## Deployment Checks

Astro:
- `npm run build` passes.
- nginx serves hashed assets with immutable cache.
- HTML/JSON/XML get short cache or CDN revalidation.
- `WORDPRESS_URL` points to the CMS domain.
- No secret appears in generated client JS.

WordPress:
- `/wp-admin` works.
- `/wp-login.php` works.
- `/wp-json/wp/v2/` works.
- `/wp-content/uploads/...` works when media is public.
- Normal frontend routes redirect or noindex as intended.
- `DISALLOW_FILE_EDIT` is enabled.
- Backups cover database and uploads.

Dokploy:
- Domains and SSL are configured.
- Persistent volumes are attached.
- Build args and runtime env vars are not mixed up.
- Logs are readable for both Astro and WordPress.
- Redeploy path is documented for editors or maintainers.
