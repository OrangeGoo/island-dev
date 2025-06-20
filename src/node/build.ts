import { InlineConfig, build as viteBuild } from 'vite';
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from './constants';
import path = require('path');
import type { RollupOutput } from 'rollup';
import PluginReact from '@vitejs/plugin-react';
import fs from 'fs-extra';
import ora from 'ora';
import { SiteConfig } from 'shared/types';
import { pluginConfig } from './plugin-island/config';

export async function bundle(
  root: string,
  config: SiteConfig
): Promise<[any, any]> {
  try {
    const resolveViteConfig = (isServer: boolean): InlineConfig => {
      return {
        mode: 'production',
        root,
        plugins: [PluginReact(), pluginConfig(config)],
        ssr: {
          noExternal: ['react-router-dom']
        },
        build: {
          ssr: isServer,
          outDir: isServer ? '.temp' : 'build',
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
      return viteBuild(resolveViteConfig(false));
    };

    const serverBuild = async () => {
      return viteBuild(resolveViteConfig(true));
    };

    const spinner = ora();

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
  render: () => string,
  root: string,
  clientBundle: RollupOutput
) {
  const appHtml = render();
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  );
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
  await fs.writeFile(path.join(root, 'build', 'index.html'), html);
  await fs.remove(path.join(root, '.temp'));
}

export async function build(root: string, config: SiteConfig) {
  // 1. bundle client + server
  const [clientBundle, serverBundle] = await bundle(root, config);
  // 2. 引入server-entry
  const serverEntryPath = path.resolve(root, '.temp', 'ssr-entry.js');
  // 3. 服务端渲染，产出html
  const { render } = await import(serverEntryPath);
  await renderPage(render, root, clientBundle as RollupOutput);
}
