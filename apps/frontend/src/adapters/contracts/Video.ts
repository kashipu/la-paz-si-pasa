export interface Video {
  id: string;
  titulo: string;
  descripcion: string;
  fuente: "youtube" | "wordpress";
  /** youtube: URL de embed (youtube-nocookie.com/embed/{id}); wordpress: URL del MP4 en WP media */
  videoUrl: string;
  thumbnailUrl: string;
  /** Términos de taxonomía en WP (1-2 por video) */
  tags: string[];
}
