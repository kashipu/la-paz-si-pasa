# Plan y Especificación Técnica: Página "Proyectos Destacados" (`src/pages/proyectos-destacados.astro`)

Las imágenes [Seccion1@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/Seccion1@2x-100.jpg) a [seccion7@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion7@2x-100.jpg) en esta carpeta son **mockups de diseño entregados por el cliente** que sirven como guía de layout y comportamiento visual. 

Este documento especifica la **estructura completa de la página, los 7 componentes a crear, su maquetación HTML/CSS y las URLs de `placehold.co` con dimensiones exactas en píxeles** para mantener la máxima fidelidad visual mientras se entregan los assets finales.

---

## 1. Visión General de la Página

La página vive en `src/pages/proyectos-destacados.astro` y se compone de **7 secciones consecutivas** dentro de un contenedor principal `.paisana-page`:

```astro
---
import BaseLayout from "@layouts/BaseLayout.astro";
import PaisSanaHero from "@components/paisana/PaisSanaHero.astro";
import PaisSanaMapaIntro from "@components/paisana/PaisSanaMapaIntro.astro";
import PaisSanaMapaCarrusel from "@components/paisana/PaisSanaMapaCarrusel.astro";
import PaisSanaAudioPlayer from "@components/paisana/PaisSanaAudioPlayer.astro";
import PaisSanaFeriasIntro from "@components/paisana/PaisSanaFeriasIntro.astro";
import PaisSanaFeriasAcordeon from "@components/paisana/PaisSanaFeriasAcordeon.astro";
import PaisSanaProductoresVideos from "@components/paisana/PaisSanaProductoresVideos.astro";
---

<BaseLayout title="Proyectos Destacados - PaisSana">
  <main class="paisana-page">
    <PaisSanaHero />
    <PaisSanaMapaIntro />
    <PaisSanaMapaCarrusel />
    <PaisSanaAudioPlayer />
    <PaisSanaFeriasIntro />
    <PaisSanaFeriasAcordeon />
    <PaisSanaProductoresVideos />
  </main>
</BaseLayout>

<style>
  .paisana-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-12, 3.5rem);
    width: min(100% - 2rem, var(--wide-width));
    margin-inline: auto;
    padding-block: var(--space-8, 2rem);
  }
</style>
```

---

## 2. Matriz de Componentes, Imágenes de Referencia y Recursos Placeholder (`placehold.co`)

| # | Sección (Mockup) | Componente | Ubicación | Imágenes Placeholder (`placehold.co`) |
|---|---|---|---|---|
| 1 | [Seccion1@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/Seccion1@2x-100.jpg) | `PaisSanaHero.astro` | `src/components/paisana/` | Logo (`240x80`), Flor (`300x300`), Icons (`48x48`), Foto (`600x600`) |
| 2 | [seccion2@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion2@2x-100.jpg) | `PaisSanaMapaIntro.astro` | `src/components/paisana/` | Retrato Productor (`600x500`) |
| 3 | [seccion3@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion3@2x-100.jpg) | `PaisSanaMapaCarrusel.astro` | `src/components/paisana/` | Mapa Colombia por región (`650x750`) |
| 4 | [seccion4@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion4@2x-100.jpg) | `PaisSanaAudioPlayer.astro` | `src/components/paisana/` | Mic Icon (`64x64`), Audio Fallback |
| 5 | [seccion5@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion5@2x-100.jpg) | `PaisSanaFeriasIntro.astro` | `src/components/paisana/` | Ilustración Productora (`400x400`), Landscape (`1200x200`) |
| 6 | [seccion6@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion6@2x-100.jpg) | `PaisSanaFeriasAcordeon.astro` | `src/components/paisana/` | 6x Fotos Galería (`300x200`), Video Vertical (`400x600`) |
| 7 | [seccion7@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion7@2x-100.jpg) | `PaisSanaProductoresVideos.astro` | `src/components/paisana/` | Tucán (`200x300`), 3x Thumbnails Video (`600x350`) |

---

## 3. Especificación Detallada Sección por Sección

### Sección 1: Introducción a PaisSana y Beneficios ([Seccion1@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/Seccion1@2x-100.jpg))
* **Imagen de Referencia**: [Seccion1@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/Seccion1@2x-100.jpg)
* **Componente**: `src/components/paisana/PaisSanaHero.astro`
* **Propósito**: Encabezado principal de la marca PaisSana con métricas clave, beneficios de los productores y foto destacada.
* **Imágenes Placeholders (`placehold.co`)**:
  * **Logo PaisSana**: `https://placehold.co/240x80/003366/FFFFFF?text=paiSana+Logo`
  * **Ilustración Flor (Arriba Derecha)**: `https://placehold.co/300x300/png?text=Flor+Ilustracion`
  * **Ícono Cartilla (Métrica 2)**: `https://placehold.co/48x48/003366/FFFFFF?text=Icon`
  * **Ícono Hoja (Métrica 3)**: `https://placehold.co/48x48/003366/FFFFFF?text=Leaf`
  * **Foto Productora**: `https://placehold.co/600x600?text=Productora+PaisSana` (600x600 px)
* **Estructura HTML**:
  ```html
  <section class="paisana-hero">
    <div class="hero-top-grid">
      <div class="hero-brand">
        <img src="https://placehold.co/240x80/003366/FFFFFF?text=paiSana+Logo" alt="PaisSana" width="240" height="80" />
        <h2>Un país que sana desde la tierra</h2>
        <p>PaiSana no es solo una marca; es la voz, las manos y el orgullo...</p>
        <p>Detrás de cada grano de café, de cada barra de cacao...</p>
      </div>
      <div class="hero-stats">
        <img src="https://placehold.co/300x300/png?text=Flor+Ilustracion" alt="Flor" class="flor-bg" width="300" height="300" />
        <h3>Datos relevantes:</h3>
        <ul class="stats-list">
          <li>
            <span class="stat-number">450</span>
            <span class="stat-text">Organizaciones y productores vigentes...</span>
          </li>
          <li>
            <img src="https://placehold.co/48x48/003366/FFFFFF?text=Icon" width="48" height="48" alt="Sello" />
            <span class="stat-number">3.402</span>
            <span class="stat-text">Productos con sello de origen...</span>
          </li>
          <li>
            <img src="https://placehold.co/48x48/003366/FFFFFF?text=Leaf" width="48" height="48" alt="Municipios" />
            <span class="stat-number">168</span>
            <span class="stat-text">Municipios sembrando el cambio</span>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="hero-bottom-grid">
      <div class="hero-benefits">
        <h3>Beneficios para los productores:</h3>
        <ul>
          <li>Registro ante la Superintendencia de Industria y Comercio.</li>
          <li>Acompañamiento ante el INVIMA: asistencia técnica especializada...</li>
          <li>Acompañamiento ante el ICA: capacitaciones...</li>
          <li>Alianzas estratégicas con Fondo Emprender y CampeSENA...</li>
          <li>Conexión con comercializadoras.</li>
        </ul>
      </div>
      <div class="hero-photo">
        <img src="https://placehold.co/600x600?text=Productora+PaisSana" alt="Productora PaisSana" width="600" height="600" />
      </div>
    </div>
  </section>
  ```

---

### Sección 2: Introducción "Paissanos en el Mapa" ([seccion2@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion2@2x-100.jpg))
* **Imagen de Referencia**: [seccion2@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion2@2x-100.jpg)
* **Componente**: `src/components/paisana/PaisSanaMapaIntro.astro`
* **Propósito**: Introducir la navegación del mapa interactivo con un diseño de retrato sobre textura.
* **Imágenes Placeholders (`placehold.co`)**:
  * **Retrato Productora (Marco Kraft)**: `https://placehold.co/600x500?text=Paissana+Retrato` (600x500 px)
* **Estructura HTML**:
  ```html
  <section class="mapa-intro">
    <div class="mapa-intro-text">
      <h2>PAISSANOS EN EL MAPA</h2>
      <p>Cada rincón de Colombia guarda una historia de transformación...</p>
      <p>En este mapa interactivo reunimos los orígenes de nuestros productores...</p>
      
      <h3>¿CÓMO NAVEGARLO?</h3>
      <p>Haz <strong>clic sobre el recuadro</strong> con la región de tu interés...</p>
      <p class="cta-text">¡Haz clic en tu región y descubre su talento!</p>
    </div>
    <div class="mapa-intro-card">
      <div class="paper-frame">
        <img src="https://placehold.co/600x500?text=Paissana+Retrato" alt="Paissanos" width="600" height="500" />
      </div>
    </div>
  </section>
  ```

---

### Sección 3: Carrusel de Mapas por Región ([seccion3@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion3@2x-100.jpg))
* **Imagen de Referencia**: [seccion3@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion3@2x-100.jpg)
* **Componente**: `src/components/paisana/PaisSanaMapaCarrusel.astro`
* **Propósito**: Permitir alternar entre las 5 regiones (Caribe, Pacífica, Andina, Orinoquía, Amazonía) mostrando el mapa interactivo y métricas por departamento.
* **Imágenes Placeholders (`placehold.co`)**:
  * **Mapa de Colombia por Región**: `https://placehold.co/650x750/e0f0ff/003366?text=Mapa+Colombia+Pacifica` (650x750 px)
* **Estructura HTML**:
  ```html
  <section class="mapa-carrusel">
    <nav class="region-tabs">
      <button class="tab-btn">REGIÓN CARIBE</button>
      <button class="tab-btn active">REGIÓN PACÍFICA</button>
      <button class="tab-btn">REGIÓN ANDINA</button>
      <button class="tab-btn">REGIÓN ORINOQUÍA</button>
      <button class="tab-btn">REGIÓN AMAZONÍA</button>
    </nav>

    <div class="region-content-grid">
      <div class="region-stats">
        <div class="total-badge">
          <span class="count">120</span>
          <span class="label">PRODUCTORES</span>
        </div>
        <ul class="deptos-list">
          <li><strong>CHOCÓ:</strong> 16</li>
          <li><strong>VALLE DEL CAUCA:</strong> 34</li>
          <li><strong>CAUCA:</strong> 63</li>
          <li><strong>NARIÑO:</strong> 07</li>
        </ul>
      </div>

      <div class="region-map-wrapper">
        <img src="https://placehold.co/650x750/e0f0ff/003366?text=Mapa+Colombia+Pacifica" alt="Mapa Región Pacífica" width="650" height="750" />
        <!-- Pines de conteo flotantes sobre los departamentos -->
        <span class="map-pin pin-choco" style="top: 30%; left: 45%;">16</span>
        <span class="map-pin pin-valle" style="top: 50%; left: 55%;">34</span>
        <span class="map-pin pin-cauca" style="top: 65%; left: 48%;">63</span>
        <span class="map-pin pin-narino" style="top: 75%; left: 35%;">07</span>
      </div>
    </div>
  </section>
  ```

---

### Sección 4: El Corazón del Campo (Audio Testimonial) ([seccion4@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion4@2x-100.jpg))
* **Imagen de Referencia**: [seccion4@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion4@2x-100.jpg)
* **Componente**: `src/components/paisana/PaisSanaAudioPlayer.astro`
* **Propósito**: Reproductor de relatos sonoros de los productores con barra de reproducción y transcripción/subtítulos.
* **Imágenes Placeholders (`placehold.co`)**:
  * **Ícono Micrófono**: `https://placehold.co/64x64/003366/FFFFFF?text=Mic`
* **Estructura HTML**:
  ```html
  <section class="corazon-campo">
    <div class="audio-header">
      <h2>EL CORAZÓN DEL CAMPO: <span>La voz del territorio</span></h2>
      <p>Nadie narra la transformación mejor que quienes la viven día a día... <strong>Te invitamos a cerrar los ojos y escuchar estos relatos sonoros grabados directamente en el territorio.</strong></p>
    </div>

    <div class="audio-player-card">
      <div class="player-left">
        <button class="mic-play-btn" aria-label="Reproducir audio">
          <img src="https://placehold.co/64x64/003366/FFFFFF?text=Mic" alt="Reproducir" width="64" height="64" />
        </button>
        <div class="producer-info">
          <h4>Andrés Pineda</h4>
          <p class="brand">Café Montepineda</p>
          <p class="location">Pradera, Valle del Cauca</p>
        </div>
      </div>

      <div class="player-right">
        <div class="timeline">
          <input type="range" min="0" max="110" value="0" class="progress-bar" />
          <div class="timestamps">
            <span>00:00</span>
            <span>01:50</span>
          </div>
        </div>
        <div class="subtitles-box">
          <p>Subtítulos: En sus propias voces, las y los productores nos comparten sus memorias...</p>
        </div>
      </div>
    </div>
    
    <div class="player-controls-nav">
      <button class="nav-prev" aria-label="Anterior audio">&lt;</button>
      <button class="nav-next" aria-label="Siguiente audio">&gt;</button>
    </div>
  </section>
  ```

---

### Sección 5: Introducción "PaisSana en Ferias" ([seccion5@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion5@2x-100.jpg))
* **Imagen de Referencia**: [seccion5@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion5@2x-100.jpg)
* **Componente**: `src/components/paisana/PaisSanaFeriasIntro.astro`
* **Propósito**: Sección introductoria a la presencia de los productores en eventos y ferias nacionales.
* **Imágenes Placeholders (`placehold.co`)**:
  * **Ilustración Productora (Círculo)**: `https://placehold.co/400x400/png?text=Ilustracion+Productora` (400x400 px)
  * **Ilustración Paisaje Campo (Inferior)**: `https://placehold.co/1200x200/png?text=Ilustracion+Paisaje` (1200x200 px)
* **Estructura HTML**:
  ```html
  <section class="ferias-intro">
    <div class="ferias-intro-grid">
      <div class="ferias-intro-text">
        <h2>PAISSANA EN FERIAS:</h2>
        <h3>Nuestros productores en las grandes vitrinas del país</h3>
        <p>Del campo a los escenarios más grandes de Colombia y el mundo. Revive el recorrido... en eventos como <strong>Agroexpo, ChocoShow, Cafés de Colombia, ANATO, Carnaval de Barranquilla e ICCARD</strong>.</p>
        <p>Aquí se cruzan las miradas, las catas, los intercambios comerciales...</p>
      </div>
      <div class="ferias-intro-illustration">
        <img src="https://placehold.co/400x400/png?text=Ilustracion+Productora" alt="Productora Ferias" width="400" height="400" />
      </div>
    </div>
    <div class="ferias-landscape-banner">
      <img src="https://placehold.co/1200x200/png?text=Ilustracion+Paisaje" alt="Paisaje de Colombia" width="1200" height="200" />
    </div>
  </section>
  ```

---

### Sección 6: Acordeones de Ferias ([seccion6@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion6@2x-100.jpg))
* **Imagen de Referencia**: [seccion6@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion6@2x-100.jpg)
* **Componente**: `src/components/paisana/PaisSanaFeriasAcordeon.astro`
* **Propósito**: Mostrar la información detallada de cada feria desplegando su descripción, galería de fotos (3x2) y card de video vertical.
* **Imágenes Placeholders (`placehold.co`)**:
  * **Galería Fotográfica (6 fotos)**: `https://placehold.co/300x200?text=Foto+Feria+1` a `6` (300x200 px cada una)
  * **Video Destacado Vertical**: `https://placehold.co/400x600?text=Video+Feria+Agroexpo` (400x600 px)
* **Estructura HTML**:
  ```html
  <section class="ferias-acordeon-list">
    <details class="feria-item" open>
      <summary class="feria-header">
        <span>AGROEXPO 2025</span>
        <span class="chevron">▼</span>
      </summary>
      <div class="feria-body-grid">
        <div class="feria-left">
          <p class="feria-desc">Lorem ipsum dolor sit amet, consectetuer adipiscing elit...</p>
          <h3>GALERÍA FOTOGRÁFICA</h3>
          <div class="gallery-grid-3x2">
            <img src="https://placehold.co/300x200?text=Foto+Feria+1" alt="Agroexpo 1" width="300" height="200" />
            <img src="https://placehold.co/300x200?text=Foto+Feria+2" alt="Agroexpo 2" width="300" height="200" />
            <img src="https://placehold.co/300x200?text=Foto+Feria+3" alt="Agroexpo 3" width="300" height="200" />
            <img src="https://placehold.co/300x200?text=Foto+Feria+4" alt="Agroexpo 4" width="300" height="200" />
            <img src="https://placehold.co/300x200?text=Foto+Feria+5" alt="Agroexpo 5" width="300" height="200" />
            <img src="https://placehold.co/300x200?text=Foto+Feria+6" alt="Agroexpo 6" width="300" height="200" />
          </div>
        </div>
        <div class="feria-right">
          <div class="vertical-video-card">
            <div class="video-media">
              <img src="https://placehold.co/400x600?text=Video+Feria+Agroexpo" alt="Video Agroexpo" width="400" height="600" />
              <button class="play-btn-overlay" aria-label="Reproducir video">▶</button>
            </div>
            <p class="video-caption">Lorem ipsum dolor sit amet, consectetuer adipiscing elit...</p>
            <div class="video-nav-arrows">
              <button>&lt;</button>
              <button>&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </details>

    <details class="feria-item">
      <summary class="feria-header">
        <span>CHOCOSHOW</span>
        <span class="chevron">▼</span>
      </summary>
    </details>
    <details class="feria-item">
      <summary class="feria-header">
        <span>CAFÉS DE COLOMBIA 2026</span>
        <span class="chevron">▼</span>
      </summary>
    </details>
    <details class="feria-item">
      <summary class="feria-header">
        <span>ANATO 2026</span>
        <span class="chevron">▼</span>
      </summary>
    </details>
    <details class="feria-item">
      <summary class="feria-header">
        <span>CARNAVAL DE BARRANQUILLA 2026</span>
        <span class="chevron">▼</span>
      </summary>
    </details>
    <details class="feria-item">
      <summary class="feria-header">
        <span>ICARRD+20</span>
        <span class="chevron">▼</span>
      </summary>
    </details>
    <details class="feria-item">
      <summary class="feria-header">
        <span>FILBO 2026</span>
        <span class="chevron">▼</span>
      </summary>
    </details>
  </section>
  ```

---

### Sección 7: Productores PaisSana / Videos ([seccion7@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion7@2x-100.jpg))
* **Imagen de Referencia**: [seccion7@2x-100.jpg](file:///Users/williammoreno/code/la-paz-si-pasa/apps/frontend/documentacion/seccion7@2x-100.jpg)
* **Componente**: `src/components/paisana/PaisSanaProductoresVideos.astro`
* **Propósito**: Galería de historias audiovisuales (documentales y crónicas).
* **Imágenes Placeholders (`placehold.co`)**:
  * **Ilustración Tucán (Arriba Derecha)**: `https://placehold.co/200x300/png?text=Tucan+Ilustracion` (200x300 px)
  * **Thumbnails de Video Horizontal (16:9)**: `https://placehold.co/600x350?text=Video+Documental` (600x350 px cada uno)
* **Estructura HTML**:
  ```html
  <section class="productores-videos">
    <div class="productores-header-grid">
      <div class="productores-header-text">
        <h2>PRODUCTORES PAISSANA:</h2>
        <h3>Historias que transforman: el rostro de la paz</h3>
        <p>Detrás de cada producto con el sello PaisSana hay hombres y mujeres valientes... A través de estas <strong>crónicas audiovisuales y contenidos</strong>, conoce a los verdaderos protagonistas de PaisSana.</p>
      </div>
      <div class="productores-header-tucan">
        <img src="https://placehold.co/200x300/png?text=Tucan+Ilustracion" alt="Tucán" width="200" height="300" />
      </div>
    </div>

    <div class="videos-list">
      <article class="video-row-card">
        <div class="video-thumb">
          <img src="https://placehold.co/600x350?text=De+la+tierra+al+aire" alt="De la tierra al aire" width="600" height="350" />
          <button class="play-btn-large" aria-label="Reproducir documental">▶</button>
        </div>
        <div class="video-info">
          <h3>De la tierra al aire</h3>
          <span class="video-type">Documental</span>
          <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod...</p>
        </div>
      </article>

      <article class="video-row-card">
        <div class="video-thumb">
          <img src="https://placehold.co/600x350?text=Cronica+1" alt="Crónica 1" width="600" height="350" />
          <button class="play-btn-large" aria-label="Reproducir crónica">▶</button>
        </div>
        <div class="video-info">
          <h3>Crónica #1</h3>
          <span class="video-type">Crónica</span>
          <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod...</p>
        </div>
      </article>

      <article class="video-row-card">
        <div class="video-thumb">
          <img src="https://placehold.co/600x350?text=Cronica+2" alt="Crónica 2" width="600" height="350" />
          <button class="play-btn-large" aria-label="Reproducir crónica">▶</button>
        </div>
        <div class="video-info">
          <h3>Crónica #2</h3>
          <span class="video-type">Crónica</span>
          <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod...</p>
        </div>
      </article>
    </div>
  </section>
  ```

---

## 4. Plan de Trabajo e Implementación Recomendado

1. **Creación de componentes base con placeholders**:
   - Crear la carpeta `src/components/paisana/`.
   - Crear los 7 componentes Astro descritos con sus dimensiones exactas de `placehold.co`.
2. **Actualización de `src/pages/proyectos-destacados.astro`**:
   - Importar y montar los 7 componentes en orden.
3. **Conexión futura a datos reales (WordPress/CMS)**:
   - Crear adaptadores de fallback en `src/adapters/` para Mapa, Audios y Ferias de la misma forma que con `mockVideos` para mantener la página funcional sin romper el build.
