import { useRef, useEffect, useState, useCallback } from 'react';
import { Virtuoso, TableVirtuoso } from 'react-virtuoso';
import Row from './Row';

const Header = ({ albumsLoaded, dimensions, filterValue, setFilterValue }) => {
  /* const [filterValue, setFilterValue] = useState(''); */
  if (!dimensions || !dimensions.width) {
    return null;
  }

  const inputRef = useRef(null);

  useEffect(() => {
    // Focus on the input field whenever value changes
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [filterValue]);
  /* 
  useEffect(() => {
    filterResults(filterValue);
  }, [filterValue]); */

  const handleFilter = (e) => {
    setFilterValue(event.target.value);
    /* filterResults(filterValue); */
  };

  return (
    <>
      <div
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
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <h3>Albums loaded: {albumsLoaded}</h3>
          <input
            value={filterValue}
            onChange={handleFilter}
            ref={inputRef}
            style={{
              width: '100%',
              maxWidth: '200px' /* Optional max-width for the input box */,
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

  useEffect(() => {
    if (!filterValue) setFilteredData(data);
    setFilteredData(data.filter((d) => d.foldername.startsWith(filterValue)));
  }, [filterValue, data]);

  /*   const filterData = useCallback(() => {
    if (!filterValue) {
      setFilteredData(data);
    } else {
      const lowercasedFilter = filterValue.toLowerCase();
      const filtered = data.filter(
        (item) => item.foldername.toLowerCase().startsWith(lowercasedFilter) // Adjust this to match the structure of your data
      );
      setFilteredData(filtered);
    }
  }, [filterValue, data]);

  useEffect(() => {
    filterData();
  }, [filterValue, data, filteredData]); */

  return (
    <Virtuoso
      style={{ height, width }}
      className={className}
      data={filteredData}
      components={{
        Header: () => (
          <Header
            albumsLoaded={amountLoaded}
            data-role="virtuoso-header"
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
      /* itemSize={itemSize} */
    />
  );
};

export default List;
