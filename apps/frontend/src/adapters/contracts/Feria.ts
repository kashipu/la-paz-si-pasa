export interface FeriaMedia {
  url: string;
  alt: string;
  tipo: "imagen" | "video";
  /** solo cuando tipo === "video" */
  fuente?: "youtube" | "wordpress";
  thumbnailUrl?: string;
  /** solo cuando tipo === "video": texto bajo el reproductor */
  pie?: string;
}

export interface Feria {
  id: string;
  titulo: string;
  descripcion: string;
  /** hasta 6 fotos */
  galeria: FeriaMedia[];
  /** verticales 9:16, se navegan con flechas; vacío si la feria no tiene video */
  videos: FeriaMedia[];
  orden?: number;
  abiertaPorDefecto?: boolean;
}
