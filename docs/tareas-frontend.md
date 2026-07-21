# Frontend documentación y criterios de aceptación

Aquí vamos a documentar los criterios de aceptación del frontend y lo que está en index.astro como página principal 

Aqui solo se habla de astro y frontend

## Arquitecura de componentes y CSS

**Estado: implementado, así funciona hoy.**

- **BEM + estilos scoped por componente:** cada `.astro` define su propio bloque de estilo (`<style>` al final del archivo), Astro lo scopea automáticamente (`data-astro-cid-*`), y las clases dentro siguen BEM (`hero`, `hero__bg`, `hero__logo`; `nav`, `nav__list`, `nav__toggle`, `nav__toggle-bar`; `site-header`, `site-header__brand`). No hay CSS global por componente, solo lo que viene de `styles/global.css`. Esto ya es lo más performante que da Astro out-of-the-box: el CSS de cada componente solo se envía en las páginas que lo usan, sin runtime extra.
- **Contenedores:** `src/styles/foundations/layout.css` define `.container` / `.container--narrow` (ancho + `margin-inline: auto`) y `.section` (padding vertical). En la práctica varios componentes repiten el patrón `width: min(100% - 2rem, var(--wide-width))` en vez de usar esas clases (ej. `.nav`, `.contenedor` en `index.astro`) — pendiente unificar bajo `.container` para no repetir la fórmula de ancho en cada componente.
- **Tokens (`styles/foundations/tokens.css`):** un único `:root` con colores (`--color-brand`, `--color-surface`, `--color-nav-*`, etc.), espaciados (`--space-1` a `--space-16`), radios, sombra y anchos (`--content-width`, `--narrow-width`, `--wide-width`). Todo el CSS de componentes consume estas variables — no hay estilos en línea ni valores hardcodeados de color/spacing en los componentes revisados.
- **Tipografías (`foundations/fonts.css` + `tokens.css`):** dos familias vía `@font-face` con `font-display: swap`: `Komet` (`--font-sans`, texto de cuerpo/`body`) y `Monique Round` (`--font-display`, usada en `h1`-`h4` vía `typography.css`). Coincide con lo pedido: Monique para títulos, Komet para el resto del texto.
- **Imágenes:**
  - Los assets propios del sitio (hero) usan `<Image>` de `astro:assets` (`Hero.astro`), que en build genera `.webp` optimizado automáticamente — peso reducido sin bajar calidad perceptible.
  - Las imágenes que vienen del CMS/mocks (retratos, subcuentas, videos) se renderizan con `<img loading="lazy">` plano porque su URL es dinámica (WordPress/CDN), no un asset local que Astro pueda procesar en build. Pendiente: cuando el adapter de WordPress esté conectado a producción, confirmar que WP entregue las imágenes ya redimensionadas/comprimidas (o configurar `image.remotePatterns` en `astro.config.mjs` si se quiere pasar esas URLs por el optimizador de Astro).
- **Componentes orientados a CMS:** los componentes reciben datos por props tipadas contra los contratos en `src/adapters/contracts/` (`Hero.ts`, `Retrato.ts`, `Subcuenta.ts`, `Noticia.ts`, `Video.ts`) y `src/adapters/mocks.ts` simula esa data mientras no hay WordPress conectado — así el componente no cambia cuando se conecte el CMS real, solo el adapter.


Los componentes se crean en función de ser actualizados por un CMS por esto la creación de los mismos depende mucho de contratos e información que se actualiza 

## Header

El header contiene al Nav, en desktop aparece debajo del hero y en mobile aparece encima con el burguer NAV

En desktop no aparece ni mobile aparece "<a class="site-header__brand" href="/">{siteName}</a>" ese navbar solo aparece en mobile 

Revisemos documentemos y ajustemos esta tarea

## Sección Retratos de la paz

**Estado: implementado en `IntroText.astro` (componente `Intro.astro` → `IntroText.astro` + `RetratosSlider.astro`).**

1. Logo fondo de paz: `assets/retratos/logo-fondo-paz.svg`, importado como asset de Astro y renderizado en `.intro-texto__sello` (antes era un placeholder de texto "Fondo Colombia en Paz").
2. Título: "La Paz Sí Pasa, pasa en los territorios" en `--font-display` (Monique, heredado de `typography.css` para todos los `h1`-`h4`) con `text-transform: uppercase` para forzar mayúsculas sin reescribir el markup en caps.
3. Descripción: párrafo tal cual el contrato ("La paz no se queda en los escritorios... progreso sostenible.").
4. Frase destacada ("Porque la transformación se consolida...") en `.intro-texto__destacado`: `font-weight: 700` + `text-transform: uppercase`, cumple negrita + mayúscula sostenida.

Pendiente: el texto es fijo (no editable desde WP, ver comentario en el propio archivo) — si se quiere editable desde el CMS habría que moverlo a un contrato/adapter como los demás componentes.

### Slider retratos

Este componente también lo vamos a ajustar la pregunta es deberían estar sueltos y dejar el layout en index esto para facilitar luego conectarlo al CMS?
