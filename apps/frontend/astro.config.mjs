import { defineConfig } from "astro/config";
import node from "@astrojs/node";

function hostname(value) {
  if (!value) return undefined;
  try {
    return new URL(value).hostname;
  } catch {
    return value.trim() || undefined;
  }
}

const imageDomains = [
  "cms.lapazsipasa.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "i.ytimg.com",
  "img.youtube.com",
  hostname(process.env.WORDPRESS_URL),
  ...(process.env.WORDPRESS_IMAGE_DOMAINS ?? "").split(",").map(hostname),
].filter(Boolean);

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: process.env.PUBLIC_SITE_URL,
  image: { domains: [...new Set(imageDomains)] },
});
