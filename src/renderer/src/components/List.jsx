import { useRef, useEffect, useState, useCallback } from 'react';
import { Virtuoso, TableVirtuoso } from 'react-virtuoso';
import Row from './Row';
import '../style/List.css';

const Header = ({
  'data-role': dataRole,
  amountLoaded,
  dimensions,
  filterValue,
  setFilterValue,
  stat
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
        console.log('field: ', field, item[field]);
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
            amountLoaded={amountLoaded}
            data-role={role}
            dimensions={dimensions}
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            stat={stat}
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
