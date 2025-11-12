import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';  // ✅ import Router
import { store } from './store/store';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter> {/* ✅ wrap App inside Router */}
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
