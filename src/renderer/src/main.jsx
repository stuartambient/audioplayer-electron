import React from 'react';
import ReactDOM from 'react-dom/client';
import { AudioPlayerProvider } from './AudioPlayerContext'; // Import the provider
import './assets/index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioPlayerProvider>
      <App />
    </AudioPlayerProvider>
  </React.StrictMode>
);
