import type { Subcuenta } from "../../contracts/Subcuenta";

export function mapSubcuenta(wpPost: any): Subcuenta {
  return {
    id: String(wpPost.id),
    nombre: wpPost.title?.rendered ?? "",
    iconoUrl: wpPost.acf?.icono?.url ?? "",
  };
}
