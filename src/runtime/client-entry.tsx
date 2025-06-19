import { createRoot } from 'react-dom/client';
import { App } from './App';
import siteData from 'island:site-data';

function renderInBrower() {
  console.log(siteData);
  const containerEl = document.getElementById('root');
  if (!containerEl) throw new Error('#Error element not found');
  createRoot(containerEl).render(<App />);
}

renderInBrower();
