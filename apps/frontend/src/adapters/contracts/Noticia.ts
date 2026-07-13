export interface Noticia {
  id: string;
  titulo: string;
  url: string;
  fecha: string; // ISO date, para ordenar/agrupar por año
}
