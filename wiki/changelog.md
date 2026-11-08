# Changelog

Qué cambió, con fecha y PR. Lo reciente arriba.

- **2026-11-08** · chore(wp-fse): calidad determinista: `bin/check` (PHPCS, PHPStan max, Stylelint, ESLint, TS estricto, esquemas, plantillas, tamaños, ShellCheck, Hadolint, actionlint, Semgrep), E2E y visual del navbar, workflow de CI · [etapa 1.5](specs/wordpress-fse/etapa-1-5-calidad.md)
- **2026-11-08** · feat(wp-fse): WordPress en cero listo para Dokploy (`apps/wp-fse/`) y tema `lapaz` con navbar en `core/navigation`: etapas 0 y 1 de la [migración FSE](specs/wordpress-fse.md) · rama `feat/wordpress-fse`, sin PR
- **2026-10-22** · fix(deploy): fija bases con PHP 8.3.36 y Node 22.23.4 · PR #3 (squash `dcc8af3`, commit `a7ef6a6`)
- **2026-08-19** · fix(ferias): detiene el video al cerrar la pestaña o cambiar de slide · `75ddf2a`
- **2026-08-14** · feat(seo): metadatos para compartir, favicon, sitemap y robots · `ec54295`
- **2026-08-14** · feat(paisana): lightbox en la galería de ferias y reordena la página · `de8073d`
- **2026-08-14** · fix(deploy): hornea el contenido del CMS en la imagen, no en bind mounts · `f261ba3`
- **2026-08-14** · docs(deploy): corrige el chequeo post-deploy del CMS · `ff3f612`
- **2026-08-14** · feat(ferias): galería fotográfica y carrusel de varios videos · `86d21f7`
- **2026-08-14** · fix(frontend): corrige la galería de actualidad y el reproductor de audio · `3cdaa8c`
- **2026-08-14** · Copy institucional en el footer, en lugar del lorem ipsum · PR #2
- **2026-08-11** · fix: video en acordeón de ferias, controles de audio, estadísticas del mapa y slider de retratos en móvil · `89db3aa`, `b725c6d`, `2db7ef0`
- **2026-08-10** · perf(frontend): baja el LCP del home de 8.3 s · `9fed641`
- **2026-08-10** · perf(cms): pide a WordPress el tamaño intermedio de imagen · `a620786`
- **2026-08-09** · feat(wordpress): CPT y campos SCF de ferias, videos, relatos y home · `0a9654b`
- **2026-08-09** · feat(frontend): consume ferias, videos, relatos y home desde WordPress · `c2a9b96`
- **2026-08-09** · feat(wordpress): carga inicial del contenido y seed por secciones, sin wp-cli · `56f826b`, `80f619e`, `69f514d`
- **2026-08-02** · feat(cache): revalidación de páginas del frontend · `80ea11d`
- **2026-08-02** · feat(frontend): navegación y entrega optimizada de media · `8cb7736`, `bfdd165`
- **2026-08-02** · feat(paisana): secciones de PaisSana (hero, mapa, audios, ferias, productores) y estilos · `c10b2f3`, `cce36b0`, `ad6fca1`
- **2026-07-31** · chore: archivos internos fuera del repositorio público · PR #1 (`aca2055`)
- **2026-07-26** · feat(paisana): página de proyectos destacados · `8bc40c6`
