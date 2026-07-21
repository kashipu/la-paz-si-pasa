# Local Environment

This page is the single source of truth for running the project locally on Windows.

## Current Stack

```text
Astro:     7.x (^7.0.3)
WordPress: 7.0
Database:  MariaDB 11
Runtime:   Docker Desktop on Windows
Frontend:  Astro SSG
CMS:       WordPress headless
```

## Local URLs

```text
Astro frontend:
http://localhost:4321

WordPress public CMS URL:
http://localhost:8080

WordPress admin:
http://localhost:8080/wp-admin

WordPress REST API:
http://localhost:8080/wp-json/wp/v2/

Headless site settings endpoint:
http://localhost:8080/wp-json/headless/v1/site/

Sample WordPress page rendered by Astro:
http://localhost:4321/sample-page/

Sample WordPress post rendered by Astro:
http://localhost:4321/blog/hello-world/

Astro blog index:
http://localhost:4321/blog/
```

## Local Credentials

These credentials are for the local Docker environment only.

```text
WordPress admin user:     admin
WordPress admin password: change-local-password
WordPress admin email:    admin@example.com
```

Database defaults:

```text
Database host from Docker network: db:3306
Database host from Windows:        localhost:3306
Database name:                     wordpress
Database user:                     wordpress
Database password:                 wordpress
Database root password:            root-password
```

## Environment Files

There are two env contexts.

Root env for Docker Compose:

```text
.env
.env.example
```

Frontend env for Astro:

```text
apps/frontend/.env
apps/frontend/.env.example
```

Astro does not read the root `.env` when commands run inside `apps/frontend`. Keep both examples in sync when local URLs change.

Both `.env` files are ignored by Git.

## First-Time Setup

Run from the repository root:

```powershell
Copy-Item .env.example .env
docker compose up -d cms db
```

Install WordPress with WP-CLI:

```powershell
docker compose --profile tools run --rm wpcli wp core install --url=http://localhost:8080 --title=WordPress-Astro-7 --admin_user=admin --admin_password=change-local-password --admin_email=admin@example.com --skip-email
docker compose --profile tools run --rm wpcli wp plugin activate headless-core
docker compose --profile tools run --rm wpcli wp theme activate headless-redirect
docker compose --profile tools run --rm wpcli wp rewrite structure /%postname%/ --hard
docker compose exec cms chown -R www-data:www-data /var/www/html/wp-content
```

Then prepare Astro:

```powershell
cd apps/frontend
Copy-Item .env.example .env
npm install
```

## Daily Startup

From the repository root:

```powershell
docker compose up -d cms db
```

In another terminal:

```powershell
cd apps/frontend
npm run dev
```

Open:

```text
http://localhost:4321
```

## Verification Checklist

Check containers:

```powershell
docker compose ps
```

Expected services:

```text
cms   Up   0.0.0.0:8080->80/tcp
db    Up   0.0.0.0:3306->3306/tcp
```

Check WordPress version:

```powershell
docker compose --profile tools run --rm wpcli wp core version
```

Expected:

```text
7.0
```

Check REST:

```powershell
curl.exe http://localhost:8080/wp-json/wp/v2/
```

Check the custom headless contract:

```powershell
curl.exe http://localhost:8080/wp-json/headless/v1/site/
```

Expected shape:

```json
{
  "name": "WordPress-Astro-7",
  "description": "",
  "logo": null,
  "menus": {
    "primary": [],
    "footer": []
  },
  "tokens": {
    "colors": {
      "brand": "#171717",
      "accent": "#0f766e",
      "surface": "#ffffff",
      "text": "#1c1917"
    }
  }
}
```

Check Astro:

```powershell
cd apps/frontend
npm run check
npm run build
```

Expected:

```text
0 check errors
5 static pages generated
```

Generated baseline routes:

```text
/404.html
/blog/hello-world/index.html
/blog/index.html
/sample-page/index.html
/index.html
```

## Project-Specific WordPress Pieces

Both live under `wp-content/mu-plugins`, which WordPress always loads — no activation step, no admin toggle, survives a fresh `wordpress_data` volume:

```text
apps/wordpress/mu-plugins/headless-core.php
apps/wordpress/mu-plugins/headless-redirect.php
```

`headless-core.php` purpose:

```text
Expose /wp-json/headless/v1/site
Register menu locations
Expose headless_blocks on pages and posts
Provide the normalized contract consumed by Astro
```

`headless-redirect.php` purpose:

```text
Redirect normal WordPress frontend requests to Astro
Keep wp-admin, wp-login.php, wp-json and uploads available
Add noindex headers to CMS frontend responses
```

## Astro Structure

```text
apps/frontend/src/
  components/
    blocks/
    wordpress/
  layouts/
  lib/
    wordpress/
  pages/
  styles/
    foundations/
```

CSS rules:

```text
Pure CSS only
Global foundations for reset, tokens, typography and layout
Scoped component styles inside .astro files
No raw classes or arbitrary CSS from WordPress
```

WordPress API rules:

```text
Use _fields on REST requests
Avoid _embed unless the route renders embedded resources
Cache low-change resources during build
Resolve media intentionally by ID
Keep browser-side WordPress requests rare
```

## Common Fixes

If Astro says `WORDPRESS_URL is required`:

```powershell
cd apps/frontend
Copy-Item .env.example .env
```

If `/wp-json` returns an empty HTML response:

```powershell
docker compose --profile tools run --rm wpcli wp rewrite structure /%postname%/ --hard
```

If a new WordPress post exists but Astro shows the 404 page in dev, restart the Astro dev server. Static paths from `getStaticPaths()` can be cached for the running dev process.

```powershell
Ctrl+C
npm run dev
```

You can confirm Astro sees the route with:

```powershell
npm run build
```

If uploads or plugin/theme writes fail:

```powershell
docker compose exec cms chown -R www-data:www-data /var/www/html/wp-content
```

If installing `es_CO` fails with `The destination directory already exists and could not be removed`, clean the partial language update and retry:

```powershell
docker compose exec cms rm -rf /var/www/html/wp-content/upgrade/wordpress-7.0-es_co
docker compose exec cms mkdir -p /var/www/html/wp-content/languages
docker compose exec cms mkdir -p /var/www/html/wp-content/upgrade
docker compose exec cms chmod 777 /var/www/html/wp-content/languages
docker compose exec cms chmod 777 /var/www/html/wp-content/upgrade
docker compose --profile tools run --rm wpcli wp language core install es_CO --activate
```

If Docker commands show a Windows `.docker/config.json` permission warning but still print valid output, treat it as non-blocking unless registry authentication is required.

## Shutdown

Stop containers while keeping data:

```powershell
docker compose down
```

Delete containers and local volumes:

```powershell
docker compose down --volumes
```

Only use `--volumes` when you intentionally want to delete local WordPress and database data.

## Git And Environments

See [git-strategy.md](git-strategy.md) for the branch model.

Recommended environment mapping:

```text
develop -> local integration
staging -> preproduction Dokploy app
main    -> production Dokploy app
```
