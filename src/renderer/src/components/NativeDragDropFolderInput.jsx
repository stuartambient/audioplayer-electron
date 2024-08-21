import React, { useState } from 'react';

function NativeDragDropFolderInput() {
  const [folders, setFolders] = useState([]);

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      const filePaths = Array.from(files).map((file) => file.path);
      setFolders((prevFolders) => [...prevFolders, ...filePaths]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFolder = (index) => {
    setFolders((prevFolders) => prevFolders.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3>Drag and Drop Folders</h3>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Drop folders here
      </div>
      <ul>
        {folders.map((folder, index) => (
          <li key={index}>
            {folder} <button onClick={() => removeFolder(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NativeDragDropFolderInput;
