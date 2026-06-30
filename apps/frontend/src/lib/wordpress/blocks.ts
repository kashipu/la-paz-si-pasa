import CtaBlock from "@components/blocks/CtaBlock.astro";
import FeatureGridBlock from "@components/blocks/FeatureGridBlock.astro";
import HeroBlock from "@components/blocks/HeroBlock.astro";

export const blockRegistry = {
  "headless/hero": HeroBlock,
  "headless/feature-grid": FeatureGridBlock,
  "headless/cta": CtaBlock,
} as const;

export type KnownBlockName = keyof typeof blockRegistry;

export function isKnownBlock(name: string): name is KnownBlockName {
  return name in blockRegistry;
}
