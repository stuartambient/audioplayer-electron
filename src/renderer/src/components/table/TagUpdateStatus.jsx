import { useState, useEffect } from 'react';
import StatusLoader from './StatusLoader';

const TagUpdateState = () => {
  const [status, setStatus] = useState('');

  useEffect(() => {
    const handleUpdateTagsStatus = (msg) => {
      if (msg === 'starting') {
        setStatus(msg);
      }
      if (msg === 'success') {
        setStatus(msg);
      }
    };

    window.metadataEditingApi.onUpdateTagsStatus(handleUpdateTagsStatus);

    return () => {
      window.metadataEditingApi.off('update-tags', handleUpdateTagsStatus);
    };
  }, []);

  return (
    <>{status === 'starting' ? <StatusLoader /> : <p style={{ color: 'white' }}>{status}</p>}</>
  );
};

export default TagUpdateState;
