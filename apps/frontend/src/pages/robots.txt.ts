import type { APIRoute } from "astro";

// Con output:"server" no hay archivos estaticos generados en el build, asi que
// robots.txt y sitemap.xml se sirven como endpoints para poder resolver el
// dominio real desde Astro.site (PUBLIC_SITE_URL) en vez de dejarlo escrito a mano.
export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? new URL(url.origin);
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${new URL("/sitemap.xml", base)}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
