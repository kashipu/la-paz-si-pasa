import { wpFetch, wpFetchAll } from "./client";
import type { WpPost } from "./types";

const POST_LIST_FIELDS = "id,slug,date,modified,link,title,excerpt,featured_media";
const POST_DETAIL_FIELDS = "id,slug,date,modified,link,title,excerpt,content,featured_media,headless_blocks";

export function getPosts() {
  return wpFetchAll<WpPost>("posts", {
    _fields: POST_LIST_FIELDS,
  });
}

export async function getPostBySlug(slug: string) {
  const posts = await wpFetch<WpPost[]>("posts", {
    slug,
    _fields: POST_DETAIL_FIELDS,
  });

  return posts[0] ?? null;
}
