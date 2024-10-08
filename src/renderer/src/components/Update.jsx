import { useState, useEffect, useRef } from 'react';

import Loader from './Loader';
import RootsForm from './RootsForm';
import DragDropFolderInput from './DragDropFolderInput';
/* import FolderSelector from './FolderSelector'; */
import NativeDragDropFolderInput from './NativeDragDropFolderInput';
import { AiOutlineFolderOpen, AiOutlineFileAdd, AiOutlineDeploymentUnit } from 'react-icons/ai';
import { GrConfigure } from 'react-icons/gr';
import { SiMetabase } from 'react-icons/si';
import { FaImages } from 'react-icons/fa6';
import { GiTreeRoots } from 'react-icons/gi';
import TextEditor from './TextEditor';
import '../style/Update.css';

const Update = () => {
  const [fileUpdateResults, setFileUpdateResults] = useState();
  const [folderUpdateResults, setFolderUpdateResults] = useState();
  const [metaUpdateResults, setMetaUpdateResults] = useState();
  const [coverUpdateResults, setCoverUpdateResults] = useState();
  /*  const [folderUpdateDetails, setFolderUpdateDetails] = useState(); */
  /*   const [fileUpdateDetails, setFileUpdateDetails] = useState(); */
  const [folderUpdateReq, setFolderUpdateReq] = useState();
  const [fileUpdateReq, setFileUpdateReq] = useState();
  const [metaUpdateReq, setMetaUpdateReq] = useState();
  const [coverUpdateReq, setCoverUpdateReq] = useState();
  const [rootsUpdateReq, setRootsUpdateReq] = useState(false);
  const [rootDirs, setRootDirs] = useState([]);
  /* const [showFileDetails, setShowFileDetails] = useState(); */
  /*  const [showFolderDetails, setShowFolderDetails] = useState(); */

  useEffect(() => {
    const handleFileUpdateComplete = (result) => {
      setFileUpdateReq(false);
      setFileUpdateResults(result);
    };
    window.api.onUpdateFiles(handleFileUpdateComplete);
    return () => {
      window.api.off('file-update-complete', handleFileUpdateComplete);
    };
  }, []);

  useEffect(() => {
    const handleMetaUpdateComplete = (result) => {
      setMetaUpdateReq(false);
      setMetaUpdateResults(result);
    };
    window.api.onUpdateMetadata(handleMetaUpdateComplete);
    return () => {
      window.api.off('file-update-complete', handleMetaUpdateComplete);
    };
  }, []);

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

  useEffect(() => {
    const handleFolderUpdateComplete = (result) => {
      setFolderUpdateReq(false);
      setFolderUpdateResults(result);
    };
    window.api.onUpdateFolders(handleFolderUpdateComplete);
    return () => {
      window.api.off('folder-update-complete', handleFolderUpdateComplete);
    };
  }, []);

  useEffect(() => {
    const handleCoversUpdateComplete = (result) => {
      setCoverUpdateReq(false);
      setCoverUpdateResults(result);
    };
    window.api.onUpdateCovers(handleCoversUpdateComplete);
    return () => {
      window.api.off('cover-update-complete', handleCoversUpdateComplete);
    };
  }, []);

  const handleUpdates = async (e) => {
    e.preventDefault();
    switch (e.currentTarget.id) {
      case 'filesupdate':
        setFileUpdateReq(true);
        const filesUpdate = await window.api.updateFiles();
        /* console.log('filesUpdate: ', filesUpdate); */
        /* setFileUpdateResults(filesUpdate); */
        /* setFileUpdateReq(false); */
        break;
      case 'foldersupdate':
        setFolderUpdateReq(true);
        const foldersUpdate = await window.api.updateFolders();
        //setFolderUpdateResults(foldersUpdate);
        //setFolderUpdateReq(false);
        break;
      case 'metafiles':
        setMetaUpdateReq(true);
        const modifiedMeta = await window.api.updateMeta();
        /* setMetaUpdateResults(modifiedMeta);
        setMetaUpdateReq(false); */
        break;
      case 'coversupdate':
        setCoverUpdateReq(true);
        const updatedCovers = await window.api.updateCovers();
        setCoverUpdateResults(updatedCovers);
        break;
      case 'rootsupdate':
        setRootsUpdateReq((prevState) => !prevState);
        break;

      default:
        return;
    }
  };

  /* const foldersUpdate = await window.api.updateFolders(); */

  /*   const handleDetailsRequest = async (e) => {
    switch (e.target.id) {
      case 'file':
        setShowFileDetails(!showFileDetails);
        break;
      case 'folder':
        setShowFolderDetails(!showFolderDetails);
        break;
      default:
        return;
    }
  }; */
  return (
    <div className="update-container">
      <>
        <div className="update-files" id="filesupdate" onClick={handleUpdates}>
          <AiOutlineFileAdd />
          Update Files
        </div>
        <div className="update-meta" id="metafiles" onClick={handleUpdates}>
          <SiMetabase />
          Update Meta
        </div>
        <div className="update-folders" id="foldersupdate" onClick={handleUpdates}>
          <AiOutlineFolderOpen /> Update Folders
        </div>
        <div className="update-covers" id="coversupdate" onClick={handleUpdates}>
          <FaImages /> Update Covers
        </div>
        <div className="update-roots" id="rootsupdate" onClick={handleUpdates}>
          <GiTreeRoots /> Add root folders
        </div>
        {rootsUpdateReq && rootDirs && (
          <NativeDragDropFolderInput rootDirs={rootDirs} setRootDirs={setRootDirs} />
        )}
      </>
      {fileUpdateReq && (
        <div className="file-update-results">
          <Loader />
        </div>
      )}

      {folderUpdateReq && (
        <div className="folder-update-results">
          <Loader />
        </div>
      )}

      {coverUpdateReq && (
        <div className="cover-update-results">
          <Loader />
        </div>
      )}

      {metaUpdateReq && (
        <div className="meta-update-results">
          <Loader />
        </div>
      )}
      <div className="file-update-results">
        {fileUpdateResults && (
          <>
            <p>New: {fileUpdateResults.new === '' ? 0 : fileUpdateResults.new}</p>
            <p>Deleted: {fileUpdateResults.deleted === '' ? 0 : fileUpdateResults.deleted}</p>
            {fileUpdateResults.nochange === true ? <p>No changes</p> : <p>See changes</p>}
          </>
        )}
      </div>
      <div className="folder-update-results">
        {folderUpdateResults && (
          <>
            <p>New: {folderUpdateResults.new === '' ? 0 : folderUpdateResults.new}</p>
            <p>Deleted: {folderUpdateResults.deleted === '' ? 0 : folderUpdateResults.deleted}</p>
            {folderUpdateResults.nochange === true ? <p>No changes</p> : <p>See changes</p>}
          </>
        )}
      </div>
      <div className="meta-update-results">
        {metaUpdateResults && (
          <>
            <p>Changed: {metaUpdateResults.new === '' ? 0 : metaUpdateResults.new}</p>
            {/* <p>Deleted: {folderUpdateResults.deleted.length}</p> */}
            {metaUpdateResults.nochange === true ? <p>No changes</p> : <p>See changes</p>}
          </>
        )}
      </div>
      <div className="cover-update-results">
        {coverUpdateResults && <p>Cover Update Results: {coverUpdateResults}</p>}
      </div>
      {/* <div className="file-update-details" onClick={handleDetailsRequest} id="file">
        File update details
      </div> */}
      {/*  {showFileDetails && fileUpdateDetails && (
        <TextEditor
          title="File - updates"
          text={fileUpdateDetails}
          closeFileDetails={setShowFileDetails}
        />
      )} */}
      {/* <div className="folder-update-details" onClick={handleDetailsRequest} id="folder">
        Folder update details
      </div>{' '} */}
      {/*   {showFolderDetails && folderUpdateDetails && (
        <TextEditor
          title="Folder - updates"
          text={folderUpdateDetails}
          closeFolderDetails={setShowFolderDetails}
        />
      )} */}
    </div>
  );
};

export default Update;

/* ('file-update-results');
folder - update - results;
 */
