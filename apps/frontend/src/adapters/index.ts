import type { HeroData, Retrato, Subcuenta, Noticia, Video } from "./contracts";
import { wpFetch, wpFetchAll } from "./wordpress/client";
import { cached } from "./wordpress/cache";
import { endpoints } from "./wordpress/endpoints";
import { mapHero } from "./wordpress/mappers/mapHero";
import { mapNoticia } from "./wordpress/mappers/mapNoticia";
import { mapRetrato } from "./wordpress/mappers/mapRetrato";
import { mockHero, mockRetratos, mockSubcuentas, mockNoticias, mockVideos } from "./mocks";

export type { HeroData, Retrato, Subcuenta, Noticia, Video, Proyecto } from "./contracts";

// ponytail: fallback a mocks mientras los CPT no existan en WP — quitar cuando el backend esté listo
function withFallback<T>(key: string, loader: () => Promise<T>, mock: T): Promise<T> {
  return cached(key, async () => {
    try {
      return await loader();
    } catch (error) {
      console.warn(`[adapters] ${key}: usando mocks (${error instanceof Error ? error.message : error})`);
      return mock;
    }
  });
}

export function getHero(): Promise<HeroData> {
  return withFallback(
    "hero",
    async () => mapHero((await wpFetch<any[]>(endpoints.hero, { slug: "home" }))[0]),
    mockHero,
  );
}

export function getRetratos(): Promise<Retrato[]> {
  return withFallback(
    "retratos",
    async () => (await wpFetchAll<any>(endpoints.retratos)).map(mapRetrato),
    mockRetratos,
  );
}

// ponytail: mock forzado — subcuenta aún no tiene integración WP lista, quitar cuando esté
export function getSubcuentas(): Promise<Subcuenta[]> {
  return Promise.resolve(mockSubcuentas);
}

export async function getNoticias(limit?: number): Promise<Noticia[]> {
  const noticias = await withFallback(
    "noticias",
    async () => (await wpFetchAll<any>(endpoints.noticias)).map(mapNoticia),
    mockNoticias,
  );
  const ordenadas = [...noticias].sort((a, b) => b.fecha.localeCompare(a.fecha));
  return limit ? ordenadas.slice(0, limit) : ordenadas;
}

// ponytail: mock forzado — video aún no tiene integración WP lista, quitar cuando esté
export function getVideos(): Promise<Video[]> {
  return Promise.resolve(mockVideos);
}
