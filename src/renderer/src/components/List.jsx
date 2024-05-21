import { Virtuoso } from 'react-virtuoso';
import Row from './Row';

const List = ({ height, data, width, className, onClick, stat }) => {
  return (
    <Virtuoso
      style={{ height, width }}
      className={className}
      data={data}
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
