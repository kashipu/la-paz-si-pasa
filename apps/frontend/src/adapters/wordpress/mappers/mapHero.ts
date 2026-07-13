import type { HeroData } from "../../contracts/Hero";

export function mapHero(wpPage: any): HeroData {
  return {
    imageUrl: wpPage?.acf?.hero_imagen?.url ?? "",
    imageAlt: wpPage?.acf?.hero_imagen?.alt ?? "",
  };
}
