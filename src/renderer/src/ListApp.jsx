import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';
import DataGrid from 'react-data-grid';
import './style/ListApp.css';

/* import './style/ChildApp.css'; */

const ListApp = () => {
  const columns = [
    { key: 'id', name: 'ID' },
    { key: 'title', name: 'Title' }
  ];

  const rows = [
    { id: 0, title: 'Example' },
    { id: 1, title: 'Demo' }
  ];
  const [listType, setListType] = useState('');
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
    <div>
      {listType && <h2>{listType}</h2>}
      <DataGrid columns={columns} rows={rows} />
      {data && (
        <ul>
          {data.map((file) => {
            return <li>{file.audiofile}</li>;
          })}
        </ul>
      )}
    </div>
  );
};

export default ListApp;
