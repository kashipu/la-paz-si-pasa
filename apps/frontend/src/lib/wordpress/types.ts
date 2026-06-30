export type WpRendered = {
  rendered: string;
};

export type WpMedia = {
  id: number;
  source_url: string;
  alt_text: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
};

export type WpBlock = {
  name: string;
  attrs: Record<string, unknown>;
  innerHTML: string;
  innerBlocks: WpBlock[];
};

export type WpPost = {
  id: number;
  slug: string;
  date: string;
  modified: string;
  link: string;
  title: WpRendered;
  excerpt?: WpRendered;
  content?: WpRendered;
  featured_media?: number;
  headless_blocks?: WpBlock[];
};

export type MenuItem = {
  id: number;
  label: string;
  url: string;
  parentId: number;
  order: number;
  target?: string;
};

export type SiteSettings = {
  name: string;
  description: string;
  logo: null | {
    id: number;
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  menus: {
    primary: MenuItem[];
    footer: MenuItem[];
  };
  tokens: {
    colors: {
      brand: string;
      accent: string;
      surface: string;
      text: string;
    };
  };
};
