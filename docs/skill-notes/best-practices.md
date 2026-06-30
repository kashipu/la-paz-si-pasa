# Best Practices To Feed The Skill

- Keep the skill as reusable knowledge, not as runtime project dependency.
- Keep project documentation close to the repo implementation.
- Use pure CSS foundations and component-scoped styles when the project wants maximum portability.
- Centralize WordPress data access in Astro.
- Request only needed REST fields with `_fields`.
- Cache low-change WordPress resources during Astro builds.
- Keep WordPress, Astro frontend and database as separate Dokploy services.
- In nested Astro apps, keep a frontend `.env.example` in addition to the root Docker Compose `.env.example`.
- Verify `/wp-json/wp/v2/` after activating a redirect theme; a 301 or empty HTML response means the headless guard or rewrite rules are wrong.
- In WordPress 7 headless projects, prefer PHP-only block registration for early custom blocks before introducing a WordPress-side JavaScript build.
- Treat WordPress 7 AI/Abilities/Connectors as opt-in editorial tooling, not as a frontend rendering dependency.
