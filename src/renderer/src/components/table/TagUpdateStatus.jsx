import { useState, useEffect } from 'react';
import StatusLoader from './StatusLoader';

const TagUpdateState = ({ updateStatus, setUpdateStatus }) => {
  useEffect(() => {
    if (updateStatus && updateStatus !== 'starting') {
      setTimeout(() => setUpdateStatus(''), 8000);
    }
  }, [updateStatus]);
  useEffect(() => {
    const handleUpdateTagsStatus = (msg) => {
      //const validMessages = ['starting', 'image(s) updated', 'tags updated', 'error processing'];
      //if (validMessages.includes(msg)) {
      setUpdateStatus(msg);
      //} else {
      return;
      //}
    };

    window.metadataEditingApi.onUpdateTagsStatus(handleUpdateTagsStatus);

    return () => {
      window.metadataEditingApi.off('update-tags', handleUpdateTagsStatus);
    };
  }, []);

  return (
    <>
      {updateStatus === 'starting' ? (
        <StatusLoader />
      ) : (
        <>
          <p style={{ color: 'white' }}>{updateStatus}</p>
        </>
      )}
    </>
  );
};

export default TagUpdateState;
