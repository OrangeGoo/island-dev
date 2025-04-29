import { createServer } from 'vite';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import PluginReact from '@vitejs/plugin-react';

export function createDevServer(root: string) {
  return createServer({
    root,
    plugins: [pluginIndexHtml(), PluginReact()]
  });
}
