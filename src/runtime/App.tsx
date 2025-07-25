import { Layout } from '../theme-default';
import { routes } from 'island:routes';
import { Route } from 'node/plugin-routes';
import { matchRoutes } from 'react-router-dom';
import { PageData } from 'shared/types';
import siteData from 'island:site-data';

export async function initPageData(routePath: string): Promise<PageData> {
  const matched = matchRoutes(routes, routePath);

  if (matched) {
    const route = matched[0].route as Route;

    const moduleInfo = await route.preload();
    console.log(moduleInfo);
    return {
      pageType: 'doc',
      siteData: siteData,
      frontmatter: moduleInfo.frontmatter,
      pagePath: routePath
    };
  }

  return {
    pageType: '404',
    siteData,
    pagePath: routePath,
    frontmatter: {}
  };
}

export function App() {
  return <Layout />;
}
