# Especificación Técnica — Frontend "La Paz Sí Pasa"

**Objetivo:** construir el frontend en Astro de forma que sea independiente del backend/CMS que finalmente se use (WordPress u otro). El frontend consume un contrato de datos propio, no el modelo de datos del CMS.

---

## 1. Principio de arquitectura

El frontend nunca debe llamar directamente a los endpoints nativos de WordPress (`/wp-json/wp/v2/...`) desde los componentes de UI. En su lugar:

```
Componente Astro  →  Adapter (interfaz propia)  →  Cliente del backend actual (WP)
```

Si mañana cambia el backend (Strapi, Sanity, un CMS headless propio, etc.), solo se reemplaza el **adapter**, no los componentes ni las páginas.

**Regla de oro:** ningún componente de UI debe importar tipos o funciones que mencionen "WordPress", "wp", "ACF" o "REST" directamente. Solo debe conocer el contrato de datos abstracto (sección 4).

---

## 2. Estructura de carpetas propuesta

```
src/
├── adapters/
│   ├── contracts/            # Interfaces TypeScript (el "contrato" — no cambia)
│   │   ├── Hero.ts
│   │   ├── Retrato.ts
│   │   ├── Subcuenta.ts
│   │   ├── Noticia.ts
│   │   ├── Video.ts
│   │   └── index.ts
│   │
│   ├── wordpress/             # Implementación específica de WP (única capa que sabe de WP)
│   │   ├── client.ts          # fetch/axios configurado con la URL base del backend
│   │   ├── mappers/           # transforma respuesta de WP → contrato propio
│   │   │   ├── mapRetrato.ts
│   │   │   ├── mapNoticia.ts
│   │   │   └── mapVideo.ts
│   │   └── endpoints.ts       # rutas REST/GraphQL de WP centralizadas
│   │
│   └── index.ts               # punto único de entrada: expone funciones como
│                               # getRetratos(), getNoticias(), getVideos()
│
├── components/
│   ├── Hero/
│   ├── RetratosGaleria/
│   ├── Subcuentas/
│   ├── NoticiasCarrusel/
│   ├── ActualidadGaleria/
│   └── Footer/
│
├── layouts/
│   └── BaseLayout.astro
│
├── pages/
│   ├── index.astro
│   └── proyectos-destacados.astro
│
├── content/                    # opcional: contenido estático fallback (mock/dev)
│   └── mocks/
│
└── env.d.ts
```

**Por qué esta estructura:**
- `adapters/contracts/` define el "idioma" que habla el frontend. Es lo único que los componentes conocen.
- `adapters/wordpress/` es la única carpeta que se reescribe si cambia el backend.
- Los `mappers/` son funciones puras: reciben el JSON crudo de WP y devuelven un objeto que cumple el contrato. Ahí vive toda la lógica de "traducción".

---

## 3. Contrato de datos por componente

Cada componente editable definido en el alcance funcional tiene una interfaz TypeScript fija. Estas interfaces **no cambian** aunque cambie el backend.

### Hero
```ts
export interface HeroData {
  imageUrl: string;
  imageAlt: string;
}
```

### Retrato (galería "Retratos de la Paz")
```ts
export interface Retrato {
  id: string;
  fotoUrl: string;
  descripcion: string;
  proyecto: "Colombia Sostenible" | "PaisSana" | "PDET";
  lugar: string;
}
```

### Subcuenta (carrusel de íconos)
```ts
export interface Subcuenta {
  id: string;
  nombre: string;
  iconoUrl: string;
}
```

### Noticia (carrusel de noticias, redirecciones externas)
```ts
export interface Noticia {
  id: string;
  titulo: string;
  url: string;       // redirección externa a prensa
  fecha: string;      // ISO date, para ordenar/agrupar por año
}
```

### Video (galería de Actualidad)
```ts
export interface Video {
  id: string;
  titulo: string;
  descripcion: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  tags: Array<"Colombia Sostenible" | "PaisSana" | "PDET">;
}
```

**Ventaja:** si un componente recibe datos que cumplen esta forma, no le importa si vinieron de WordPress, de un archivo JSON local, o de otro CMS.

---

## 4. Capa de adapters — funciones expuestas

El archivo `adapters/index.ts` es el único punto de entrada que usan las páginas Astro:

```ts
export async function getHero(): Promise<HeroData> { ... }
export async function getRetratos(): Promise<Retrato[]> { ... }
export async function getSubcuentas(): Promise<Subcuenta[]> { ... }
export async function getNoticias(limit?: number): Promise<Noticia[]> { ... }
export async function getVideos(): Promise<Video[]> { ... }
```

Internamente, cada función:
1. Llama al cliente de WordPress (`adapters/wordpress/client.ts`)
2. Pasa la respuesta cruda por su mapper correspondiente
3. Devuelve datos ya tipados según el contrato

**Ejemplo de mapper (WP → contrato propio):**
```ts
// adapters/wordpress/mappers/mapRetrato.ts
import type { Retrato } from "../../contracts/Retrato";

export function mapRetrato(wpPost: any): Retrato {
  return {
    id: String(wpPost.id),
    fotoUrl: wpPost.acf?.foto?.url ?? "",
    descripcion: wpPost.acf?.descripcion ?? "",
    proyecto: wpPost.acf?.proyecto ?? "Colombia Sostenible",
    lugar: wpPost.acf?.lugar ?? "",
  };
}
```

Si cambias de backend, solo reescribes este mapper (y el client), el resto del proyecto no se toca.

---

## 5. Renderizado: SSG vs SSR

Recomendación por sección, dado que es un micrositio de cierre de gestión (contenido no cambia con alta frecuencia):

| Sección | Estrategia | Razón |
|---|---|---|
| Home general (Hero, Intro, textos fijos) | **SSG** (build estático) | Contenido casi fijo |
| Retratos de la Paz | SSG con rebuild on-demand | Se actualiza ocasionalmente — rebuild al publicar |
| Noticias | SSG con rebuild on-demand | Redirecciones externas, no cambia seguido |
| Actualidad (videos) | SSG con rebuild on-demand | Igual patrón |

**Mecanismo de "rebuild on-demand":** configurar un webhook desde WordPress (al publicar/actualizar un post) que dispare un nuevo build del sitio Astro (ej. vía Netlify/Vercel deploy hook, o un webhook a tu propio pipeline en Dokploy).

Si en el futuro se necesita contenido en tiempo real sin rebuild, se puede migrar secciones puntuales a SSR o a fetch en cliente (`client:load`), pero no se recomienda por defecto aquí.

---

## 6. Imágenes y media

- Usar `astro:assets` (`<Image />`) para imágenes que vivan en el propio proyecto (logos, fondos fijos del theming).
- Para imágenes que vienen del backend (fotos de retratos, thumbnails de video), usar un componente wrapper propio (`<RemoteImage />`) que:
  - Reciba `src`, `alt`, `width`, `height` desde el contrato de datos
  - Aplique lazy loading y formatos modernos (webp/avif) si el backend lo permite, o vía un servicio de optimización externo
- Los thumbnails de YouTube no se descargan ni se persisten localmente — se consumen por URL directa (según se definió previamente), evitando duplicar storage.

---

## 7. Variables de entorno

Nada de URLs o credenciales hardcodeadas en el código. Todo vía `.env`:

```
PUBLIC_BACKEND_TYPE=wordpress          # luego podría ser "strapi", "sanity", etc.
PUBLIC_API_BASE_URL=https://.../wp-json/wp/v2
PUBLIC_YOUTUBE_CHANNEL_ID=...
BUILD_WEBHOOK_SECRET=...               # para validar el trigger de rebuild
```

El valor de `PUBLIC_BACKEND_TYPE` permite, a futuro, tener un switch en `adapters/index.ts` que elija qué implementación cargar sin tocar el resto del código.

---

## 8. Componentes: convenciones

- Cada componente Astro recibe **props tipadas con las interfaces del contrato** (sección 3), nunca con tipos crudos del backend.
- Ningún componente hace fetch por sí mismo — todo el fetching ocurre en las páginas (`pages/*.astro`) o en `getStaticPaths`, y se pasa como props.
- Nombrar componentes por su función de negocio, no por su origen de datos (`RetratosGaleria`, no `WpRetratosGaleria`).

---

## 9. Qué cambia si se reemplaza WordPress a futuro

| Se mantiene igual | Se reescribe |
|---|---|
| Todos los componentes (`components/`) | `adapters/wordpress/` completo |
| Contratos de datos (`adapters/contracts/`) | Mappers específicos del nuevo backend |
| Páginas (`pages/`) | Cliente HTTP/GraphQL del nuevo backend |
| Lógica de layout y estilos | Variables de entorno (`PUBLIC_API_BASE_URL`, etc.) |

Esto reduce el trabajo de migración a la capa de adapters exclusivamente, sin tocar UI ni lógica de páginas.

---

## 10. Pendientes a definir con el equipo técnico

- Confirmar si WordPress expondrá datos vía REST API nativa + ACF-to-REST, o vía GraphQL (WPGraphQL) — afecta el diseño del `client.ts`
- Definir mecanismo de rebuild on-demand (webhook + plataforma de despliegue)
- Confirmar si los CPT (`retrato`, `video`, `noticia`) expondrán sus campos ACF en el JSON de la REST API por defecto o requieren configuración adicional