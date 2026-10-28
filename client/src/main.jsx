import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/figtree';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'lenis/dist/lenis.css';
import './index.css';
import './floema.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
