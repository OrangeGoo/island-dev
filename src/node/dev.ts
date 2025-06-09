import { createServer } from 'vite';
import { pluginIndexHtml } from './plugin-island/indexHtml';
import PluginReact from '@vitejs/plugin-react';
import { PACKAGE_ROOT } from './constants';
import { resloveConfig } from './config';

export async function createDevServer(root: string) {
  const config = await resloveConfig(root, 'serve', 'development');
  console.log(config);

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
