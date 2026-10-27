import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/100.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
