export interface FeriaMedia {
  url: string;
  alt: string;
  tipo: "imagen" | "video";
  /** solo cuando tipo === "video" */
  fuente?: "youtube" | "wordpress";
  thumbnailUrl?: string;
}

export interface Feria {
  id: string;
  titulo: string;
  descripcion: string;
  /** hasta 6 fotos */
  galeria: FeriaMedia[];
  /** vertical 9:16, opcional */
  video?: FeriaMedia;
  orden?: number;
  abiertaPorDefecto?: boolean;
}
