import type {
  AudioRelato,
  Feria,
  HomeConfig,
  MenuItem,
  Noticia,
  Retrato,
  Subcuenta,
  Video,
} from "./contracts";
import { checkWordPressConnection, wpApiFetch, wpFetch, wpFetchAll } from "./wordpress/client";
import { cached } from "./wordpress/cache";
import { endpoints } from "./wordpress/endpoints";
import { mapAudioRelato } from "./wordpress/mappers/mapAudioRelato";
import { mapFeria } from "./wordpress/mappers/mapFeria";
import { mapHome } from "./wordpress/mappers/mapHome";
import { mapNoticia } from "./wordpress/mappers/mapNoticia";
import { mapRetrato } from "./wordpress/mappers/mapRetrato";
import { mapSubcuenta } from "./wordpress/mappers/mapSubcuenta";
import { mapVideo } from "./wordpress/mappers/mapVideo";
import {
  mockAudioRelatos,
  mockFerias,
  mockHome,
  mockMenuPrimary,
  mockNoticias,
  mockRetratos,
  mockSubcuentas,
  mockVideos,
} from "./mocks";

export type {
  AudioRelato,
  Feria,
  FeriaMedia,
  HeroData,
  HomeConfig,
  MenuItem,
  Noticia,
  Proyecto,
  Retrato,
  Subcuenta,
  Video,
} from "./contracts";
export type { WordPressConnectionStatus } from "./wordpress/client";
export { checkWordPressConnection };

export type ContentSourceStatus = {
  content: string;
  source: "wordpress" | "mocks" | "code";
};

export type ContentSourceReporter = (status: ContentSourceStatus) => void;

// ponytail: fallback a mocks mientras WordPress no tenga contenido publicado — retirar antes de producción
function withFallback<T>(
  key: string,
  loader: () => Promise<T>,
  mock: T,
  report?: ContentSourceReporter,
): Promise<T> {
  return cached(key, async () => {
    try {
      const result = await loader();
      report?.({ content: key, source: "wordpress" });
      return result;
    } catch (error) {
      if (report) {
        console.warn(`[content-debug] ${key}: usando mocks (${error instanceof Error ? error.message : error})`);
      }
      report?.({ content: key, source: "mocks" });
      return mock;
    }
  });
}

/** Lanza si la lista viene vacía, para que withFallback use los mocks en vez de renderizar en blanco. */
function requireItems<T>(items: T[], key: string): T[] {
  if (items.length === 0) throw new Error(`sin contenido publicado en WordPress (${key})`);
  return items;
}

function byOrden<T extends { orden?: number }>(a: T, b: T) {
  return (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER);
}

/** Hero + URL del CTA de noticias: ambos viven en la página WordPress con slug "home". */
export function getHome(report?: ContentSourceReporter): Promise<HomeConfig> {
  return withFallback(
    "home",
    async () => {
      const pages = await wpFetch<any[]>(endpoints.hero, { slug: "home" });
      if (!pages?.length) throw new Error("no existe la página con slug 'home'");
      return mapHome(pages[0]);
    },
    mockHome,
    report,
  );
}

export function getRetratos(report?: ContentSourceReporter): Promise<Retrato[]> {
  return withFallback(
    "retratos",
    async () => requireItems((await wpFetchAll<any>(endpoints.retratos)).map(mapRetrato), "retratos"),
    mockRetratos,
    report,
  );
}

export function getSubcuentas(report?: ContentSourceReporter): Promise<Subcuenta[]> {
  return withFallback(
    "subcuentas",
    async () => {
      const items = await wpFetchAll<any>(endpoints.subcuentas, { orderby: "menu_order", order: "asc" });
      return requireItems(items.map(mapSubcuenta), "subcuentas");
    },
    mockSubcuentas,
    report,
  );
}

export async function getNoticias(limit?: number, report?: ContentSourceReporter): Promise<Noticia[]> {
  const noticias = await withFallback(
    "noticias",
    async () => requireItems((await wpFetchAll<any>(endpoints.noticias)).map(mapNoticia), "noticias"),
    mockNoticias,
    report,
  );
  const ordenadas = [...noticias].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return limit ? ordenadas.slice(0, limit) : ordenadas;
}

export function getVideos(report?: ContentSourceReporter): Promise<Video[]> {
  return withFallback(
    "videos",
    async () => requireItems((await wpFetchAll<any>(endpoints.videos)).map(mapVideo), "videos"),
    mockVideos,
    report,
  );
}

export async function getAudioRelatos(report?: ContentSourceReporter): Promise<AudioRelato[]> {
  const relatos = await withFallback(
    "audioRelatos",
    async () => requireItems((await wpFetchAll<any>(endpoints.audioRelatos)).map(mapAudioRelato), "audioRelatos"),
    mockAudioRelatos,
    report,
  );
  return [...relatos].sort(byOrden);
}

export async function getFerias(report?: ContentSourceReporter): Promise<Feria[]> {
  const ferias = await withFallback(
    "ferias",
    async () => requireItems((await wpFetchAll<any>(endpoints.ferias)).map(mapFeria), "ferias"),
    mockFerias,
    report,
  );
  return [...ferias].sort(byOrden);
}

/** Menú de la location "primary" en WordPress; cae a los tres enlaces fijos si no está configurado. */
export async function getMenuPrimary(report?: ContentSourceReporter): Promise<MenuItem[]> {
  const items = await withFallback(
    "menuPrimary",
    async () => {
      const site = await wpApiFetch<{ menus?: { primary?: MenuItem[] } }>("headless/v1/site");
      return requireItems(site?.menus?.primary ?? [], "menuPrimary");
    },
    mockMenuPrimary,
    report,
  );
  return [...items].sort((a, b) => a.order - b.order);
}
