import { cached } from "./cache";
import { wpApiFetch } from "./client";
import type { SiteSettings } from "./types";

export function getSiteSettings() {
  return cached("site-settings", () => wpApiFetch<SiteSettings>("headless/v1/site"));
}
