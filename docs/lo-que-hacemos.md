# Componente "Lo que hacemos en el fondo"

Sección con 4 partes: título, texto destacado, subcuentas, y noticias. Reemplaza el bloque inline actual en `index.astro` (líneas 27-32) por un componente único `LoQueHacemos.astro`.

## 1. Titular

- Banda de ancho completo, fondo `#008861` (nuevo token `--color-loquehacemos-bg`).
- Texto "LO QUE HACEMOS EN EL FONDO", mayúsculas, `--font-display`, color blanco.

## 2. Texto destacado (izquierda, 50%)

- Contenido **estático** en el componente (sin contrato/mock nuevo, sin WP).
- Título + 2 párrafos + link "Conoce las subcuentas" (ancla al carrusel de abajo).

## 3. Subcuentas (debajo del texto destacado, mismo 50%)

- Reusa `Subcuentas.astro` existente (contrato `Subcuenta`, ya con mock/mapper).
- Se le agregan flechas prev/next: scroll-snap horizontal + botones `‹`/`›` que hacen `scrollBy`.
- Encabezado "Conoce las subcuentas:".

## 4. Banner CTA (debajo de subcuentas, mismo 50%)

- Imagen fija de 150px de alto, ancho 100% de la columna, con link `<a href>` envolviendo un `<img>`.
- Texto "Más noticias del fondo aquí" ya viene dibujado en la imagen (no se superpone HTML).
- Asset local en `src/assets/` (o WP media si ya existe endpoint); URL destino: TBD (placeholder `#` hasta tener la página de noticias).

## 5. Noticias (derecha, 50%, alto completo)

- Reusa contrato `Noticia` existente, agrupando por año (`fecha.slice(0,4)`), 3 más recientes por año.
- Fondo `#cbe9f8` (nuevo token `--color-loquehacemos-noticias-bg`), texto/iconos `#32509d` (ya existe como `--color-nav-text`).
- Interacción: **solo scroll** — lista vertical con overflow, flechas arriba/abajo (`▲`/`▼`) que hacen scroll suave (`scrollBy`), sin acordeón.
- Layout: columna año (sticky) + columna títulos, igual que el mockup.

## Layout general

- Grid 2 columnas 50/50 en desktop (`grid-template-columns: 1fr 1fr`), columna izquierda agrupa 2-3-4, columna derecha es 5.
- Columna derecha ocupa el alto total combinado de 2+3+4 (`align-self: stretch` / grid row span).
- Mobile: apila en una columna, noticias al final.

## Archivos a tocar

- **Nuevo:** `src/components/LoQueHacemos.astro` (orquesta 1-5, incluye texto destacado y banner inline; usa `Subcuentas` y `NoticiasCarrusel` — o una versión adaptada de `NoticiasCarrusel` para agrupar por año, ya que el uso actual es lista plana).
- **Modificar:** `Subcuentas.astro` (flechas), `NoticiasCarrusel.astro` (agrupar por año + estilo azul, o crear variante), `tokens.css` (2 colores nuevos), `index.astro` (reemplazar bloque líneas 27-32 por `<LoQueHacemos noticias={noticias} subcuentas={subcuentas} />`).
- **Sin cambios:** contratos/mocks/mappers (no se necesita ninguno nuevo).

## Pendiente de confirmar

- Asset e URL del banner CTA.
- Copy final del texto destacado (título + párrafos) — por ahora se usa el texto de la captura como placeholder.
