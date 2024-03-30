import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import metadataPanelApp from './metadataPanelApp';

ReactDOM.createRoot(document.getElementById('list')).render(
  <React.StrictMode>
    <metadataPanelApp />
  </React.StrictMode>
);
