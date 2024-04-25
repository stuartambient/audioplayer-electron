import { Virtuoso } from 'react-virtuoso';
import Row from './RowNew';

const ListNew = ({ height, data, /* itemSize, */ width, className, onClick, stat }) => {
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

export default ListNew;
