import { UserConfig as ViteConfiguration } from 'vite';

export type NavItemWithLink = {
  text: string;
  link: string;
};

export interface SidebarGroup {
  text?: string;
  items: SidebarItem[];
}

export type SidebarItem = {
  text: string;
  link: string;
};

export interface SideBar {
  [path: string]: SidebarGroup[];
}

export interface Footer {
  message: string;
}

export interface ThemeConfig {
  nav?: NavItemWithLink[];
  sidebar?: SideBar;
  footer?: Footer;
}

export interface UserConfig {
  title?: string;
  description?: string;
  themeConfig?: ThemeConfig;
  vite?: ViteConfiguration;
}

export interface SiteConfig {
  root: string;
  configPath: string;
  siteData: UserConfig;
}

export type PageType = 'home' | 'doc' | 'custom' | '404';

export interface Feature {
  title: string;
  details: string;
  icon: string;
}

export interface Hero {
  name: string;
  text: string;
  tagline: string;
  image?: {
    src: string;
    alt: string;
  };
  actions: {
    text: string;
    link: string;
    theme: 'brand' | 'alt';
  }[];
}

export interface FrontMatter {
  title?: string;
  description?: string;
  pageType?: PageType;
  sidebar?: boolean;
  outline?: boolean;
  features?: Feature[];
  hero?: Hero;
}

export interface Header {
  id: string;
  text: string;
  depth: number;
}
export interface PageData {
  siteData: UserConfig;
  pagePath: string;
  pageType: PageType;
  frontmatter: FrontMatter;
  toc?: Header[];
}

export interface PageModule {
  default: React.ComponentType;
  frontmatter: FrontMatter;
  toc?: Header[];
  [key: string]: unknown;
}

export type PropsWithIsland = {
  __island?: boolean;
};
