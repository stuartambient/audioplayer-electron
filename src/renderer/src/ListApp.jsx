import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';

import './style/ListApp.css';

/* import './style/ChildApp.css'; */

const ListApp = () => {
  const [listType, setListType] = useState('');
  const [artistFiles, setArtistFiles] = useState([]);
  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.listapi.onSendToList((e) => {
        setListType(e[0]);
        setArtistFiles(e[1]);
        /*         setReleases(e);
        setPreviewImage(undefined); */
      });
    };
    if (subscribed) getArgs();
    return () => (subscribed = false);
  });

  return (
    <div>
      {listType && <h2>{listType}</h2>}
      {artistFiles && (
        <ul>
          {artistFiles.map((file) => {
            return <li>{file.audiofile}</li>;
          })}
        </ul>
      )}
    </div>
  );
};

export default ListApp;
