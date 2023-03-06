import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import ChildApp from './ChildApp';

ReactDOM.createRoot(document.getElementById('child')).render(
  <React.StrictMode>
    <ChildApp />
  </React.StrictMode>
);
