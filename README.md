# WordPress + Astro 7 Headless Base

Base modular para construir sitios Astro 7 conectados a WordPress headless, con Docker local en Windows y una ruta clara hacia Dokploy.

## Estructura

```text
apps/frontend/                 Astro 7
apps/wordpress/plugins/        plugin headless propio
apps/wordpress/themes/         tema de redireccion headless
docker/astro/                  Dockerfile y nginx para Astro
docs/project/                  documentacion del proyecto
docs/skill-notes/              aprendizajes para alimentar la skill
skills/astro-wordpress-headless/ skill reusable
```

## Local

Full local setup, credentials, URLs and verification steps live in:

[docs/project/local-environment.md](docs/project/local-environment.md)

Quick start:

1. Copiar variables:

```powershell
Copy-Item .env.example .env
```

2. Levantar WordPress y base de datos:

```powershell
docker compose up -d cms db
```

3. Instalar dependencias del frontend:

```powershell
cd apps/frontend
Copy-Item .env.example .env
npm install
npm run dev
```

4. URLs locales:

```text
Astro:     http://localhost:4321
WordPress: http://localhost:8080
REST:      http://localhost:8080/wp-json/wp/v2/
Headless:  http://localhost:8080/wp-json/headless/v1/site
```

## Principios

- WordPress edita contenido, menus, media, tokens y configuracion.
- Astro renderiza rutas, layouts, componentes, SEO y CSS.
- CSS puro: foundations globales y estilos propios por componente.
- API WordPress centralizada, con `_fields`, cache de build y paginacion.
- Dokploy mantiene frontend, CMS y base de datos como servicios separados.

## Documentacion

```text
docs/project/local-environment.md     entorno local, URLs y credenciales
docs/project/architecture.md          arquitectura general
docs/project/wordpress-headless.md    contrato WordPress headless
docs/project/astro-css-system.md      sistema CSS puro
docs/project/dokploy.md               estrategia Dokploy
docs/project/git-strategy.md          ramas, commits y entornos
docs/project/troubleshooting.md       problemas comunes
docs/skill-notes/                     aprendizajes para alimentar la skill
```
