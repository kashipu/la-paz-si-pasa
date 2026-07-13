# Componente "Actualidad"

Sección con 3 partes: header, video destacado y carrusel "Ver más". Reemplaza el actual `ActualidadGaleria.astro` (lista plana) por una versión con destacado + carrusel.

## 1. Header

- Banda de ancho completo, fondo `#d49ec7` (nuevo token `--color-actualidad-bg`).
- Texto "ACTUALIDAD", mayúsculas, `--font-display`, color blanco.

## 2. Video destacado

- Layout 2 columnas 50/50 en desktop (`grid-template-columns: 1fr 1fr`). Mobile: apila, player primero.
- Columna izquierda: título (h3, azul `--color-nav-text`), descripción, fila "Etiquetas:" con 1–2 tags (chips fondo azul claro, reusa `tags: Proyecto[]` del contrato).
- Columna derecha: player con carga diferida (ver punto 4).
- El destacado inicial es el **más reciente** (primero de la lista de WP); los demás van al carrusel.

## 3. Carrusel "Ver más"

- Encabezado "VER MÁS:" en `--font-display`.
- Fila horizontal de cards: thumbnail 16:9 con ícono play superpuesto + título pequeño (azul) debajo.
- Scroll-snap horizontal + flechas `‹`/`›` con `scrollBy` (mismo patrón que `Subcuentas.astro`).
- **Clic en una card → ese video reemplaza al destacado** (título, descripción, etiquetas y player se actualizan) y se reproduce. Sin navegación a otra página.
- El video que estaba destacado vuelve al carrusel (swap).

## 4. Player: lite embed sin librería

- **No se agrega Plyr** ni ninguna dependencia.
- Estado inicial: solo `<img>` del thumbnail + botón play (SVG). El video no carga nada hasta el clic.
- Al dar play, según la fuente:
  - **YouTube:** se inyecta `<iframe src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1">`.
  - **MP4 de WordPress:** se inyecta `<video src controls autoplay poster={thumbnail}>` nativo.
- Al hacer swap desde el carrusel, se destruye el player anterior (se vuelve a thumbnail) y se reproduce el nuevo.

## Datos (✅ implementado)

- **Contrato `Video`** (`adapters/contracts/Video.ts`):
  - `fuente: "youtube" | "wordpress"`
  - `videoUrl: string` — YouTube: URL de embed ya normalizada (`youtube-nocookie.com/embed/{id}`); WordPress: URL del MP4 en WP media. El componente no parsea URLs.
  - `tags: string[]` — antes era `Proyecto[]`; ahora términos libres de taxonomía WP (el mockup usa "Crónica", que no es un proyecto).
- **Mapper** (`mapVideo.ts`) — convención ACF para la implementación en WP:
  - CPT `video` (endpoint ya registrado en `endpoints.ts`).
  - Campos ACF: `youtube_url` (texto) **XOR** `video_file` (archivo MP4), `descripcion`, `thumbnail` (imagen), `tags` (taxonomía o lista de textos).
  - Si hay `youtube_url` → `fuente: "youtube"` y deriva embed + thumbnail fallback (`i.ytimg.com/vi/{id}/hqdefault.jpg`); si no → `fuente: "wordpress"` con `video_file.url`. El `thumbnail` de ACF es obligatorio para MP4, opcional para YouTube.
- **Mocks** (`mocks.ts`): 8 videos — el primero es el destacado (copy del mockup), 7 para el carrusel. Fuentes mezcladas YouTube/MP4, thumbnails `placehold.co` con dimensiones/colores distintos (1280x720 el destacado, 640x360 las cards).
- `getVideos()` ya existe en `adapters/index.ts` con fallback a mocks; el orden lo da WP (fecha desc por defecto) → el primero es el más reciente.

## Archivos a tocar (✅ implementado)

- `Video.ts`, `mapVideo.ts`, `mocks.ts`.
- `ActualidadGaleria.astro` — reescrito con las 3 partes (header, destacado, carrusel), swap por `data-*` attrs (sin estado de framework) y lite embed vanilla.
- `tokens.css` — `--color-actualidad-bg: #d49ec7`.
- `index.astro` — se sacó `<ActualidadGaleria>` del `.contenedor` (igual que `LoQueHacemos`) para que el header sea full-bleed; el propio componente maneja su ancho interno (`.actualidad__contenedor`, `--wide-width`).
- **Sin archivos nuevos.** Verificado con `npx astro check` (0 errores).

## Pendiente de confirmar

- Cantidad máxima de videos en el carrusel (¿todos los de WP o un límite, p. ej. 8?).
- Si los tags del destacado enlazan a algo (¿filtro?, ¿página de programa?) — por ahora chips sin link.
