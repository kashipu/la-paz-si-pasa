export type Proyecto = "Colombia Sostenible" | "PaisSana" | "PDET";

export interface Retrato {
  id: string;
  fotoUrl: string;
  descripcion: string;
  proyecto: Proyecto;
  lugar: string;
}
