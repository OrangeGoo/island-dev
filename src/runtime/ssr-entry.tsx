import { App, initPageData } from './App';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { DataContext } from './hooks';
import { HelmetProvider } from 'react-helmet-async';
export interface RenderResult {
  appHtml: string;
  islandToPathMap: Record<string, string>;
  islandProps: unknown[];
}

export async function render(pagePath: string, helmetContext: object) {
  const pageData = await initPageData(pagePath);
  const { clearIslandData, data } = await import('./jsx-runtime');

  clearIslandData();

  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <DataContext.Provider value={pageData}>
        <StaticRouter location={pagePath}>
          <App />
        </StaticRouter>
      </DataContext.Provider>
    </HelmetProvider>
  );

  const { islandToPathMap, islandProps } = data;
  return {
    appHtml,
    islandToPathMap,
    islandProps
  };
}

export { routes } from 'island:routes';
