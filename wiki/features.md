# Features

Capacidades entregadas. Lee esto antes de proponer una nueva.

## Home (`/`)

- Hero desde la página WordPress con slug `home`.
- Retratos de la Paz: slider desde el CPT `retrato`.
- Lo que hacemos: subcuentas (CPT `subcuenta`), línea de noticias (CPT `noticia`) y banner CTA con URL editable.
- Actualidad: galería de videos (CPT `video`), con YouTube o MP4 y tags.

## Proyectos destacados (`/proyectos-destacados`)

- Hero, intro y mapa de regiones con carrusel de PaisSana.
- Reproductor de audios "Corazón del campo" (CPT `audio_relato`).
- Ferias (CPT `feria`): acordeón, galería fotográfica con lightbox y carrusel de varios videos. El video se detiene al cerrar la pestaña o cambiar de slide.
- Productores PaisSana con videos.

## Transversal

- Menú primary desde WordPress (`headless/v1/site`), con fallback al menú de código.
- Footer con copy institucional (fijo en código).
- SEO: metadatos para compartir, favicon, `sitemap.xml` y `robots.txt`.
- Caché de página y revalidación con `POST /api/revalidate` (requiere secreto).
- Diagnóstico de fuente por bloque con `?debug-content=1`. TODO: decidir si se oculta en producción; hoy también responde allí.
