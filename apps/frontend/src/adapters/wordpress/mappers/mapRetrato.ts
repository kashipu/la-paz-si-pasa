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
