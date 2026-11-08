# Etapa 3: hero, footer y plantillas de página

Estado: **propuesta, pendiente de aprobación** · 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

## Objetivo

Que la portada y Proyectos destacados tengan el esqueleto completo de Astro: header, hero, menú de escritorio, contenido y footer. Además, que el editor pueda cambiar la foto del hero desde WordPress sin desplegar.

## Qué se construye

### 1. Portada con página propia

Hoy WordPress muestra las últimas entradas en la portada. El hero lee sus campos (`hero_imagen` y, más adelante, `noticias_cta_url`) de la página `home`, igual que el adapter de Astro (`getHome()` → `wp/v2/pages?slug=home`).

- **`lapaz-setup`:** crea la página **Inicio** (slug `home`) si no existe y la fija como portada (`show_on_front=page`, `page_on_front`). Es idempotente.
- **`group_home.json`:** hoy aplica a **todas** las páginas (`post_type == page`). En `lapaz-core.php`, con el filtro `acf/load_field_group`, se acota a la portada (`page_type == front_page`). Así el campo "Imagen del hero" solo aparece al editar Inicio, y el JSON compartido con el headless no se toca. Es el mismo criterio de la etapa 2.

### 2. Bloque `lapaz/hero` (Hero.astro)

| Aspecto | Cómo |
|---|---|
| Marcado y CSS | Mismas clases: `.hero`, `.hero__bg`, `.hero__logo-link`, `.hero__logo`. CSS copiado bajo `.wp-block-lapaz-hero` |
| Imagen | Si Inicio tiene `hero_imagen`, se usa `wp_get_attachment_image()` con `sizes="100vw"`, srcset de la biblioteca, `loading=eager` y `fetchpriority=high`. Si no, los JPEG de `public/hero/` (640/960/1200, sin WebP a propósito por el grano de la foto) copiados al tema, con el mismo srcset de hoy |
| Logo | `hero-logo.svg` del tema, con `alt="La Paz Sí Pasa"` y enlace al inicio, igual que hoy |
| LCP | Es el elemento más pesado de la carga. **Mejora sobre Astro:** `<link rel="preload" as="image" imagesrcset … imagesizes="100vw" fetchpriority="high">` en `wp_head`, solo en páginas con el bloque (`has_block` en la plantilla). Hoy no existe |
| JS | Ninguno |
| Dónde | En las plantillas `front-page` y `proyectos-destacados`. Lee siempre la portada, aunque se pinte en otra página, como en Astro |

### 3. Bloque `lapaz/footer` (Footer.astro) en la parte `parts/footer.html`

| Aspecto | Cómo |
|---|---|
| Contenido | Fijo, como dice la cotización: logos, texto de cierre y redes (fcp.gov.co, Instagram y X). Los textos son traducibles (`esc_html_e`) y las URLs van con `esc_url` |
| Imágenes | Las 8 de `src/assets/footer/` (la foto pesa 1,8 MB en origen) se generan **una sola vez** en WebP al tamaño en que se muestran, ×2 para pantallas retina, y se guardan en `assets/img/footer/`. Cada `<img>` lleva `width` y `height` reales, para no mover el layout (CLS) |
| JS | "Volver arriba": `view.js` de 3 líneas con `scrollTo({ behavior: 'smooth' })`, que respeta `prefers-reduced-motion` (hoy no lo hace) |
| Dónde | Parte `footer` (área footer), en todas las plantillas |

### 4. Plantillas

| Plantilla | Orden (igual que `BaseLayout.astro`) |
|---|---|
| `front-page.html` | header · **hero** · nav-desktop · `main.lapaz-home` (retratos) · **footer** |
| `page-proyectos-destacados.html` (`customTemplates`, solo páginas) | header · **hero** · nav-desktop · main (vacío hasta la etapa PaisSana) · **footer**. `lapaz-setup` se la asigna a la página Proyectos destacados |
| `404.html` | header · nav-desktop · bloque "Página no encontrada" con "Volver al inicio" (`404.astro`, textos traducibles en un patrón PHP) · footer |
| `index.html` | header · nav-desktop · main · footer |

## Reparto (en paneles de Orca, como en la etapa 2)

| Quién | Qué |
|---|---|
| **Claude** | portada en `lapaz-setup`, filtro de `group_home`, bloques hero y footer, preload, plantillas, verificación final y commit |
| **AGY** | assets: WebP del footer a su tamaño ×2 (con medidas), copia de los JPEG del hero y del `hero-logo.svg`. Después, revisión independiente de los dos bloques frente a Astro, sin editar |
| **Codex** | `tests/e2e/layout.mjs`: orden de las piezas en las dos plantillas; hero con `fetchpriority=high`, sin lazy y con preload presente; "volver arriba" lleva a `scrollY = 0`; enlaces del footer con `rel="noopener noreferrer"`; 404 responde 404 con su texto. Bases visuales del hero y del footer a 360, 850 y 1440, con Astro leyendo este WordPress. También suma estos pasos al workflow |

Regla de la etapa 2: solo un agente corre `bin/check` a la vez. Claude lo corre al final.

## Fuera de alcance

- Hacer editable el copy del footer o los enlaces de redes (la cotización los deja fijos).
- Cambiar el logo del hero desde WordPress.
- SEO del `<head>` (OG, canonical): queda para la etapa de SEO y rendimiento. Solo se agrega el preload del hero.

## Definición de hecho

1. La portada y Proyectos destacados se ven igual que Astro a 360, 850 y 1440 px, con los mismos datos: hero, menú y footer con menos de 1 % de diferencia, y Retratos igual que en la etapa 2.
2. El editor cambia la imagen del hero en Inicio y se ve en las dos páginas sin desplegar. Si la quita, vuelve la foto por defecto.
3. El campo del hero solo aparece al editar Inicio.
4. Las pruebas de `layout.mjs`, `retratos.mjs` y `navbar.mjs` pasan, y `bin/check` está en verde.
5. El LCP de la portada no empeora frente a Astro. Se mide con la traza de Chrome headless (el mismo método en los dos sitios) y el preload aparece en el HTML.
6. La imagen de producción incluye todo, y `lapaz-setup` deja Inicio como portada y la plantilla asignada a Proyectos destacados.
7. Esta página documenta el resultado y los aprendizajes.

## Riesgos

- **`page_type == front_page`:** depende de que Inicio sea la portada. Si alguien cambia la portada en Ajustes, el campo se mueve con ella. Es el comportamiento esperado, y se documenta.
- **Compatibilidad del filtro `acf/load_field_group` con SCF 6.9:** si no existe, la alternativa es `acf/location/rule_match` acotado al grupo `group_home`.

Estimación: 1 día.
