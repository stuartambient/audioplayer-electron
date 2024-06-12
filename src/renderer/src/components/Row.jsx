import { GiExpandedRays } from 'react-icons/gi';

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

const Row = ({ index, style, data, onClick, stat }) => {
  /* console.log('data: ', data);
    const rowData = data[index];  */

  const rowStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '50px',
    backgroundColor: index % 2 === 0 ? 'hsl(0, 0%, 13%)' : 'rgb(55, 71, 79)'
    // Add more styles as needed
  };

  const itemStyles = {
    marginLeft: '10px',
    fontWeight: 'bold'
    // Add more styles as needed
  };

  const countStyles = {
    marginRight: '10px',
    cursor: 'pointer'
    // Add more styles as needed
  };

  return (
    <div style={rowStyles}>
      {stat === 'stat-artists' && (
        <>
          <span style={itemStyles}>{data.performers}</span>
          <span id={data.performers} onClick={onClick} style={countStyles}>
            {data.count}
          </span>
        </>
      )}
      {stat === 'stat-genres' && (
        <>
          <span style={itemStyles}>{!data.genre_display ? 'null' : data.genre_display}</span>
          {data.genre_display && (
            <span id={data.genre_display} onClick={onClick} style={countStyles}>
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
        <span key={data.id} id={data.fullpath}>
          <input type="checkbox" />
          {data.foldername}
        </span>
      )}
    </div>
  );
};

export default Row;
