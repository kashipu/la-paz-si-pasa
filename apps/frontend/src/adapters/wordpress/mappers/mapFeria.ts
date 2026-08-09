import type { Feria, FeriaMedia } from "../../contracts/Feria";
import { videoSource } from "../../youtube.js";

// ACF esperado: descripcion, galeria (gallery), fuente_video, video_youtube XOR video_file,
// thumbnail_video, orden, abierta_por_defecto
export function mapFeria(wpPost: any): Feria {
  const titulo = wpPost.title?.rendered ?? "";
  const orden = Number(wpPost.acf?.orden);

  const galeria: FeriaMedia[] = (wpPost.acf?.galeria ?? []).map((img: any, i: number) => ({
    url: img?.url ?? "",
    alt: img?.alt || `${titulo} ${i + 1}`,
    tipo: "imagen" as const,
  }));

  return {
    id: String(wpPost.id),
    titulo,
    descripcion: wpPost.acf?.descripcion ?? "",
    galeria,
    video: mapFeriaVideo(wpPost, titulo),
    orden: Number.isFinite(orden) ? orden : undefined,
    abiertaPorDefecto: Boolean(wpPost.acf?.abierta_por_defecto),
  };
}

function mapFeriaVideo(wpPost: any, titulo: string): FeriaMedia | undefined {
  const ytUrl: string = wpPost.acf?.video_youtube ?? "";
  const fileUrl: string = wpPost.acf?.video_file?.url ?? "";
  if (!ytUrl && !fileUrl) return undefined;

  const source = videoSource(ytUrl, fileUrl);
  if (source.estado === "no-disponible") return undefined;

  return {
    url: source.videoUrl,
    alt: `Video ${titulo}`,
    tipo: "video",
    fuente: source.fuente,
    thumbnailUrl: wpPost.acf?.thumbnail_video?.url || source.thumbnailUrl,
  };
}
