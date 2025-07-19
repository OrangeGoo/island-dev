import { createServer, PluginOption } from 'vite';
import { PACKAGE_ROOT } from './constants';
import { resolveConfig } from './config';
import { createVitePlugins } from './vitePlugins';
import { Plugin } from 'vite';

export async function createDevServer(
  root: string,
  restart: () => Promise<void>
) {
  const config = await resolveConfig(root, 'serve', 'development');
  console.log(config.siteData);
  return createServer({
    root: PACKAGE_ROOT,
    plugins: await createVitePlugins(config, restart),
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
