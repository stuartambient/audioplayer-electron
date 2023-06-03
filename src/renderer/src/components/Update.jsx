import { useState, useEffect, useRef } from 'react';
import Loader from './Loader';
import { AiOutlineFolderOpen, AiOutlineFileAdd } from 'react-icons/ai';
import { SiMetabase } from 'react-icons/si';
import TextEditor from './TextEditor';
import '../style/Update.css';

const Update = () => {
  const [fileUpdateResults, setFileUpdateResults] = useState();
  const [folderUpdateResults, setFolderUpdateResults] = useState();
  const [folderUpdateDetails, setFolderUpdateDetails] = useState();
  const [fileUpdateDetails, setFileUpdateDetails] = useState();
  const [folderUpdateReq, setFolderUpdateReq] = useState();
  const [fileUpdateReq, setFileUpdateReq] = useState();
  const [metaUpdateReq, setMetaUpdateReq] = useState();
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [showFolderDetails, setShowFolderDetails] = useState(false);

  const handleUpdates = async (e) => {
    e.preventDefault();
    /*   console.log(e.currentTarget.id); */
    switch (e.currentTarget.id) {
      case 'filesupdate':
        setFileUpdateReq(true);
        const filesUpdate = await window.api.updateFiles();
        setFileUpdateResults(filesUpdate);
        setFileUpdateReq(false);
        break;
      case 'foldersupdate':
        setFolderUpdateReq(true);
        const foldersUpdate = await window.api.updateFolders();
        setFolderUpdateResults(foldersUpdate);
        setFolderUpdateReq(false);
        break;
      case 'metafiles':
        setMetaUpdateReq(true);
        const ifModified = await window.api.updateMeta();
        console.log(ifModified);
      default:
        return;
    }
  };

  /* const foldersUpdate = await window.api.updateFolders(); */

  useEffect(() => {
    const getFilesUpdateDetails = async () => {
      const updateFilesFile = await window.api.fileUpdateDetails();
      setFileUpdateDetails(updateFilesFile);
    };
    const getFoldersUpdateDetails = async () => {
      const updateFoldersFile = await window.api.folderUpdateDetails();
      setFolderUpdateDetails(updateFoldersFile);
    };
    if (showFileDetails) {
      getFilesUpdateDetails();
    }
    if (showFolderDetails) {
      getFoldersUpdateDetails();
    }
  }, [showFileDetails, showFolderDetails]);

  const handleDetailsRequest = async (e) => {
    console.log(e.target.id);
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
  };
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
      <div className="file-update-results">
        {fileUpdateResults && (
          <>
            <p>New: {fileUpdateResults.new.length}</p>
            <p>Deleted: {fileUpdateResults.deleted.length}</p>
            {fileUpdateResults.nochange === true ? <p>No changes</p> : <p>See changes</p>}
          </>
        )}
      </div>
      <div className="folder-update-results">
        {folderUpdateResults && (
          <>
            <p>New: {folderUpdateResults.new.length}</p>
            <p>Deleted: {folderUpdateResults.deleted.length}</p>
            {folderUpdateResults.nochange === true ? <p>No changes</p> : <p>See changes</p>}
          </>
        )}
      </div>
      <div className="file-update-details" onClick={handleDetailsRequest} id="file">
        File update details
      </div>
      {showFileDetails && fileUpdateDetails && (
        <TextEditor
          title="File - updates"
          text={fileUpdateDetails}
          closeFileDetails={setShowFileDetails}
        />
      )}
      <div className="folder-update-details" onClick={handleDetailsRequest} id="folder">
        Folder update details
      </div>{' '}
      {showFolderDetails && folderUpdateDetails && (
        <TextEditor
          title="Folder - updates"
          text={folderUpdateDetails}
          closeFolderDetails={setShowFolderDetails}
        />
      )}
    </div>
  );
};

export default Update;

/* ('file-update-results');
folder - update - results;
 */
