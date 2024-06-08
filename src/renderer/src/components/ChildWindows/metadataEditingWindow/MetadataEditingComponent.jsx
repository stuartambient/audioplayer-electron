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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef([]);

  useEffect(() => {
    let subscribed = true;
    const getArgs = async () => {
      await window.metadataEditingApi.onSendToChild((e) => {
        if (subscribed) {
          setListType((prevListType) => (prevListType !== e.listType ? e.listType : prevListType));
          setData(e.results);
          setLoading(false); // Stop loading once data is fetched
        }
        /*  setListType(e.listType);
        setData(e.results); */
        /*  if (subscribed) {
          setListType((prevListType) => (prevListType !== e.listType ? e.listType : prevListType));
          setData((prevData) => (prevData !== e.results ? e.results : prevData));
        } */
      });
    };
    /* if (subscribed)  */ getArgs();
    return () => (subscribed = false);
  }, []);

  return (
    <Suspense fallback={<TableLoader />}>
      {loading ? <TableLoader /> : <AGGrid data={data} />}
    </Suspense>
  );
};

export default MetadataEditingApp;
