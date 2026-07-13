import type { Video } from "../../contracts/Video";

export function mapVideo(wpPost: any): Video {
  return {
    id: String(wpPost.id),
    titulo: wpPost.title?.rendered ?? "",
    descripcion: wpPost.acf?.descripcion ?? "",
    youtubeUrl: wpPost.acf?.youtube_url ?? "",
    thumbnailUrl: wpPost.acf?.thumbnail?.url ?? "",
    tags: wpPost.acf?.tags ?? [],
  };
}
