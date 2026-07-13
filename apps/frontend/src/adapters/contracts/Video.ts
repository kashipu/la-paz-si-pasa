import type { Proyecto } from "./Retrato";

export interface Video {
  id: string;
  titulo: string;
  descripcion: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  tags: Proyecto[];
}
