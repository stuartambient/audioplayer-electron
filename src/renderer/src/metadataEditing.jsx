import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import MetadataEditingApp from './components/ChildWindows/metadataEditingWindow/MetadataEditingComponent';

ReactDOM.createRoot(document.getElementById('metadata-editing')).render(
  <React.StrictMode>
    <MetadataEditingApp />
  </React.StrictMode>
);
