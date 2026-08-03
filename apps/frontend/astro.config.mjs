import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import { loadEnv } from "vite";

const env = { ...loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), ""), ...process.env };

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
  hostname(env.WORDPRESS_URL),
  ...(env.WORDPRESS_IMAGE_DOMAINS ?? "").split(",").map(hostname),
].filter(Boolean);

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: env.PUBLIC_SITE_URL,
  image: { domains: [...new Set(imageDomains)] },
});
