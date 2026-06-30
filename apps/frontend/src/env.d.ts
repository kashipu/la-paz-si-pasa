/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly WORDPRESS_URL: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly WORDPRESS_PREVIEW_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
