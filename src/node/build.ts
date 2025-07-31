import { InlineConfig, build as viteBuild } from 'vite';
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from './constants';
import path from 'path';
import type { RollupOutput } from 'rollup';
import fs from 'fs-extra';
// import ora from 'ora';
import { SiteConfig } from 'shared/types';
import { createVitePlugins } from './vitePlugins';
import { Route } from './plugin-routes';

export async function bundle(
  root: string,
  config: SiteConfig
): Promise<[any, any]> {
  try {
    const resolveViteConfig = async (
      isServer: boolean
    ): Promise<InlineConfig> => {
      return {
        mode: 'production',
        root,
        plugins: await createVitePlugins(config, undefined, isServer),
        ssr: {
          noExternal: ['react-router-dom', 'lodash-es']
        },
        build: {
          ssr: isServer,
          outDir: isServer
            ? path.join(root, '.temp')
            : path.join(root, 'build'),
          rollupOptions: {
            input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
            output: {
              format: isServer ? 'cjs' : 'esm'
            }
          }
        }
      };
    };

    const clientBuild = async () => {
      return viteBuild(await resolveViteConfig(false));
    };

    const serverBuild = async () => {
      return viteBuild(await resolveViteConfig(true));
    };

    const [clientBundle, serverBundle] = await Promise.all([
      clientBuild(),
      serverBuild()
    ]);
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}

export async function renderPage(
  render: (pagePath: string) => string,
  root: string,
  clientBundle: RollupOutput,
  routes: Route[]
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  );
  await Promise.all(
    routes.map(async (route) => {
      const routePath = route.path;
      const appHtml = await render(routePath);
      const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
      </head>
      <body>
        <div id="root">${appHtml}</div>
        <script type="module" src="/${clientChunk.fileName}"></script>
      </body>
    </html>
    `.trim();
      const fileName = routePath.endsWith('/')
        ? `${routePath}index.html`
        : `${routePath}.html`;
      await fs.ensureDir(path.join(root, 'build', path.dirname(fileName)));
      await fs.writeFile(path.join(root, 'build', fileName), html);
    })
  );
  await fs.remove(path.join(root, '.temp'));
}

export async function build(root: string, config: SiteConfig) {
  // 1. bundle client + server
  const [clientBundle] = await bundle(root, config);
  // 2. 引入server-entry
  const serverEntryPath = path.resolve(root, '.temp', 'ssr-entry.js');
  // 3. 服务端渲染，产出html
  const { render, routes } = await import(serverEntryPath);
  await renderPage(render, root, clientBundle as RollupOutput, routes);
}
