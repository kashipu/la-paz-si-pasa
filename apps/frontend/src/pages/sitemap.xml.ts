import type { APIRoute } from "astro";

// El sitio son dos paginas publicas; el resto de secciones son anclas dentro de
// ellas. Mientras eso siga asi no hace falta @astrojs/sitemap: la lista cabe aqui.
// Al agregar una pagina publica nueva, agregarla tambien a esta lista.
const RUTAS = ["/", "/proyectos-destacados"];

export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? new URL(url.origin);
  const urls = RUTAS.map((ruta) => `  <url><loc>${new URL(ruta, base)}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
