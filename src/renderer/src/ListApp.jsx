import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';

import './style/ListApp.css';

/* import './style/ChildApp.css'; */

const ListApp = () => {
  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.listapi.onSendToList((e) => {
        console.log('e: ', e);
        /*         setReleases(e);
        setPreviewImage(undefined); */
      });
    };
    if (subscribed) getArgs();
    return () => (subscribed = false);
  });

  return <h2>ListApp</h2>;
};

export default ListApp;
