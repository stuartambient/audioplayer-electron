/* import { AutoSizer, Table, Column } from 'react-virtualized';
import 'react-virtualized/styles.css';

const VirtualizedTable = ({ data }) => {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <Table
          width={width}
          height={height}
          headerHeight={40}
          rowHeight={50}
          rowCount={data.length}
          rowGetter={({ index }) => data[index]}
        >
          <Column label="id" dataKey="afid" width={100} />
          <Column label="file" dataKey="audiofile" width={200} />
          <Column label="year" dataKey="year" width={100} />
          <Column label="title" dataKey="title" width={100} />
          <Column label="artist" dataKey="artist" width={200} />
          <Column label="album" dataKey="album" width={100} />
          <Column label="genre" dataKey="genre" width={100} />
        </Table>
      )}
    </AutoSizer>
  );
};

export default VirtualizedTable; */
