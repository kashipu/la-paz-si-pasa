import { defineMiddleware } from "astro:middleware";

// ponytail: flat cache window for all pages, split per-route if a page needs a different freshness window
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  if (context.request.method === "GET" && response.status === 200) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
    );
  }

  return response;
});
