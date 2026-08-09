import type { HeroData } from "./Hero";

/** Contenido de la página WordPress con slug "home" que no justifica un CPT propio. */
export interface HomeConfig {
  hero: HeroData;
  /** destino del banner "Más noticias del fondo" */
  noticiasCtaUrl: string;
}
