# La Paz Sí Pasa

## Qué es

Sitio público de La Paz Sí Pasa (https://lapazsipasa.com/). Muestra retratos de
los territorios, las subcuentas y noticias del fondo, la galería de actualidad y
la página de proyectos destacados (PaisSana: mapa, audios, ferias y productores).
El equipo edita el contenido en WordPress y el sitio lo lee por API REST.

## Stack

- **Frontend:** Astro 7 en SSR (`@astrojs/node`), TypeScript. Código en `apps/frontend/`.
- **CMS:** WordPress headless sobre PHP 8.3 (Apache), con SCF para CPT y campos. Código en `apps/wordpress/`; las definiciones viven en `apps/wordpress/scf-json/`.
- **Base de datos:** MariaDB 11.
- **Contenedores:** Docker. `docker-compose.yml` para local, `compose.prod.yaml` para Dokploy.
- **Versiones fijas:** Node 22.23.4 (`docker/astro/Dockerfile`) y WordPress 7.1.3 con PHP 8.3 (`docker/wordpress/Dockerfile`). TODO: confirmar que la imagen de WordPress trae PHP 8.3.36; el commit a7ef6a6 lo afirma, el tag `php8.3-apache` no lo fija.

## Arquitectura

```text
Componente Astro (props tipadas)
  -> adapters/index.ts          (getHome, getRetratos, getVideos, ...)
  -> adapters/wordpress/        (client, endpoints, mappers)
  -> WordPress REST             (/wp-json/wp/v2/<rest_base>, /headless/v1/site)
```

- Los contratos viven en `adapters/contracts/`. Los componentes solo reciben props de ahí.
- Si WordPress no responde o un CPT viene vacío, `withFallback` usa `adapters/mocks.ts`. Cada bloque informa su fuente con `?debug-content=1`.
- Páginas: `/` (home), `/proyectos-destacados`, `/404`, `/sitemap.xml`, `/robots.txt`.
- Caché de página en memoria (`lib/pageCache.ts`), vaciada con `POST /api/revalidate` y el header de secreto.
- Documentación interna (`docs/`): no está versionada. Se consulta en la copia local.

## Entorno de desarrollo

[entorno-desarrollo.md](entorno-desarrollo.md): servicios locales (8090 FSE, 8080 headless, 4321 Astro), agentes (Claude implementa; Codex y AGY en paneles de Orca), skills, calidad y secretos.

## Migración a tema de bloques (en curso)

Prueba en `feat/wordpress-fse`: WordPress pinta el sitio con el tema `lapaz` (`apps/wordpress/themes/lapaz/`), sin Astro. Stack aparte en `apps/wp-fse/`.
- [Spec, etapas e inventario](specs/wordpress-fse.md)
- [Buenas prácticas y kit](buenas-practicas-wordpress.md)
- [Decisiones de arquitectura](decisions/wordpress-fse-arquitectura.md)

## Contenido y medios

- `apps/wordpress/seed/`: 102 fotos (ferias y retratos), 15 audios m4a y 43 enlaces de YouTube. `seed.php` carga 54 entradas.
- Faltan en el seed: noticias (sin contenido real) y subcuentas (están en `mocks.ts`, con logos en `apps/frontend/src/assets/subcuentas/`).
- Lo subido en producción vive solo en el servidor. Hay que respaldar la base y `uploads` antes del cambio.

## Enlaces

- [Features](features.md) · [Updates](updates.md) · [Changelog](changelog.md) · [Enlaces](enlaces.md)
- [AGENTS.md](../AGENTS.md): comandos y reglas para asistentes.
