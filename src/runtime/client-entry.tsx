import { createRoot } from 'react-dom/client';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom';
import { initPageData } from './App';
import { DataContext } from './hooks';

async function renderInBrower() {
  const containerEl = document.getElementById('root');
  if (!containerEl) throw new Error('#Error element not found');

  const pageData = await initPageData(location.pathname);

  createRoot(containerEl).render(
    <DataContext.Provider value={pageData}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DataContext.Provider>
  );
}

renderInBrower();
