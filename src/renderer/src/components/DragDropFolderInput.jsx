import React, { useState } from 'react';

function DragDropFolderInput() {
  const [folderPath, setFolderPath] = useState('');

  const handleDrop = async (event) => {
    event.preventDefault();
    const items = event.dataTransfer.items;

    if (items && items.length > 0) {
      const item = items[0].webkitGetAsEntry();
      console.log('item: ', item);
      if (item && item.isDirectory) {
        const folderName = item.name; // or any other method to get the full path
        const fullPath = await window.api.getFolderPath(folderName);
        setFolderPath(fullPath);
      } else {
        console.error('Not a directory');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div>
      <h3>Drag and Drop Folder</h3>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        {folderPath ? folderPath : 'Drop a folder here'}
      </div>
      <input
        type="text"
        value={folderPath}
        placeholder="Or enter folder path"
        onChange={(e) => setFolderPath(e.target.value)}
      />
    </div>
  );
}

export default DragDropFolderInput;
