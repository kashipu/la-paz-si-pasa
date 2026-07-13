# Especificación Técnica — Frontend "La Paz Sí Pasa"

**Objetivo:** construir el frontend en Astro de forma que sea independiente del backend/CMS que finalmente se use (WordPress u otro). El frontend consume un contrato de datos propio, no el modelo de datos del CMS.

---

## 1. Alcance funcional y compromisos de la cotización

Esta sección resume el alcance acordado en la cotización con Una Tinta Medios ($4.800.000 COP, proyecto cerrado). Sirve como contexto de negocio para todo el resto del documento técnico.

### Páginas

| Página | Estado de diseño |
|---|---|
| Home | Con mockup entregado por el cliente |
| Proyectos Destacados | Sin mockup — referencia 3 proyectos con fotografías, videos y textos por proyecto, sin páginas adicionales por proyecto (el diseño visual de esta página lo entrega el cliente) |

### Secciones de la Home y qué se edita en cada una

| Sección | ¿Editable? | Qué se puede editar |
|---|---|---|
| Header | No | Fijo — logo y foto de fondo no se cambian desde el administrador |
| Navegación | No | 3 botones fijos: Lo que hacemos / Proyectos destacados / Actualidad |
| Hero | Sí | Solo la imagen (sin carrusel) |
| Intro ("La Paz Sí Pasa") | No | Texto fijo introductorio |
| Retratos de la Paz (galería) | Sí | Fotografía, descripción, nombre del proyecto, lugar — por cada retrato |
| Lo que hacemos en el fondo → Texto destacado | Sí | Contenido de texto |
| Lo que hacemos en el fondo → Carrusel Noticias | Sí | Se sube noticia por noticia; se muestran 3; son redirecciones externas a prensa (no páginas propias) |
| Lo que hacemos en el fondo → Carrusel subcuentas | Sí | Íconos/logos de subcuentas, sin links |
| Lo que hacemos en el fondo → CTA "Más noticias del fondo" | Sí | URL del botón |
| Actualidad (galería de video) | Sí | Título, descripción, URL de YouTube, thumbnail, tags/proyecto — por cada video; "Ver más videos" despliega el resto |
| Footer | No | Fijo — logos, texto de cierre, redes, link web |

### Entregables comprometidos
- Frontend en Astro con diseño a medida (estética "archivo análogo")
- Backend en WordPress para la administración de la información
- Adaptación responsive del sitio (mobile / tablet / desktop)
- Alineación con el equipo de tecnología del cliente para despliegue y pruebas

### Fuera de este alcance
- Hosting, dominio y despliegue en servidor
- Licencias de plugins premium, si el stack final las requiere
- Analítica, seguridad y monitoreo
- Diseño visual de "Proyectos Destacados"
- Cambios o rediseños fuera de lo aquí especificado (se cotizan aparte)

Esta tabla es la referencia de negocio; las secciones siguientes traducen cada componente editable a su implementación técnica en Astro.

---

## 2. Principio de arquitectura

El frontend nunca debe llamar directamente a los endpoints nativos de WordPress (`/wp-json/wp/v2/...`) desde los componentes de UI. En su lugar:

```
Componente Astro  →  Conector (interfaz propia)  →  Cliente del backend actual (WP)
```

Si mañana cambia el backend (Strapi, Sanity, un CMS headless propio, etc.), solo se reemplaza el **conector**, no los componentes ni las páginas.

**Regla de oro:** ningún componente de UI debe importar tipos o funciones que mencionen "WordPress", "wp", "ACF" o "REST" directamente. Solo debe conocer el contrato de datos abstracto (sección 5).

---

## 3. Estructura de carpetas propuesta (todo en español)

```
src/
├── conectores/
│   ├── contratos/              # Interfaces TypeScript (el "contrato" — no cambia)
│   │   ├── Hero.ts
│   │   ├── Retrato.ts
│   │   ├── Subcuenta.ts
│   │   ├── Noticia.ts
│   │   ├── Video.ts
│   │   └── index.ts
│   │
│   ├── wordpress/               # Implementación específica de WP (única capa que sabe de WP)
│   │   ├── cliente.ts           # fetch/axios configurado con la URL base del backend
│   │   ├── traductores/         # transforma respuesta de WP → contrato propio
│   │   │   ├── traducirRetrato.ts
│   │   │   ├── traducirNoticia.ts
│   │   │   └── traducirVideo.ts
│   │   └── endpoints.ts         # rutas REST/GraphQL de WP centralizadas
│   │
│   └── index.ts                 # punto único de entrada: expone funciones como
│                                 # obtenerRetratos(), obtenerNoticias(), obtenerVideos()
│
├── componentes/
│   ├── Encabezado/               # Hero
│   ├── GaleriaRetratos/          # "Retratos de la Paz"
│   ├── CarruselSubcuentas/
│   ├── CarruselNoticias/
│   ├── GaleriaActualidad/        # galería de video
│   └── PiePagina/                # Footer
│
├── layouts/
│   └── DisenoBase.astro
│
├── pages/
│   ├── index.astro
│   └── proyectos-destacados.astro
│
├── contenido/                    # opcional: contenido estático de respaldo (mock/dev)
│   └── datos-prueba/
│
└── env.d.ts
```

**Por qué esta estructura:**
- `conectores/contratos/` define el "idioma" que habla el frontend. Es lo único que los componentes conocen.
- `conectores/wordpress/` es la única carpeta que se reescribe si cambia el backend.
- Los `traductores/` son funciones puras: reciben el JSON crudo de WP y devuelven un objeto que cumple el contrato. Ahí vive toda la lógica de "traducción" entre el modelo de WordPress y el modelo propio del frontend.

**Convención de nombres:** carpetas y archivos de estructura/lógica (`conectores`, `traductores`, `componentes`) en español; nombres de propiedades dentro del código (`id`, `url`, `titulo`) se mantienen en español donde no choquen con convenciones estándar de la librería (Astro/TypeScript usan inglés en su propio API, eso no se traduce).

---

## 4. Mapa alcance → contrato → componente

Tabla puente entre lo comercial (sección 1) y lo técnico (secciones 5-9): qué sección de la cotización corresponde a qué contrato de datos y a qué carpeta de componente.

| Sección de la cotización | Contrato (TypeScript) | Carpeta de componente |
|---|---|---|
| Hero | `Hero` | `componentes/Encabezado/` |
| Retratos de la Paz | `Retrato` | `componentes/GaleriaRetratos/` |
| Carrusel subcuentas | `Subcuenta` | `componentes/CarruselSubcuentas/` |
| Carrusel Noticias | `Noticia` | `componentes/CarruselNoticias/` |
| Actualidad (galería de video) | `Video` | `componentes/GaleriaActualidad/` |
| Header, Navegación, Intro, Footer | — (sin contrato, contenido fijo en el código) | `componentes/PiePagina/` y layout base |

---

## 5. Contrato de datos por componente

Cada componente editable definido en el alcance funcional (sección 1) tiene una interfaz TypeScript fija, guardada en `conectores/contratos/`. Estas interfaces **no cambian** aunque cambie el backend — son el punto fijo de referencia para quien actualice contenido o desarrolle a futuro.

### `Hero.ts` — imagen principal del encabezado
```ts
export interface Hero {
  urlImagen: string;
  textoAlternativo: string;   // alt de accesibilidad
}
```
Contenido asociado: 1 sola imagen, sin galería. Se actualiza reemplazando el archivo desde el backend.

---

### `Retrato.ts` — ítem de la galería "Retratos de la Paz"
```ts
export interface Retrato {
  id: string;
  urlFoto: string;
  descripcion: string;
  proyecto: "Colombia Sostenible" | "PaisSana" | "PDET";
  lugar: string;
}
```
Contenido asociado por cada retrato: fotografía, descripción corta (texto libre), proyecto asociado (uno de los 3 valores fijos), y lugar (municipio o región, texto libre). Es una lista que crece — cada nuevo retrato es un nuevo objeto de este tipo.

---

### `Subcuenta.ts` — ítem del carrusel de subcuentas
```ts
export interface Subcuenta {
  id: string;
  nombre: string;
  urlIcono: string;
}
```
Contenido asociado: nombre de la subcuenta e ícono/logo (imagen o SVG). Sin enlace — es solo visual, confirmado previamente.

---

### `Noticia.ts` — ítem del carrusel de noticias
```ts
export interface Noticia {
  id: string;
  titulo: string;
  urlDestino: string;   // redirección externa a la nota de prensa del fondo
  fechaPublicacion: string;   // formato ISO (AAAA-MM-DD), para ordenar y agrupar por año
}
```
Contenido asociado: solo título y link de salida — no hay cuerpo de noticia ni imagen propia (se definió que son puras redirecciones). El agrupado "3 noticias por año" en el home se calcula a partir de `fechaPublicacion`, no es un campo manual.

---

### `Video.ts` — ítem de la galería de Actualidad
```ts
export interface Video {
  id: string;
  titulo: string;
  descripcion: string;
  urlYoutube: string;
  urlMiniatura: string;        // thumbnail — manual o extraído de YouTube según se defina
  etiquetas: Array<"Colombia Sostenible" | "PaisSana" | "PDET">;
}
```
Contenido asociado por cada video: título, descripción corta, enlace al video en YouTube, imagen de miniatura, y una o varias etiquetas de proyecto (para filtrar si se requiere a futuro).

---

**Ventaja de este contrato:** si un componente recibe datos que cumplen esta forma exacta, no le importa si vinieron de WordPress, de un archivo JSON local, o de otro CMS. Quien actualice contenido solo necesita saber "qué campos llenar", no cómo está construido el frontend por dentro.

---

## 6. Capa de conectores — funciones expuestas

El archivo `conectores/index.ts` es el único punto de entrada que usan las páginas Astro:

```ts
export async function obtenerHero(): Promise<Hero> { ... }
export async function obtenerRetratos(): Promise<Retrato[]> { ... }
export async function obtenerSubcuentas(): Promise<Subcuenta[]> { ... }
export async function obtenerNoticias(limite?: number): Promise<Noticia[]> { ... }
export async function obtenerVideos(): Promise<Video[]> { ... }
```

Internamente, cada función:
1. Llama al cliente de WordPress (`conectores/wordpress/cliente.ts`)
2. Pasa la respuesta cruda por su traductor correspondiente
3. Devuelve datos ya tipados según el contrato

**Ejemplo de traductor (WP → contrato propio):**
```ts
// conectores/wordpress/traductores/traducirRetrato.ts
import type { Retrato } from "../../contratos/Retrato";

export function traducirRetrato(publicacionWp: any): Retrato {
  return {
    id: String(publicacionWp.id),
    urlFoto: publicacionWp.acf?.foto?.url ?? "",
    descripcion: publicacionWp.acf?.descripcion ?? "",
    proyecto: publicacionWp.acf?.proyecto ?? "Colombia Sostenible",
    lugar: publicacionWp.acf?.lugar ?? "",
  };
}
```

Si cambias de backend, solo reescribes este traductor (y el cliente), el resto del proyecto no se toca.

---

## 7. Renderizado: SSG vs SSR

Recomendación por sección, dado que es un micrositio de cierre de gestión (contenido no cambia con alta frecuencia):

| Sección / componente | Estrategia | Razón |
|---|---|---|
| Home general (Encabezado, Intro, textos fijos) | **SSG** (build estático) | Contenido casi fijo |
| GaleriaRetratos | SSG con rebuild on-demand | Se actualiza ocasionalmente — rebuild al publicar |
| CarruselNoticias | SSG con rebuild on-demand | Redirecciones externas, no cambia seguido |
| GaleriaActualidad | SSG con rebuild on-demand | Igual patrón |

**Mecanismo de "rebuild on-demand":** configurar un webhook desde WordPress (al publicar/actualizar un post) que dispare un nuevo build del sitio Astro (ej. vía Netlify/Vercel deploy hook, o un webhook a tu propio pipeline en Dokploy).

Si en el futuro se necesita contenido en tiempo real sin rebuild, se puede migrar secciones puntuales a SSR o a fetch en cliente (`client:load`), pero no se recomienda por defecto aquí.

---

## 8. Imágenes y media

- Usar `astro:assets` (`<Image />`) para imágenes que vivan en el propio proyecto (logos, fondos fijos del theming).
- Para imágenes que vienen del backend (fotos de retratos, thumbnails de video), usar un componente wrapper propio (`<ImagenRemota />`) que:
  - Reciba `src`, `alt`, `width`, `height` desde el contrato de datos
  - Aplique lazy loading y formatos modernos (webp/avif) si el backend lo permite, o vía un servicio de optimización externo
- Los thumbnails de YouTube no se descargan ni se persisten localmente — se consumen por URL directa (según se definió previamente), evitando duplicar storage.

---

## 9. Variables de entorno

Nada de URLs o credenciales hardcodeadas en el código. Todo vía `.env`:

```
PUBLIC_TIPO_BACKEND=wordpress          # luego podría ser "strapi", "sanity", etc.
PUBLIC_API_URL_BASE=https://.../wp-json/wp/v2
PUBLIC_YOUTUBE_CHANNEL_ID=...
BUILD_WEBHOOK_SECRET=...               # para validar el trigger de rebuild
```

El valor de `PUBLIC_TIPO_BACKEND` permite, a futuro, tener un switch en `conectores/index.ts` que elija qué implementación cargar sin tocar el resto del código.

---

## 10. Componentes: convenciones de nombres y contenido editable

| Carpeta del componente | Contenido que administra | Contrato que usa |
|---|---|---|
| `Encabezado/` | Imagen del Hero | `Hero` |
| `GaleriaRetratos/` | Fotografía, descripción, proyecto, lugar (por retrato) | `Retrato[]` |
| `CarruselSubcuentas/` | Nombre e ícono por subcuenta | `Subcuenta[]` |
| `CarruselNoticias/` | Título y link externo por noticia (3 visibles, agrupadas por año) | `Noticia[]` |
| `GaleriaActualidad/` | Título, descripción, link de YouTube, miniatura y etiquetas por video | `Video[]` |
| `PiePagina/` | Fijo — no editable | — |

Reglas generales:
- Cada componente Astro recibe **props tipadas con las interfaces del contrato** (sección 5), nunca con tipos crudos del backend.
- Ningún componente hace fetch por sí mismo — todo el fetching ocurre en las páginas (`pages/*.astro`), y se pasa como props ya resueltas.
- Nombrar componentes por su función de negocio en español, no por su origen de datos (`GaleriaRetratos`, no `WpGaleriaRetratos`).
- Esta tabla sirve como referencia rápida para quien vaya a actualizar contenido o incorporarse al proyecto: identifica de un vistazo qué carpeta tocar según qué contenido se necesita cambiar.

---

## 11. Qué cambia si se reemplaza WordPress a futuro

| Se mantiene igual | Se reescribe |
|---|---|
| Todos los componentes (`componentes/`) | `conectores/wordpress/` completo |
| Contratos de datos (`conectores/contratos/`) | Traductores específicos del nuevo backend |
| Páginas (`pages/`) | Cliente HTTP/GraphQL del nuevo backend |
| Lógica de layout y estilos | Variables de entorno (`PUBLIC_API_URL_BASE`, etc.) |

Esto reduce el trabajo de migración a la capa de conectores exclusivamente, sin tocar UI ni lógica de páginas.

---

## 12. Pendientes a definir con el equipo técnico

- Confirmar si WordPress expondrá datos vía REST API nativa + ACF-to-REST, o vía GraphQL (WPGraphQL) — afecta el diseño del `cliente.ts`
- Definir mecanismo de rebuild on-demand (webhook + plataforma de despliegue)
- Confirmar si los CPT (`retrato`, `video`, `noticia`) expondrán sus campos ACF en el JSON de la REST API por defecto o requieren configuración adicional