const Row = ({ data, onClick, stat, itemSize }) => {
  const rowStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: `${itemSize}px`, // Use itemSize for height
    backgroundColor: data.id % 2 === 0 ? 'hsl(0, 0%, 13%)' : 'rgb(55, 71, 79)'
  };

  const itemStyles = {
    marginLeft: '10px',
    fontWeight: 'bold'
  };

  const countStyles = {
    marginRight: '10px',
    cursor: 'pointer'
  };

  return (
    <div style={rowStyles}>
      {stat === 'stat-artists' && (
        <>
          <span style={itemStyles}>{data.artist}</span>
          <span id={data.artist} onClick={onClick} style={countStyles}>
            {data.count}
          </span>
        </>
      )}
      {stat === 'stat-genres' && (
        <>
          <span style={itemStyles}>{!data.genre ? 'null' : data.genre}</span>
          {data.genre && (
            <span id={data.genre} onClick={onClick} style={countStyles}>
              {data.count}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default Row;
