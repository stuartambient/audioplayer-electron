import { Virtuoso, TableVirtuoso } from 'react-virtuoso';
import Row from './Row';

const Header = ({ albumsLoaded }) => {
  return (
    <div
      style={{
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        background: 'black',
        width: '100%',
        height: '2rem',
        zIndex: '1',
        paddingRight: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <h3>Albums loaded: {albumsLoaded}</h3>
    </div>
  );
};

const List = ({ height, data, width, className, onClick, stat, amountLoaded }) => {
  console.log('amount loaded: ', amountLoaded);
  return (
    <Virtuoso
      style={{ height, width }}
      className={className}
      data={data}
      components={{
        Header: () => <Header albumsLoaded={amountLoaded} />
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
