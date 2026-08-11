import type { HomeConfig } from "../../contracts/Home";
import { imagenUrl } from "./imagen.ts";

// ACF esperado en la página con slug "home": hero_imagen (image array), noticias_cta_url (url)
export function mapHome(wpPage: any): HomeConfig {
  return {
    hero: {
      imageUrl: imagenUrl(wpPage?.acf?.hero_imagen),
      imageAlt: wpPage?.acf?.hero_imagen?.alt ?? "",
    },
    noticiasCtaUrl: wpPage?.acf?.noticias_cta_url ?? "",
  };
}
