export interface AudioRelato {
  id: string;
  productor: string;
  marca: string;
  lugar: string;
  /** MP3 en media de WordPress */
  audioUrl: string;
  subtitulos: string;
  /** Si falta, el reproductor la lee del propio archivo al cargar metadata */
  duracionSegundos?: number;
  orden?: number;
}
