import { usePageData } from '@runtime';
import { useLocation } from 'react-router-dom';
import { SidebarItem } from 'shared/types';

export function usePrevNextPage() {
  const { siteData } = usePageData();
  const sidebar = siteData.themeConfig?.sidebar || {};
  const { pathname } = useLocation();
  const flattenTitle: SidebarItem[] = [];

  Object.keys(sidebar).forEach((key) => {
    const groups = sidebar[key] || [];

    groups.forEach((group) => {
      group.items.forEach((item) => {
        flattenTitle.push(item);
      });
    });
  });

  const pageIndex = flattenTitle.findIndex((item) => item.link === pathname);
  const prevPage = flattenTitle[pageIndex - 1] || null;
  const nextPage = flattenTitle[pageIndex + 1] || null;

  return {
    prevPage,
    nextPage
  };
}
