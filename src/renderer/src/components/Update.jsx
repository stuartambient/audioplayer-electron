import { useState } from 'react';
import '../style/Update.css';

const Update = () => {
  const [folderUpdateRequest, setFolderUpdateRequest] = useState(false);
  const [fileUpdateRequest, setFileUpdateRequest] = useState(false);
  const [fileUpdateResults, setFileUpdateResults] = useState();
  const [folderUpdateResults, setFolderUpdateResults] = useState();
  const [folderUpdateDetails, setFolderUpdateDetails] = useState();
  const [fileUpdateDetails, setFileUpdateDetails] = useState();

  const handleUpdateFiles = async () => {
    setFileUpdateResults(null);
    setFileUpdateRequest(true);
    const filesUpdate = await window.api.updateFiles();
    setFileUpdateResults(filesUpdate);
    setFileUpdateRequest(false);
  };

  const handleUpdateFolders = async () => {
    setFolderUpdateResults(null);
    setFolderUpdateRequest(true);
    const foldersUpdate = await window.api.updateFolders();
    setFolderUpdateResults(foldersUpdate);
    setFolderUpdateRequest(false);
  };

  const handleDetailsRequest = async (e) => {
    switch (e.target.id) {
      case 'file':
        console.log('file');
        const updateFilesFile = await window.api.fileUpdateDetails();
        setFileUpdateDetails(updateFilesFile);
        break;
      case 'folder':
        console.log('folder');
        const updateFoldersFile = await window.api.folderUpdateDetails();
        setFolderUpdateDetails(updateFoldersFile);
        break;
      default:
        return;
    }
  };
  return (
    <div className="update-container">
      <>
        <button className="update-files" onClick={handleUpdateFiles}>
          Update Files
        </button>
        <br />
        <button className="update-folders" onClick={handleUpdateFolders}>
          Update Folders
        </button>
      </>
      {folderUpdateRequest && !folderUpdateResults ? (
        <div className="folder-update-results">Loading.....</div>
      ) : (
        <div className="folder-update-results">
          {folderUpdateResults && folderUpdateResults.new > 0 && (
            <p>New: {folderUpdateResults.new.length}</p>
          )}
          {folderUpdateResults && folderUpdateResults.deleted > 0 && (
            <p>Deleted: {folderUpdateResults.deleted.length}</p>
          )}

          {folderUpdateResults && folderUpdateResults.nochange === true && <p>No changes</p>}
        </div>
      )}
      {fileUpdateRequest && !fileUpdateResults ? (
        <div className="file-update-results">Loading.....</div>
      ) : (
        <div className="file-update-results">
          {fileUpdateResults && fileUpdateResults.new > 0 && (
            <p>New: fileUpdateResults.new.length}</p>
          )}
          {fileUpdateResults && fileUpdateResults.deleted > 0 && (
            <p>Deleted: {fileUpdateResults.deleted.length}</p>
          )}

          {fileUpdateResults && fileUpdateResults.nochange === true && <p>No changes</p>}
        </div>
      )}
      <div className="file-update-details" onClick={handleDetailsRequest} id="file">
        File update details
        {fileUpdateDetails && (
          <div className="file-update-details--file">
            <textarea>{fileUpdateDetails}</textarea>
          </div>
        )}
      </div>
      <div className="folder-update-details" onClick={handleDetailsRequest} id="folder">
        Folder update details
        {folderUpdateDetails && (
          <div className="folder-update-details-file">
            <textarea>{folderUpdateDetails}</textarea>
          </div>
        )}
      </div>
    </div>
  );
};

export default Update;
