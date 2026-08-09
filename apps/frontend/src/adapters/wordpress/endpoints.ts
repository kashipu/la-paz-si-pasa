// Rutas REST de los CPT en WordPress. Deben coincidir con "rest_base" en apps/wordpress/scf-json/post_type_*.json
export const endpoints = {
  retratos: "retrato",
  subcuentas: "subcuenta",
  noticias: "noticia",
  videos: "video",
  audioRelatos: "audio-relato",
  ferias: "feria",
  hero: "pages", // la configuración de home vive en la página con slug=home
} as const;
