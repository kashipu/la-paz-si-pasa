import type { Noticia } from "../../contracts/Noticia";

/**
 * Normaliza a ISO AAAA-MM-DD, que es lo que declara el contrato.
 * El campo date_picker de ACF guarda "AAAAMMDD" sin guiones y la fecha del post
 * llega como ISO con hora; sin normalizar, ordenar por texto mezcla los formatos.
 */
export function toIsoDate(value: string): string {
  const sinGuiones = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (sinGuiones) return `${sinGuiones[1]}-${sinGuiones[2]}-${sinGuiones[3]}`;

  const isoConGuiones = /^\d{4}-\d{2}-\d{2}/.exec(value);
  return isoConGuiones ? isoConGuiones[0] : "";
}

export function mapNoticia(wpPost: any): Noticia {
  return {
    id: String(wpPost.id),
    titulo: wpPost.title?.rendered ?? "",
    url: wpPost.acf?.url ?? "",
    fecha: toIsoDate(wpPost.acf?.fecha || wpPost.date || ""),
  };
}
