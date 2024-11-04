import { useRef, useEffect, useState, useCallback } from 'react';
import { Virtuoso, TableVirtuoso } from 'react-virtuoso';
import Row from './Row';
import { MdDeselect } from 'react-icons/md';
import '../style/List.css';

const Header = ({
  'data-role': dataRole,
  amountLoaded,
  dimensions,
  filterValue,
  setFilterValue,
  onClick,
  stat,
  handleMultiAlbumDeselect
}) => {
  if (!dimensions || !dimensions.width) {
    return null;
  }
  const inputRef = useRef(null);
  const childRef = useRef(null);
  const type = stat.split('-')[1];
  const listType = type.charAt(0).toUpperCase() + type.slice(1);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [filterValue]);

  useEffect(() => {
    if (childRef.current) {
      const parentElement = childRef.current.parentElement;
      if (parentElement) {
        parentElement.classList.add('highlighted');
      }
    }
  }, []);

  const handleFilter = (e) => {
    setFilterValue(e.target.value);
  };

  return (
    <>
      <div
        ref={childRef}
        data-role={dataRole}
        style={{
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          background: 'black',
          width: `${dimensions.width - 10}px`,
          height: '3rem',
          zIndex: '1'
        }}
      >
        <div
          className="header-content"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center'
          }}
        >
          <h3>
            {listType} loaded: {amountLoaded}
          </h3>
          {/* {stat === 'stat-albums' && ( */}
          <>
            <span className="list-header-button" onClick={onClick}>
              Load selected
            </span>
            <span onClick={handleMultiAlbumDeselect}>
              <MdDeselect />
            </span>
          </>
          {/*  )} */}
          <input
            value={filterValue}
            onChange={handleFilter}
            ref={inputRef}
            placeholder="search"
            style={{
              width: '100%',
              maxWidth: '200px',
              height: '2rem',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              marginRight: '3rem'
            }}
          />
        </div>
      </div>
    </>
  );
};

const List = ({
  height,
  data,
  width,
  className,
  onClick,
  stat,
  amountLoaded,
  dimensions,
  tableStatus,
  initTable
}) => {
  const [filterValue, setFilterValue] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  const [multiAlbums, setMultiAlbums] = useState([]);
  console.log('onClick: ', onClick);

  /* const handleMultiAlbumSelect = (e) => {
    console.log('handleMultiAlbumSelect: ', e.target.dataset.list, '----', e.target.id);
    const albumId = e.target.id;
    setMultiAlbums((prevAlbums) =>
      prevAlbums.includes(albumId)
        ? prevAlbums.filter((album) => album !== albumId)
        : [...prevAlbums, albumId]
    );
  }; */

  const [multiSelects, setMultiSelects] = useState([]);

  const handleMultiAlbumSelect = (e) => {
    console.log('handleMultiAlbumSelect: ', e.target.dataset.list, '----', e.target.id);
    const selectId = e.target.id;

    setMultiSelects((prevSelects) =>
      prevSelects.includes(selectId)
        ? prevSelects.filter((select) => select !== selectId)
        : [...prevSelects, selectId]
    );
  };

  useEffect(() => {
    console.log('multiselects: ', multiSelects, '---', stat);
  }, [multiSelects, stat]);

  const handleMultiAlbumDeselect = (e) => setMultiAlbums([]);
  useEffect(() => {
    const albumTracksLoaded = (arg) => {
      console.log('album-tracks-loaded', arg);
    };

    window.api.onTracksByAlbum(albumTracksLoaded);
    return () => {
      window.api.off('album-tracks-loaded', albumTracksLoaded);
    };
  }, []);

  /*   const handleMultiSelects = (e) => {
    const getTableName = (stat) => {
      switch (stat) {
        case 'stat-genres': return 'genre-tracks';
        case 'stat-albums': return 'album-tracks';
        case 'stat-artists': return 'artist-tracks';
        default: return null;
      }
  };

  const tableName = getTableName(stat); */

  const handleMultiSelects = (e) => {
    let tableName;

    if (stat === 'stat-genres') {
      tableName = 'genre-tracks';
    } else if (stat === 'stat-albums') {
      tableName = 'album-tracks';
    } else if (stat === 'stat-artists') {
      tableName = 'artist-tracks';
    }
    const loadMultiAlbums = async () => {
      const tableStat = await tableStatus();

      if (!tableStat) {
        initTable(tableName);
      }
      let result;
      if (stat === 'stat-genres') {
        console.log('multiselects: ', multiSelects);
        result = await window.api.getTracksByGenre('genre-tracks', multiSelects);
      } else if (stat === 'stat-albums') {
        result = await window.api.getTracksByAlbum('album-tracks', multiSelects);
      } else if (stat === 'stat-artists') {
        result = await window.api.getTracksByArtist('artist-tracks', multiSelects);
      }
    };
    if (multiSelects.length > 1) {
      loadMultiAlbums();
    }
  };

  /*  console.log('data: ', data); */

  const fields = {
    'stat-albums': 'foldername',
    'stat-genres': 'genre_display',
    'stat-artists': 'performers'
  };

  /*   useEffect(() => {
    if (!filterValue) return setFilteredData(data);
    setFilteredData(data.filter((d) => d.foldername.includes(filterValue)));
  }, [filterValue, data]); */

  const filterData = useCallback(() => {
    if (!filterValue.trim()) {
      setFilteredData(data);
    } else {
      const lowercasedFilter = filterValue.toLowerCase().trim();
      console.log('lowercasedFilter: ', lowercasedFilter);
      const filtered = data.filter((item) => {
        const field = fields[stat];
        if (!item[field]) return;
        return item[field].toLowerCase().includes(lowercasedFilter);
      });
      setFilteredData(filtered);
      console.log('filtered: ', filtered);
    }
  }, [filterValue, data, filteredData]);

  useEffect(() => {
    if (stat !== 'stat-albums') {
      setFilteredData(data);
    }
  }, [stat, data]);

  useEffect(() => {
    if (filterValue) {
      filterData();
    } else if (!filterValue) {
      setFilteredData(data);
    }
  }, [filterValue]);

  const isChecked = (item) => {
    console.log('item: ', item);
    switch (stat) {
      case 'stat-albums': {
        return multiSelects.includes(item.fullpath);
      }
      case 'stat-genres': {
        return multiSelects.includes(item.genre_display);
      }
      case 'stat-artists': {
        return multiSelects.includes(item.performers);
      }
    }
  };

  const role = 'virtuoso-header';

  return (
    <Virtuoso
      style={{ height, width }}
      className={className}
      data={filteredData}
      components={{
        Header: () => (
          <Header
            amountLoaded={amountLoaded}
            data-role={role}
            dimensions={dimensions}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            onClick={handleMultiSelects}
            handleMultiAlbumDeselect={handleMultiAlbumDeselect}
            stat={stat}
          />
        )
      }}
      itemContent={(index, item) => {
        /*     console.log('item.id: ', item); */
        return (
          <Row
            index={index}
            data={item} // Pass the item directly
            onClick={onClick}
            onChange={handleMultiAlbumSelect}
            /* isChecked={!!filteredData[item.id]} */
            isChecked={isChecked(item)}
            stat={stat}
          />
        );
      }}
    />
  );
};

export default List;
