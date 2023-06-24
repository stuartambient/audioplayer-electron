import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import ListApp from './ListApp';

ReactDOM.createRoot(document.getElementById('list')).render(
  <React.StrictMode>
    <ListApp />
  </React.StrictMode>
);
