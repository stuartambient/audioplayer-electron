import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import App from './App';
import { AudioContextProvider } from './context/AudioRefContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioContextProvider>
      <App />
    </AudioContextProvider>
  </React.StrictMode>
);
