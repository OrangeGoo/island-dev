import { pluginConfig } from './plugin-island/config';
import { pluginRoutes } from './plugin-routes';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import PluginReact from '@vitejs/plugin-react';
import { SiteConfig } from 'shared/types';
import { createMdxPlugins } from './plugin-mdx';
import { Plugin } from 'vite';
import pluginUnoCSS from 'unocss/vite';
import unocssOptions from './unocssOptions';
import { PACKAGE_ROOT } from './constants';
import path from 'path';
import babelPluginIsland from './babel-plugin-island';

export async function createVitePlugins(
  config: SiteConfig,
  restart?: () => Promise<void>,
  isSSR = false
) {
  return [
    pluginUnoCSS(unocssOptions),
    pluginIndexHtml(),
    PluginReact({
      jsxRuntime: 'automatic',
      jsxImportSource: isSSR
        ? path.join(PACKAGE_ROOT, 'src', 'runtime')
        : 'react',
      babel: {
        plugins: [babelPluginIsland]
      }
    }),
    pluginConfig(config, restart),
    pluginRoutes({
      root: config.root,
      isSSR
    }),
    await createMdxPlugins()
  ] as Plugin[];
}
