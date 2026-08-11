import type { Video } from "../../contracts/Video";
import { videoSource } from "../../youtube.js";
import { imagenUrl } from "./imagen.ts";

// ACF esperado: youtube_url (texto) XOR video_file (archivo MP4); thumbnail (imagen, opcional si es YouTube)
export function mapVideo(wpPost: any): Video {
  const ytUrl: string = wpPost.acf?.youtube_url ?? "";
  const fileUrl: string = wpPost.acf?.video_file?.url ?? "";
  const source = videoSource(ytUrl, fileUrl);

  return {
    id: String(wpPost.id),
    titulo: wpPost.title?.rendered ?? "",
    descripcion: wpPost.acf?.descripcion ?? "",
    ...source,
    thumbnailUrl: imagenUrl(wpPost.acf?.thumbnail) || source.thumbnailUrl,
    tags: (wpPost.acf?.tags ?? []).map((t: any) => (typeof t === "string" ? t : (t?.name ?? ""))),
  };
}
