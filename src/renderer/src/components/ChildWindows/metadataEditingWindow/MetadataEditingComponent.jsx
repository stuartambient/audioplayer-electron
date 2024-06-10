import { useState, useEffect, useRef, Suspense } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HiOutlineCursorClick } from 'react-icons/hi';
import { CiPlay1 } from 'react-icons/ci';
import AGGrid from '../../table/AGGrid';
import TableLoader from '../../table/TableLoader';
import './style.css';

const MetadataEditingApp = () => {
  const [listType, setListType] = useState([]);
  const [reset, setReset] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    const handleClearTable = () => {
      setReset(true);
      setData([]); // Trigger grid to show loading state
    };

    window.metadataEditingApi.onClearTable(handleClearTable);

    return () => {
      window.metadataEditingApi.off('clear-table', handleClearTable);
    };
  }, []);

  useEffect(() => {
    const handleSendToChild = (e) => {
      setListType(e.listType);
      setData(e.results);
      setReset(false);
    };

    window.metadataEditingApi.onSendToChild(handleSendToChild);

    return () => {
      window.metadataEditingApi.off('send-to-child', handleSendToChild);
    };
  }, []);

  return <AGGrid reset={reset} data={data} />;
};

export default MetadataEditingApp;
