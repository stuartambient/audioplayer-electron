import { FixedSizeList } from 'react-window';
import Row from './Row';

export const List = ({ height, data, itemSize, width, className, onClick, stat }) => {
  return (
    <FixedSizeList
      height={height}
      itemCount={data.length}
      itemSize={itemSize} // Specify the height of each item in the list
      width={width} // Specify the desired width of the list
      className={className}
    >
      {({ index, style }) => (
        <Row index={index} style={style} data={data} onClick={onClick} stat={stat} />
      )}
    </FixedSizeList>
  );
};

export default List;
