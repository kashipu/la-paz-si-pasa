# Problems And Fixes To Feed The Skill

Record reusable problems here.

## Template

```text
Problem:
Context:
Cause:
Fix:
Prevention:
Skill update candidate:
```

## Windows PowerShell Runner Permission Error

Problem: reading files through PowerShell failed in the Codex environment with a Windows process permission error.

Context: local Windows workspace.

Cause: the PowerShell launcher was unavailable to the sandboxed runner.

Fix: use `cmd` commands for simple reads and file-system inspection.

Prevention: document Windows-friendly alternatives for common commands.

Skill update candidate: include a Windows note that `cmd` can be a reliable fallback when PowerShell execution is blocked.

## Docker Config Permission Warning On Windows

Problem: `docker compose config` can succeed while printing `Error loading config file: open C:\Users\<user>\.docker\config.json: Acceso denegado`.

Context: local Windows workspace running Docker commands from Codex.

Cause: the command can read project files but cannot read the user's Docker client config from the sandboxed context.

Fix: treat it as non-blocking when the Compose config is printed correctly. If an operation needs registry auth or Docker Desktop state, rerun with approval outside the sandbox.

Prevention: document that Docker warnings about the user-level config may be environmental rather than project errors.

Skill update candidate: add a Windows Docker troubleshooting note for non-blocking Docker client config permission warnings.

## WP-CLI Arguments With Spaces In Windows Cmd

Problem: `docker compose run wpcli wp core install --title="WordPress Astro 7"` can be parsed as multiple positional arguments in `cmd`.

Context: Windows command execution through `cmd`.

Cause: quoting behavior differs across shells and can be affected by the command runner.

Fix: use shell-safe values without spaces for automation, such as `--title=WordPress-Astro-7`, or run the command directly in PowerShell with verified quoting.

Prevention: document Windows-friendly WP-CLI examples using `--key=value` and no spaces for values that do not require them.

Skill update candidate: include WP-CLI command examples that work reliably in Windows `cmd`.

## WordPress Uploads Permission Warning After WP-CLI Install

Problem: WP-CLI installs WordPress but warns that it cannot create `wp-content/uploads/YYYY/MM`.

Context: WordPress files live in a Docker named volume and WP-CLI writes through a separate container.

Cause: file ownership in the shared volume can differ between the CLI container and the Apache/PHP runtime container.

Fix: run `docker compose exec cms chown -R www-data:www-data /var/www/html/wp-content`.

Prevention: after automated local install, normalize ownership of WordPress content directories before testing media uploads.

Skill update candidate: include a Docker volume ownership check for WordPress + WP-CLI local setups.

## Headless Theme Redirects REST API

Problem: a minimal headless redirect theme can accidentally redirect `/wp-json` to the Astro frontend.

Context: WordPress `template_redirect` used `wp_is_json_request()` but REST requests still received a 301.

Cause: `wp_is_json_request()` is not a complete guard for REST routing in this context.

Fix: check `(defined('REST_REQUEST') && REST_REQUEST)` and guard `REQUEST_URI` prefixes such as `/wp-json` and `/wp-content/uploads` before redirecting.

Prevention: always verify `/wp-json/wp/v2/` and custom headless endpoints after activating a redirect theme.

Skill update candidate: update headless redirect examples to guard `REST_REQUEST`, `/wp-json` and `/wp-content/uploads`.

## Astro App Does Not Read Root Env In Monorepo

Problem: `npm run build` from `apps/frontend` fails with `WORDPRESS_URL is required` even though the repository root has `.env.example`.

Context: Astro runs inside a nested app directory.

Cause: Astro loads env files relative to the frontend project root, not the repository root.

Fix: keep `apps/frontend/.env.example` and copy it to `apps/frontend/.env` for local frontend commands. Keep root `.env` for Docker Compose.

Prevention: document env ownership clearly in monorepo-style headless projects.

Skill update candidate: include separate root Compose env and frontend Astro env examples.

## Background Dev Server Blocked From Sandboxed Windows Runner

Problem: trying to start Astro in the background with `cmd start` returned `Acceso denegado`.

Context: Windows desktop workspace with a sandboxed command runner.

Cause: background process creation can be blocked even when normal commands and Docker commands work.

Fix: run the dev server from the user's visible terminal:

```powershell
cd apps/frontend
npm run dev
```

Prevention: validate with `npm run build` from Codex, and only start long-running dev servers in a user-owned terminal when background helpers are blocked.

Skill update candidate: add a Windows note about background dev server limitations in sandboxed automation.

## WordPress Language Install Leaves Partial Upgrade Directory

Problem: `wp language core install es_CO --activate` fails with `The destination directory already exists and could not be removed`.

Context: WordPress 7 local Docker setup on Windows, using a named WordPress volume and a separate WP-CLI container.

Cause: a previous failed translation install can leave a partial directory such as `/var/www/html/wp-content/upgrade/wordpress-7.0-es_co`, and the CLI container cannot remove it cleanly because of volume permissions.

Fix:

```powershell
docker compose exec cms rm -rf /var/www/html/wp-content/upgrade/wordpress-7.0-es_co
docker compose exec cms mkdir -p /var/www/html/wp-content/languages
docker compose exec cms mkdir -p /var/www/html/wp-content/upgrade
docker compose exec cms chmod 777 /var/www/html/wp-content/languages
docker compose exec cms chmod 777 /var/www/html/wp-content/upgrade
docker compose --profile tools run --rm wpcli wp language core install es_CO --activate
```

Prevention: create and loosen local-only permissions on `wp-content/languages` and `wp-content/upgrade` before installing translations with WP-CLI in Docker.

Skill update candidate: add a WordPress Docker language-install troubleshooting section for partial translation update directories.

## New WordPress Post Not Visible In Astro Dev Route

Problem: a newly published WordPress post exists in REST and is generated by `astro build`, but the running Astro dev server shows the 404 page.

Context: Astro static blog route uses `getStaticPaths()` from WordPress posts.

Cause: the running dev process can keep the previous route list.

Fix: restart `npm run dev`.

Prevention: document that SSG route discovery from WordPress should be reloaded after adding new content locally; in production, content changes require a rebuild.

Skill update candidate: add a note for headless WordPress + Astro SSG projects that new slugs require dev restart or production rebuild.
