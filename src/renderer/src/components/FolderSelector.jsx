import React, { useState } from 'react';

function FolderSelector() {
  const [folderPath, setFolderPath] = useState('');

  const selectFolder = async () => {
    const selectedFolder = await window.api.selectFolder();
    if (selectedFolder) {
      setFolderPath(selectedFolder);
    }
  };

  return (
    <div>
      <h3>Select a Folder</h3>
      <button onClick={selectFolder}>Choose Folder</button>
      {folderPath && <p>Selected Folder: {folderPath}</p>}
      <input
        type="text"
        value={folderPath}
        placeholder="Or enter folder path"
        onChange={(e) => setFolderPath(e.target.value)}
      />
    </div>
  );
}

export default FolderSelector;
