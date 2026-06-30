const WP_URL = import.meta.env.WORDPRESS_URL;

if (!WP_URL) {
  throw new Error("WORDPRESS_URL is required");
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

function appendParams(url: URL, params: QueryParams) {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
}

export async function wpApiFetch<T>(
  apiPath: string,
  params: QueryParams = {},
): Promise<T> {
  const normalizedPath = apiPath.replace(/^\/?wp-json\//, "").replace(/^\//, "");
  const url = new URL(`/wp-json/${normalizedPath}`, WP_URL);
  appendParams(url, params);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`WordPress request failed: ${response.status} ${url.toString()}`);
  }

  return response.json() as Promise<T>;
}

export function wpFetch<T>(path: string, params: QueryParams = {}) {
  return wpApiFetch<T>(`wp/v2/${path.replace(/^\//, "")}`, params);
}

type WpListResult<T> = {
  items: T[];
  totalPages: number;
};

export async function wpFetchList<T>(
  path: string,
  params: QueryParams = {},
): Promise<WpListResult<T>> {
  const normalizedPath = path.replace(/^\//, "");
  const url = new URL(`/wp-json/wp/v2/${normalizedPath}`, WP_URL);
  appendParams(url, { per_page: 100, ...params });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`WordPress list request failed: ${response.status} ${url.toString()}`);
  }

  return {
    items: (await response.json()) as T[],
    totalPages: Number(response.headers.get("X-WP-TotalPages") ?? "1"),
  };
}

export async function wpFetchAll<T>(path: string, params: QueryParams = {}) {
  const firstPage = await wpFetchList<T>(path, params);
  const pages = [firstPage.items];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const nextPage = await wpFetchList<T>(path, { ...params, page });
    pages.push(nextPage.items);
  }

  return pages.flat();
}
