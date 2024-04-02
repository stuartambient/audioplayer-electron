import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import CoverSearchApp from './CoverSearchWindow/CoverSearchComponent';

ReactDOM.createRoot(document.getElementById('cover-search')).render(
  <React.StrictMode>
    <CoverSearchApp />
  </React.StrictMode>
);
