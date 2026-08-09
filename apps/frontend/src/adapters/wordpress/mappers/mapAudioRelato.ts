import type { AudioRelato } from "../../contracts/AudioRelato";

// ACF esperado: productor, marca, lugar, audio (file), subtitulos, duracion_segundos, orden
export function mapAudioRelato(wpPost: any): AudioRelato {
  const duracion = Number(wpPost.acf?.duracion_segundos);
  const orden = Number(wpPost.acf?.orden);

  return {
    id: String(wpPost.id),
    productor: wpPost.acf?.productor ?? "",
    marca: wpPost.acf?.marca ?? "",
    lugar: wpPost.acf?.lugar ?? "",
    audioUrl: wpPost.acf?.audio?.url ?? "",
    subtitulos: wpPost.acf?.subtitulos ?? "",
    duracionSegundos: Number.isFinite(duracion) && duracion > 0 ? duracion : undefined,
    orden: Number.isFinite(orden) ? orden : undefined,
  };
}
