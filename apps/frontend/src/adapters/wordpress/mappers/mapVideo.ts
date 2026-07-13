import type { Video } from "../../contracts/Video";

function youtubeId(url: string): string {
  return url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1] ?? "";
}

// ACF esperado: youtube_url (texto) XOR video_file (archivo MP4); thumbnail (imagen, opcional si es YouTube)
export function mapVideo(wpPost: any): Video {
  const ytUrl: string = wpPost.acf?.youtube_url ?? "";
  const id = youtubeId(ytUrl);
  const fuente = id ? "youtube" : "wordpress";
  return {
    id: String(wpPost.id),
    titulo: wpPost.title?.rendered ?? "",
    descripcion: wpPost.acf?.descripcion ?? "",
    fuente,
    videoUrl: id ? `https://www.youtube-nocookie.com/embed/${id}` : (wpPost.acf?.video_file?.url ?? ""),
    thumbnailUrl: wpPost.acf?.thumbnail?.url ?? (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ""),
    tags: (wpPost.acf?.tags ?? []).map((t: any) => (typeof t === "string" ? t : (t?.name ?? ""))),
  };
}
