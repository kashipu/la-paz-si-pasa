# Local Development On Windows

For the complete local runbook with credentials, URLs and verification steps, see:

[local-environment.md](local-environment.md)

This project assumes Windows with Docker Desktop.

## First Run

```powershell
Copy-Item .env.example .env
docker compose up -d cms db
```

Open WordPress at:

```text
http://localhost:8080
```

Optional CLI install:

```powershell
docker compose run --rm wpcli wp core install --url=http://localhost:8080 --title=WordPress-Astro-7 --admin_user=admin --admin_password=change-local-password --admin_email=admin@example.com --skip-email
docker compose run --rm wpcli wp plugin activate headless-core
docker compose run --rm wpcli wp theme activate headless-redirect
```

Then install and run Astro:

```powershell
cd apps/frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Astro reads environment files from `apps/frontend` when commands run there. The root `.env` is for Docker Compose.

Useful one-off build without creating `apps/frontend/.env`:

```cmd
set WORDPRESS_URL=http://localhost:8080&& set PUBLIC_SITE_URL=http://localhost:4321&& npm run build
```

The lack of spaces before `&&` matters in `cmd`; otherwise the value can include a trailing space.

## Verified Local Baseline

The baseline should produce these Astro routes after WordPress is installed:

```text
/404.html
/sample-page/index.html
/blog/hello-world/index.html
/blog/index.html
/index.html
```

## Astro 7 Validation

The project baseline was validated with Astro 7 using:

```powershell
cd apps/frontend
npm run check
npm run build
```

Expected result:

```text
0 check errors
5 static pages generated
```

## Windows Notes

- Keep the repo under a normal user directory, not inside protected system folders.
- Use Docker Desktop with WSL2 backend enabled.
- Prefer named Docker volumes for database and WordPress core files.
- Mount only project-owned plugin/theme folders into the WordPress container.
- Avoid committing `.env`; use `.env.example`.
- If PowerShell blocks a command, try `cmd` equivalents before changing project code.

## Useful Commands

```powershell
docker compose ps
docker compose logs cms
docker compose logs db
docker compose down
docker compose down --volumes
```

Only use `docker compose down --volumes` when you intentionally want to delete local database and WordPress data.
