import type { HomeConfig } from "../../contracts/Home";

// ACF esperado en la página con slug "home": hero_imagen (image array), noticias_cta_url (url)
export function mapHome(wpPage: any): HomeConfig {
  return {
    hero: {
      imageUrl: wpPage?.acf?.hero_imagen?.url ?? "",
      imageAlt: wpPage?.acf?.hero_imagen?.alt ?? "",
    },
    noticiasCtaUrl: wpPage?.acf?.noticias_cta_url ?? "",
  };
}
