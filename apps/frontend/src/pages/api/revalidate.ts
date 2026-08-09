import type { APIRoute } from "astro";
import { clearPageCache } from "../../lib/pageCache";

export const prerender = false;

export const POST: APIRoute = ({ request }) => {
  const secret = request.headers.get("x-revalidate-secret");
  // process.env: variable del contenedor en producción. import.meta.env: .env local en desarrollo.
  const expected = process.env.REVALIDATE_SECRET ?? import.meta.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  clearPageCache();

  return new Response(JSON.stringify({ purged: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
