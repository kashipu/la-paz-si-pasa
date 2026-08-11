import type { Retrato } from "../../contracts/Retrato";
import { imagenUrl } from "./imagen.ts";

export function mapRetrato(wpPost: any): Retrato {
  return {
    id: String(wpPost.id),
    fotoUrl: imagenUrl(wpPost.acf?.foto),
    descripcion: wpPost.acf?.descripcion ?? "",
    proyecto: wpPost.acf?.proyecto ?? "Colombia Sostenible",
    lugar: wpPost.acf?.lugar ?? "",
  };
}
