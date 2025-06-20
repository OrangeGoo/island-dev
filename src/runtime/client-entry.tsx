import { createRoot } from 'react-dom/client';
import { App } from './App';
import { BrowserRouter } from 'react-router-dom';

function renderInBrower() {
  const containerEl = document.getElementById('root');
  if (!containerEl) throw new Error('#Error element not found');
  createRoot(containerEl).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

renderInBrower();
