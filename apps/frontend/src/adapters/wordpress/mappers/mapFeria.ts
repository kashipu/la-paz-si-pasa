import type { Feria, FeriaMedia } from "../../contracts/Feria";
import { videoSource } from "../../youtube.js";
import { imagenUrl } from "./imagen.ts";

// ACF esperado: descripcion, galeria (gallery), videos (repetidor de fuente_video,
// video_youtube XOR video_file, thumbnail_video, pie), orden, abierta_por_defecto
export function mapFeria(wpPost: any): Feria {
  const titulo = wpPost.title?.rendered ?? "";
  const orden = Number(wpPost.acf?.orden);

  const galeria: FeriaMedia[] = (wpPost.acf?.galeria ?? []).map((img: any, i: number) => ({
    url: imagenUrl(img),
    alt: img?.alt || `${titulo} ${i + 1}`,
    tipo: "imagen" as const,
  }));

  return {
    id: String(wpPost.id),
    titulo,
    descripcion: wpPost.acf?.descripcion ?? "",
    galeria,
    videos: mapFeriaVideos(wpPost, titulo),
    orden: Number.isFinite(orden) ? orden : undefined,
    abiertaPorDefecto: Boolean(wpPost.acf?.abierta_por_defecto),
  };
}

function mapFeriaVideos(wpPost: any, titulo: string): FeriaMedia[] {
  // Producción todavía puede traer el esquema viejo de un solo video suelto, así
  // que si el repetidor no viene se leen los campos planos.
  const filas: any[] = Array.isArray(wpPost.acf?.videos) && wpPost.acf.videos.length
    ? wpPost.acf.videos
    : [wpPost.acf ?? {}];

  return filas
    .map((fila, i) => mapFeriaVideo(fila, titulo, i, filas.length))
    .filter((video): video is FeriaMedia => video !== undefined);
}

function mapFeriaVideo(fila: any, titulo: string, i: number, total: number): FeriaMedia | undefined {
  const ytUrl: string = fila?.video_youtube ?? "";
  const fileUrl: string = fila?.video_file?.url ?? "";
  if (!ytUrl && !fileUrl) return undefined;

  const source = videoSource(ytUrl, fileUrl);
  if (source.estado === "no-disponible") return undefined;

  return {
    url: source.videoUrl,
    alt: total > 1 ? `Video ${i + 1} de ${total} de ${titulo}` : `Video ${titulo}`,
    tipo: "video",
    fuente: source.fuente,
    thumbnailUrl: imagenUrl(fila?.thumbnail_video) || source.thumbnailUrl,
    pie: fila?.pie || undefined,
  };
}
