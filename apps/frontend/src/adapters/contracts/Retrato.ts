export type Proyecto =
  | "Colombia Sostenible"
  | "PaisSana"
  | "PDET"
  | "Programa Piloto de Inversiones Prioritarias en Municipios PDET";

export interface Retrato {
  id: string;
  fotoUrl: string | ImageMetadata;
  descripcion: string;
  proyecto: Proyecto;
  lugar: string;
}
import type { ImageMetadata } from "astro";
