import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';
import { CiPlay1 } from 'react-icons/ci';
import AGGrid from '../../table/AGGrid';
import './style.css';

const MetadataEditingApp = () => {
  const [listType, setListType] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.metadataEditingApi.onSendToChild((e) => {
        setListType(e.listType);
        setData(e.results);
      });
    };
    if (subscribed) getArgs();
    return () => (subscribed = false);
  }, []);

  return (
    <>
      <AGGrid data={data} />
    </>
  );
};

export default MetadataEditingApp;
