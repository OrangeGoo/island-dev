import { pluginConfig } from './plugin-island/config';
import { pluginRoutes } from './plugin-routes';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import PluginReact from '@vitejs/plugin-react';
import { SiteConfig } from 'shared/types';
import { createMdxPlugins } from './plugin-mdx';
import { Plugin } from 'vite';

export function createVitePlugins(
  config: SiteConfig,
  restart?: () => Promise<void>
) {
  return [
    pluginIndexHtml(),
    PluginReact(),
    pluginConfig(config, restart),
    pluginRoutes({
      root: config.root
    }),
    createMdxPlugins()
  ] as Plugin[];
}
