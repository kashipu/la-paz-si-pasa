// WordPress genera varios tamanos al subir una imagen. El campo `.url` de ACF es
// siempre el original: en las fotos del CMS eso son 1920x1280 y ~600 KB, mientras
// que al lado ya existe un 1536x1024 de ~237 KB. El navegador no ve la diferencia
// (astro:assets redimensiona antes de servir), pero el servidor si: cada
// transformacion en frio se baja el archivo entero del CMS y lo pasa por sharp.
//
// El tope de WordPress al subir esta en 1500 (ver headless-core.php), asi que las
// imagenes nuevas ya entran por debajo de 1536 y este helper devuelve su original.
const TAMANO_PREFERIDO = "1536x1536";

/** URL de una imagen de ACF, prefiriendo el tamano intermedio sobre el original. */
export function imagenUrl(campo: any): string {
  return campo?.sizes?.[TAMANO_PREFERIDO] ?? campo?.url ?? "";
}
