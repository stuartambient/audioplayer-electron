import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import TagFormApp from './components/ChildWindows/tagForm/TagFormComponent';

ReactDOM.createRoot(document.getElementById('tag-form')).render(
  <React.StrictMode>
    <TagFormApp />
  </React.StrictMode>
);
