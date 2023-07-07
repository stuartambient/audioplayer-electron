const Row = ({ index, style, data, onClick }) => {
  const rowData = data[index];

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
      <span style={itemStyles}>{rowData.artist}</span>
      <span id={rowData.artist} onClick={onClick} style={countStyles}>
        {rowData.count}
      </span>
    </div>
  );
};

export default Row;
