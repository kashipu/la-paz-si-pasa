import { wpFetch, wpFetchAll } from "./client";
import type { WpPost } from "./types";

const PAGE_LIST_FIELDS = "id,slug,date,modified,link,title";
const PAGE_DETAIL_FIELDS = "id,slug,date,modified,link,title,content,featured_media,headless_blocks";

export function getPages() {
  return wpFetchAll<WpPost>("pages", {
    _fields: PAGE_LIST_FIELDS,
  });
}

export async function getPageBySlug(slug: string) {
  const pages = await wpFetch<WpPost[]>("pages", {
    slug,
    _fields: PAGE_DETAIL_FIELDS,
  });

  return pages[0] ?? null;
}
