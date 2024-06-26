import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import CoverSearchApp from './components/ChildWindows/coverSearchWindow/CoverSearchComponent';

ReactDOM.createRoot(document.getElementById('cover-search')).render(
  <React.StrictMode>
    <CoverSearchApp />
  </React.StrictMode>
);
