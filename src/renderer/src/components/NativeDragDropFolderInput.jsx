import React, { useState } from 'react';
import { CiLock, CiUnlock } from 'react-icons/ci';

import '../style/NativeDragDropFolderInput.css';

function NativeDragDropFolderInput({ rootDirs, setRootDirs }) {
  const [folders, setFolders] = useState([]);
  const [rootChanges, setRootChanges] = useState([]);

  const handleRootsUpdate = (e) => {
    /*   console.log(rootDirs);
    console.log(folders); */

    console.log(e.target.id);

    const sendRoots = async (roots) => {
      const sentRoots = await window.api.updateRoots(roots);
      if (sentRoots) {
        setRootChanges(sentRoots);
      }
    };

    if (e.target.id === 'roots-update' || e.currentTarget.id === 'roots-update') {
      sendRoots([...rootDirs, ...folders]);
    }
    /*  const allRoots = [...rootDirs, ...folders];
    console.log('allRoots: ', allRoots); */
  };

  const handleOpenFolder = (e) => {
    /* window.api.openAlbumFolder(e.target.id); */
    const folder = e.currentTarget.id;
    window.api.openAlbumFolder(folder);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      const filePaths = Array.from(files).map((file) => {
        console.log('file.path: ', file.path);
        const newPath = file.path.replaceAll('\\', '/');

        return newPath;
      });
      const updatedPaths = filePaths.filter(
        (path) => !rootDirs.includes(path) && !folders.includes(path)
      );
      setFolders((prevFolders) => [...prevFolders, ...updatedPaths]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFolder = (index) => {
    setFolders((prevFolders) => prevFolders.filter((_, i) => i !== index));
  };

  const removeFormerFolder = (folder) => {
    console.log('folder: ', folder);
    setRootDirs((prevRootDirs) => prevRootDirs.filter((dir) => dir !== folder));
  };

  return (
    <div className="roots-form">
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
      <ul className="folder-list">
        {folders.map((folder, index) => (
          <li key={index} className="folder-list--item">
            <span onClick={handleOpenFolder} className="item-name" id={folder}>
              <u>{folder}</u>
            </span>
            <button className="remove-button" onClick={() => removeFolder(index)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <ul className="folder-list">
        {rootDirs.length > 0 ? (
          <li className="folder-list--item title">Current folders:</li>
        ) : (
          <li className="folder-list--item title">No roots folders saved</li>
        )}
        {rootDirs.map((dir, index) => (
          <li key={index} className="folder-list--item">
            <span onClick={handleOpenFolder} className="item-name" id={dir}>
              <u>{dir}</u>
            </span>
            <button className="remove-button" onClick={() => removeFormerFolder(dir)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button className="roots-update" id="roots-update" type="text" onClick={handleRootsUpdate}>
        <span className="text">Update</span>
      </button>
      {rootChanges.length > 0 && (
        <ul className="folder-list results-panel">
          {rootChanges &&
            rootChanges.map((item, i) => (
              <li key={i}>
                {Object.entries(item).map(([key, val]) => (
                  <div key={key}>
                    {key}: {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </div>
                ))}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default NativeDragDropFolderInput;
