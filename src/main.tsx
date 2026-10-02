import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/serviceWorkerRegistration';
import { initFontManager } from './utils/fontManager';

// Initialize default typography font
initFontManager();

// Register Service Worker for native web push notifications & offline support
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

