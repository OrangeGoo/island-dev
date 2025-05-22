import { createServer } from 'vite';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import PluginReact from '@vitejs/plugin-react';
import { PACKAGE_ROOT } from './constants';

export function createDevServer(root: string) {
  return createServer({
    root,
    plugins: [pluginIndexHtml(), PluginReact()],
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
