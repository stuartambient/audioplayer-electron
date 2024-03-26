import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';
import AGGrid from './components/table/AGGrid';
import './style/ListApp.css';

const ListApp = () => {
  const [listType, setListType] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.listapi.onSendToList((e) => {
        setListType(e.listType);
        setData(e.results);
      });
    };
    if (subscribed) getArgs();
    return () => (subscribed = false);
  });

  return (
    <>
      <AGGrid data={data} />
    </>
  );
};

export default ListApp;
