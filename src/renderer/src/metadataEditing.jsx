import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import MetadataEditingApp from './components/ChildWindows/metadataEditingWindow/MetadataEditingComponent';
import { AudioProvider } from './components/table/AudioContext';

ReactDOM.createRoot(document.getElementById('metadata-editing')).render(
  <React.StrictMode>
    <AudioProvider>
      <MetadataEditingApp />
    </AudioProvider>
  </React.StrictMode>
);
