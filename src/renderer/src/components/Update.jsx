import { useState, useEffect, useRef } from 'react';

import Loader from './Loader';
import RootsForm from './RootsForm';
import DragDropFolderInput from './DragDropFolderInput';
/* import FolderSelector from './FolderSelector'; */
import NativeDragDropFolderInput from './NativeDragDropFolderInput';
import { GiTreeRoots } from 'react-icons/gi';
import '../style/Update.css';

const Update = () => {
  const [rootsUpdateReq, setRootsUpdateReq] = useState(false);
  const [rootDirs, setRootDirs] = useState([]);

  useEffect(() => {
    const reqRoots = async () => {
      const rootFolders = await window.api.getRoots();
      //console.log('rootFolders: ', rootFolders);
      setRootDirs(rootFolders);
    };
    if (rootsUpdateReq) {
      reqRoots();
    }
  }, [rootsUpdateReq]);

  const handleUpdates = async (e) => {
    e.preventDefault();
    switch (e.currentTarget.id) {
      case 'rootsupdate':
        setRootsUpdateReq((prevState) => !prevState);
        break;
      default:
        return;
    }
  };

  return (
    <div className="update-container">
      <>
        <div className="update-roots" id="rootsupdate" onClick={handleUpdates}>
          <GiTreeRoots /> Add root folders
        </div>
        {rootsUpdateReq && rootDirs && (
          <NativeDragDropFolderInput rootDirs={rootDirs} setRootDirs={setRootDirs} />
        )}
      </>
    </div>
  );
};

export default Update;
