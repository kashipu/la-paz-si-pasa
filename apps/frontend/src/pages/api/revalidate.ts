import type { APIRoute } from "astro";
import { clearPageCache } from "../../lib/pageCache";

export const prerender = false;

export const POST: APIRoute = ({ request }) => {
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  clearPageCache();

  return new Response(JSON.stringify({ purged: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
