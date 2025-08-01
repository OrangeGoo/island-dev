import { App, initPageData } from './App';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { DataContext } from './hooks';

export interface RenderResult {
  appHtml: string;
  islandToPathMap: Record<string, string>;
  islandProps: unknown[];
}

export async function render(pagePath: string) {
  const pageData = await initPageData(pagePath);
  const { clearIslandData, data } = await import('./jsx-runtime');
  const { islandToPathMap, islandProps } = data;
  clearIslandData();
  const appHtml = renderToString(
    <DataContext.Provider value={pageData}>
      <StaticRouter location={pagePath}>
        <App />
      </StaticRouter>
    </DataContext.Provider>
  );
  return {
    appHtml,
    islandToPathMap,
    islandProps
  };
}

export { routes } from 'island:routes';
