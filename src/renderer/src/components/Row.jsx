const Row = ({ index, style, data, onClick, stat }) => {
  const rowData = data[index];
  console.log(stat);

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
    <div style={{ ...style, ...rowStyles }}>
      {stat === 'stat-artists' && (
        <>
          <span style={itemStyles}>{rowData.artist}</span>
          <span id={rowData.artist} onClick={onClick} style={countStyles}>
            {rowData.count}
          </span>
        </>
      )}
      {stat === 'stat-genres' && (
        <>
          <span style={itemStyles}>{!rowData.genre ? 'null' : rowData.genre}</span>
          {rowData.genre && (
            <span id={rowData.genre} onClick={onClick} style={countStyles}>
              {rowData.count}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default Row;
