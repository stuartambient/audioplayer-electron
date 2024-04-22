import { FixedSizeList } from 'react-window';
import Row from './Row';

export const List = ({ height, data, itemSize, width, className, onClick, stat }) => {
  console.log('height: ', height);
  /* let newHeight;
  if (stat === 'stat-folder' || stat === 'stat-album') {
    newHeight = height / 2;
  } else {
    newHeight = height;
  }
  console.log('list height: ', newHeight); */
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
