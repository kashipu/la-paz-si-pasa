import type { Subcuenta } from "../../contracts/Subcuenta";
import { imagenUrl } from "./imagen.ts";

export function mapSubcuenta(wpPost: any): Subcuenta {
  return {
    id: String(wpPost.id),
    nombre: wpPost.title?.rendered ?? "",
    iconoUrl: imagenUrl(wpPost.acf?.icono),
  };
}
