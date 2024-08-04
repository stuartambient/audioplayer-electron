import { useState } from 'react';
import { GiExpandedRays } from 'react-icons/gi';
import '../style/Row.css';

const handleSort = (column) => {
  // Sort the data based on the column
  const sortedData = [...data].sort((a, b) => (a[column] > b[column] ? 1 : -1));
  // Update the state with the sorted data
  setData(sortedData);
};

const HeaderRow = ({ onSort }) => {
  return (
    <div className="header-row">
      <div onClick={() => onSort('column1')}>Column 1</div>
      <div onClick={() => onSort('column2')}>Column 2</div>
      <div onClick={() => onSort('column3')}>Column 3</div>
    </div>
  );
};

const Row = ({ index, style, data, onClick, onChange, isChecked, stat }) => {
  /* console.log('data: ', data);
    const rowData = data[index];  */

  const rowStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '50px',
    backgroundColor: index % 2 === 0 ? 'hsl(0, 0%, 13%)' : 'rgb(55, 71, 79)'
    // Add more styles as needed
  };

  const itemStyles = {
    marginLeft: '10px',
    fontWeight: 'bold',
    cursor: 'pointer'
    // Add more styles as needed
  };

  const countStyles = {
    marginRight: '10px',
    cursor: 'pointer',
    margin: '0 10px'
    // Add more styles as needed
  };

  return (
    <div style={rowStyles}>
      {stat === 'stat-artists' && (
        <>
          <span id={data.performers} onClick={onClick} style={itemStyles}>
            {data.performers}
          </span>
          <span style={countStyles}>{data.count}</span>
        </>
      )}
      {stat === 'stat-genres' && (
        <>
          <span style={itemStyles} id={data.genre_display} onClick={onClick}>
            {!data.genre_display ? 'null' : data.genre_display}
          </span>
          {data.genre_display && (
            <span id={data.genre_display} style={countStyles}>
              {data.count}
            </span>
          )}
        </>
      )}
      {/*       {stat === 'stat-folder' && (
        <>
          {rowData.root && (
            <>
              <span id={rowData.root} onClick={onClick} style={{ cursor: 'pointer' }}>
                {rowData.root}
              </span>
              <span style={{ cursor: 'pointer' }}>
                <GiExpandedRays id={`${rowData.root}--expand`} onClick={onClick} />
              </span>
              <span id={rowData.count}>{rowData.count}</span>
            </>
          )}
        </>
      )} */}
      {stat === 'stat-albums' && (
        <>
          <label className="list-checkbox">
            <input type="checkbox" id={data.fullpath} checked={isChecked} onChange={onChange} />
          </label>
          <span
            key={data.id}
            className="list-item"
            id={data.fullpath}
            onClick={onClick}
            style={itemStyles}
          >
            {data.foldername}
          </span>
        </>
      )}
    </div>
  );
};

export default Row;
