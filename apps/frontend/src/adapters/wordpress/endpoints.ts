// Rutas REST de los CPT en WordPress (pendiente confirmar con el equipo — sección 10 de docs/context.md)
export const endpoints = {
  retratos: "retrato",
  subcuentas: "subcuenta",
  noticias: "noticia",
  videos: "video",
  hero: "pages", // el hero vive en la página home (slug=home)
} as const;
