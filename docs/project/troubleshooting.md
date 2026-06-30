# Troubleshooting

Use this file for project-specific issues. Reusable findings should also be summarized in `docs/skill-notes/problems-and-fixes.md`.

## WordPress REST Fails During Astro Build

Check:

- `WORDPRESS_URL` points to the CMS URL, not the Astro URL.
- WordPress container is running.
- Pretty permalinks are configured.
- The headless plugin is active.
- `/wp-json/wp/v2/` is reachable in the browser.
- Pretty permalinks are enabled. Run `docker compose run --rm wpcli wp rewrite structure /%postname%/ --hard` if `/wp-json` returns an empty HTML response.

## Build Is Slow

Check:

- Missing `_fields` in a request.
- `_embed` used on listing pages.
- N+1 media or taxonomy requests.
- Large collections without pagination.
- WordPress plugins slowing REST responses.

## Windows Volume Issues

Check:

- Docker Desktop is running.
- The repo is in a shared user directory.
- File paths do not depend on Linux-only scripts.
- The mounted plugin/theme folders exist before starting containers.

## Astro Says WORDPRESS_URL Is Required

If running commands from `apps/frontend`, copy the frontend env file:

```powershell
cd apps/frontend
Copy-Item .env.example .env
```

The root `.env` belongs to Docker Compose; Astro reads env files from the frontend app directory.

## New WordPress Post Shows Astro 404 In Dev

If a newly published WordPress post exists in REST but Astro shows:

```text
Pagina no encontrada
El contenido solicitado no existe o cambio de direccion.
```

Restart the Astro dev server:

```powershell
Ctrl+C
npm run dev
```

Why: the blog detail route uses `getStaticPaths()`. In dev, the running Astro process can keep the previous static route list until restarted.

To verify the route is valid:

```powershell
npm run build
```

The build output should include the new route, for example:

```text
/blog/hola-mundo-desde-astro-7-headless/index.html
```

## Background Dev Server Is Blocked

If automated startup returns `Acceso denegado`, run Astro from your own terminal:

```powershell
cd apps/frontend
npm run dev
```

WordPress can remain running through Docker at `http://localhost:8080`.

## WordPress Language Install Fails With Existing Destination

If `wp language core install es_CO --activate` fails with:

```text
The destination directory already exists and could not be removed.
Translation update failed.
```

Clean the partial update directory and retry:

```powershell
docker compose exec cms rm -rf /var/www/html/wp-content/upgrade/wordpress-7.0-es_co
docker compose exec cms mkdir -p /var/www/html/wp-content/languages
docker compose exec cms mkdir -p /var/www/html/wp-content/upgrade
docker compose exec cms chmod 777 /var/www/html/wp-content/languages
docker compose exec cms chmod 777 /var/www/html/wp-content/upgrade
docker compose --profile tools run --rm wpcli wp language core install es_CO --activate
```
