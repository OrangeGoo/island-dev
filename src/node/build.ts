import { InlineConfig, build as viteBuild } from 'vite';
import {
  CLIENT_ENTRY_PATH,
  MASK_SPLITTER,
  PACKAGE_ROOT,
  SERVER_ENTRY_PATH
} from './constants';
import path from 'path';
import type { RollupOutput } from 'rollup';
import fs from 'fs-extra';
// import ora from 'ora';
import { SiteConfig } from 'shared/types';
import { createVitePlugins } from './vitePlugins';
import { Route } from './plugin-routes';
import { RenderResult } from '../runtime/ssr-entry';
import { EXTERNALS } from './constants';
import { HelmetData } from 'react-helmet-async';

const CLIENT_OUTPUT = 'build';

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
            : path.join(root, CLIENT_OUTPUT),
          rollupOptions: {
            input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
            output: {
              format: isServer ? 'cjs' : 'esm'
            },
            external: EXTERNALS
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

    const publicDir = path.join(root, 'public');
    if (fs.existsSync(publicDir)) {
      await fs.copy(publicDir, path.join(root, CLIENT_OUTPUT));
    }
    await fs.copy(
      path.join(PACKAGE_ROOT, 'vendors'),
      path.join(root, CLIENT_OUTPUT)
    );
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}

async function buildIslands(
  root: string,
  islandToPathMap: Record<string, string>
) {
  // { Aside: 'xxx'}
  // 内容
  // import { Aside } from 'xxx'
  // window.ISLAND = { Aside }
  // window.ISLAND_PROPS = Json.parse(
  //  document.getElementById('island-props').textContent;
  // )
  const islandInjectCode = `${Object.entries(islandToPathMap)
    .map(
      ([islandName, islandPath]) =>
        `import { ${islandName} } from '${islandPath}';`
    )
    .join('')}
  window.ISLANDS = { ${Object.keys(islandToPathMap).join(', ')} };
  window.ISLAND_PROPS = JSON.parse(
    document.getElementById('island-props').textContent
  );
  `;

  const injectId = 'island:inject';
  return viteBuild({
    mode: 'production',
    esbuild: {
      jsx: 'automatic'
    },
    build: {
      outDir: path.join(root, '.temp'),
      rollupOptions: {
        input: injectId,
        external: EXTERNALS
      }
    },
    plugins: [
      {
        name: 'island:inject',
        enforce: 'post',
        resolveId(id) {
          if (id.includes(MASK_SPLITTER)) {
            const [originId, importer] = id.split(MASK_SPLITTER);
            return this.resolve(originId, importer, { skipSelf: true });
          }
          if (id === injectId) {
            return id;
          }
        },
        load(id) {
          if (id === injectId) {
            return islandInjectCode;
          }
        },
        generateBundle(_, bundle) {
          for (const name in bundle) {
            if (bundle[name].type === 'asset') {
              delete bundle[name];
            }
          }
        }
      }
    ]
  });
}

export async function renderPage(
  render: (pagePath: string, helmetContext: object) => RenderResult,
  root: string,
  clientBundle: RollupOutput,
  routes: Route[]
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  );
  await Promise.all(
    [...routes, { path: '/404' }].map(async (route) => {
      const routePath = route.path;
      const helmetContext = {
        context: {}
      } as HelmetData;
      const {
        appHtml,
        islandToPathMap,
        islandProps = []
      } = await render(routePath, helmetContext.context);
      const styleAssets = clientBundle.output.filter(
        (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
      );
      const islandsBundle = await buildIslands(root, islandToPathMap);
      const islandsCode = (islandsBundle as RollupOutput).output[0].code;
      const { helmet } = helmetContext.context;
      const normalizeVendorFilename = (name: string) => {
        const normalizedName = name.replace(/\//g, '_');
        return `${normalizedName}.js`;
      };
      const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${helmet.title.toString() || ''}
        ${helmet.meta.toString() || ''}
        ${helmet.link.toString() || ''}
        ${helmet.style.toString() || ''}
        <meta name="description" content="xxx">
        ${styleAssets
          .map((asset) => `<link rel="stylesheet" href="/${asset.fileName}">`)
          .join('\n')}
        <script type="importmap">
          {
            "imports": {
              ${EXTERNALS.map(
                (name) => `"${name}": "/${normalizeVendorFilename(name)}"`
              ).join(',')}
            }
          }
        </script>
      </head>
      <body>
        <div id="root">${appHtml}</div>
        <script type="module">${islandsCode}</script>
        <script type="module" src="/${clientChunk.fileName}"></script>
        <script id="island-props">${JSON.stringify(islandProps)}</script>
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
