import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import CoverSearchAltApp from './components/ChildWindows/coverSearchAltWindow/CoverSearchAltComponent';

ReactDOM.createRoot(document.getElementById('cover-search-alt')).render(
  <React.StrictMode>
    <CoverSearchAltApp />
  </React.StrictMode>
);
