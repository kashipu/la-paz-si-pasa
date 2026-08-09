import { defineMiddleware } from "astro:middleware";
import { getCachedPage, setCachedPage } from "./lib/pageCache";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // En desarrollo nunca se cachea: al editar en WordPress el cambio debe verse al recargar.
  if (
    import.meta.env.DEV ||
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_")
  ) {
    return next();
  }

  const cacheKey = `${url.pathname}${url.search}`;
  const cached = getCachedPage(cacheKey);
  if (cached) {
    return new Response(cached.body, { status: cached.status, headers: cached.headers });
  }

  const response = await next();

  if (response.status === 200) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
    );
    setCachedPage(cacheKey, {
      body: await response.clone().text(),
      status: response.status,
      headers: [...response.headers.entries()].filter(([name]) => name.toLowerCase() !== "set-cookie"),
    });
  }

  return response;
});
