import type { Noticia } from "../../contracts/Noticia";

export function mapNoticia(wpPost: any): Noticia {
  return {
    id: String(wpPost.id),
    titulo: wpPost.title?.rendered ?? "",
    url: wpPost.acf?.url ?? "",
    fecha: wpPost.acf?.fecha ?? wpPost.date ?? "",
  };
}
