import fastGlob from 'fast-glob';
import path from 'path';
import { normalizePath } from 'vite';

interface RouteData {
  routePath: string;
  absolutePath: string;
}

export class RouteService {
  #ScanDir: string;
  #routeData: RouteData[] = [];
  constructor(scanDir: string) {
    this.#ScanDir = scanDir;
  }

  async init() {
    const files = fastGlob
      .sync(['**/*.{js,jsx,ts,tsx,md,mdx}'], {
        cwd: this.#ScanDir,
        absolute: true,
        ignore: [
          '**/build/**',
          '../.island/**',
          '**/node_modules/**',
          'config.ts'
        ]
      })
      .sort();
    files.forEach((file) => {
      const fileRelativePath = normalizePath(
        path.relative(this.#ScanDir, file)
      );
      // 路由路径
      const routePath = this.normalizeRoutePath(fileRelativePath);
      this.#routeData.push({
        routePath,
        absolutePath: file
      });
    });
  }

  getRouteMeta(): RouteData[] {
    return this.#routeData;
  }

  normalizeRoutePath(raw: string) {
    const routePath = raw.replace(/\.(.*)?$/, '').replace(/index$/, '');
    return routePath.startsWith('/') ? routePath : `/${routePath}`;
  }

  generateRoutesCode(ssr: boolean) {
    return `
import React from 'react';
${ssr ? '' : 'import loadable from "@loadable/component";'}
${this.#routeData
  .map((route, index) => {
    return ssr
      ? `import Route${index} from '${route.absolutePath}';`
      : `const Route${index} = loadable(() => import('${route.absolutePath}'));`;
  })
  .join('\n')}
export const routes = [
  ${this.#routeData
    .map((route, index) => {
      return `{ path: '${route.routePath}', element: React.createElement(Route${index}), preload: () => import('${route.absolutePath}') }`;
    })
    .join(',\n')}
];
`;
  }
}
