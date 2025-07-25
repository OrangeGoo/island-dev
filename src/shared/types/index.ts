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
export interface FrontMatter {
  title?: string;
  description?: string;
  pageType?: PageType;
  sidebar?: boolean;
  outline?: boolean;
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
  [key: string]: unknown;
}
