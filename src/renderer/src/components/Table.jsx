import '../style/Table.css';

const Content = ({ entries, columns }) => {
  return (
    <tbody>
      {entries.map((entry) => (
        <tr key={entry.afid}>
          {columns.map((column) => (
            <td key={column} className="table--header-cell">
              {entry[column]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

const Header = ({ columns }) => {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column.key} className="table--header-cell">
            {column.name}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const Table = ({ data }) => {
  const columns = ['afid', 'audiofile', 'year', 'title', 'artist', 'album', 'genre'];
  return (
    <div>
      Search Bar
      <table className="table">
        <Header columns={columns} />
        <Content entries={data} columns={columns} />
      </table>
    </div>
  );
};

export default Table;
