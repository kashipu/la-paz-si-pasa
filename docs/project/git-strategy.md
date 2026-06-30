# Git Strategy

This repository uses a small environment-oriented strategy that maps cleanly to local work and Dokploy.

## Permanent Branches

```text
main
  Production-ready code.
  Dokploy production should deploy from this branch.

staging
  Preproduction validation.
  Use this branch for final deployment checks before merging to main.

develop
  Daily integration branch.
  New features and documentation branches merge here first.
```

## Short-Lived Branches

Use short-lived branches for focused work.

```text
feature/<scope>
  Product or frontend functionality.

docs/<scope>
  Documentation-only changes.

infra/<scope>
  Docker, Dokploy, CI, deployment or environment changes.

wordpress/<scope>
  WordPress plugin, theme, SCF or CMS contract changes.

astro/<scope>
  Astro routes, components, CSS and data client changes.
```

Examples:

```text
feature/scf-page-hero
wordpress/headless-site-settings
astro/blog-rendering
infra/dokploy-webhook
docs/local-environment
```

## Commit Rules

Keep commits small and explain the intent.

Recommended prefixes:

```text
feat:      user-facing functionality
fix:       bug fix
docs:      documentation only
infra:     Docker, deployment, CI or environment work
wp:        WordPress plugin/theme/config changes
astro:     Astro frontend changes
skill:     reusable skill knowledge updates
chore:     maintenance
```

Examples:

```text
docs: document local WordPress and Astro environment
infra: add Docker Compose baseline
wp: expose headless site settings endpoint
astro: add WordPress post routes
skill: record Windows Docker troubleshooting notes
```

## Merge Flow

```text
feature/docs/infra/wordpress/astro branch
  -> develop
  -> staging
  -> main
```

Rules:

- Merge to `develop` after local verification.
- Merge to `staging` for deployment rehearsal.
- Merge to `main` only when the build is production-ready.
- Do not commit `.env`, secrets, generated `dist`, `.astro`, or `node_modules`.
- Keep reusable lessons in `docs/skill-notes/` before promoting them into `skills/astro-wordpress-headless/`.

## Dokploy Mapping

Recommended Dokploy apps:

```text
Production frontend:
  branch: main
  domain: example.com

Staging frontend:
  branch: staging
  domain: staging.example.com

CMS:
  managed separately as WordPress app/service
  domain: cms.example.com
```

Astro is currently SSG. Any WordPress publish/update/delete event requires a frontend rebuild.

Recommended future automation:

```text
WordPress publish/update/delete
  -> protected webhook
  -> Dokploy redeploy frontend
```

## Local Verification Before Merge

Run from `apps/frontend`:

```powershell
npm run check
npm run build
```

Run from repository root:

```powershell
docker compose ps
```

Expected:

```text
cms Up
db  Up
```
