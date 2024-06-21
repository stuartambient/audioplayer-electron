import { useRef, useEffect, useState, useCallback } from 'react';
import { Virtuoso, TableVirtuoso } from 'react-virtuoso';
import Row from './Row';
import '../style/List.css';

const Header = ({
  'data-role': dataRole,
  albumsLoaded,
  dimensions,
  filterValue,
  setFilterValue
}) => {
  if (!dimensions || !dimensions.width) {
    return null;
  }

  const inputRef = useRef(null);
  const childRef = useRef(null);

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
          <h3>Albums loaded: {albumsLoaded}</h3>
          <input
            value={filterValue}
            onChange={handleFilter}
            ref={inputRef}
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

const List = ({ height, data, width, className, onClick, stat, amountLoaded, dimensions }) => {
  const [filterValue, setFilterValue] = useState('');
  const [filteredData, setFilteredData] = useState(data);

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
      const filtered = data.filter((item) =>
        item.foldername.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredData(filtered);
      console.log('filtered: ', filtered);
    }
  }, [filterValue, data, filteredData]);

  useEffect(() => {
    if (filterValue) {
      filterData();
    }
  }, [filterValue]);

  const role = 'virtuoso-header';

  return (
    <Virtuoso
      style={{ height, width }}
      className={className}
      data={filteredData}
      components={{
        Header: () => (
          <Header
            albumsLoaded={amountLoaded}
            data-role={role}
            dimensions={dimensions}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
          />
        )
      }}
      itemContent={(index, item) => (
        <Row
          index={index}
          data={item} // Pass the item directly
          onClick={onClick}
          stat={stat}
        />
      )}
    />
  );
};

export default List;
