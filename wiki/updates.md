# Updates

## 2026-11-08 · migración FSE

**Estado:** se aprobó la prueba de migración a tema de bloques ([spec](specs/wordpress-fse.md)), en la rama `feat/wordpress-fse`. Las etapas 0 y 1 están hechas: WordPress nuevo en `apps/wp-fse/` (puerto 8090, listo para Dokploy) y navbar configurable desde *Editor del sitio → Navegación*, igual al de Astro. `frontend` ya está alineada con `main` (`dcc8af3`). El headless sigue intacto.

También quedó hecha la etapa 1.5 (calidad determinista): `apps/wp-fse/bin/check` en verde, con E2E y visual del navbar y CI. Las skills oficiales de WordPress están instaladas.

**Bloqueo:** ninguno. Falta el contenido real de las noticias.

Etapa 2 hecha: la sección Retratos («La Paz Sí Pasa» + slider) se edita desde WordPress y se ve igual que en Astro (0,01 % de diferencia). Aprendizajes en [etapa-2-retratos.md](specs/wordpress-fse/etapa-2-retratos.md#aprendizajes).

**Siguiente paso:** etapa 3 (hero y footer). Antes, aprobar su documento.

## 2026-11-08

**Estado:** PR #3 (parches PHP 8.3.36 y Node 22.23.4) está mergeado: `origin/main` tiene el squash `dcc8af3`. `origin/frontend` (rama por defecto en GitHub) va un commit atrás, sin `dcc8af3`. La rama local `fix/parches-php2shell-node` tiene el commit original `a7ef6a6`, con el mismo cambio y otro SHA. No hay PRs abiertos.

**Bloqueo:** ninguno confirmado. TODO: confirmar que el despliegue de producción usa la imagen con las bases parchadas.

**Siguiente paso:** alinear `frontend` con `main` y decidir si `wiki/` se versiona (ver nota abajo).

Pendiente antes de producción, según el código:

- Retirar el fallback a mocks en `adapters/index.ts` (marcado `ponytail`) cuando WordPress tenga todo publicado.
- `components/ProyectosNav.astro`: tres botones con `href="#"`.
- `adapters/mocks.ts`: `audioUrl` vacío hasta subir los MP3 a la biblioteca de WordPress; enlace de video repetido en el CSV (video 3).
- Checklist de contenido y QA en `docs/contenidos-qa.md` (local). Ojo: parte está desactualizada. Hero, menú, subcuentas, noticias, videos, audios y ferias ya están conectados a WordPress.

Nota: `wiki/` no está en `.gitignore`, pero el repo es público y `docs/` sí se ignora. Si se versiona, revisar que no quede información interna.
