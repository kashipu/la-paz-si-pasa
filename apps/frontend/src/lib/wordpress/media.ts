import { cached } from "./cache";
import { wpFetch } from "./client";
import type { WpMedia } from "./types";

export function getMediaById(id: number) {
  return cached(`media-${id}`, () =>
    wpFetch<WpMedia>(`media/${id}`, {
      _fields: "id,source_url,alt_text,media_details",
    }),
  );
}
