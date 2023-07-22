import { useState, useEffect } from 'react';

import DataGrid, {
  SelectColumn,
  textEditor
  /*   AutoCompleteEditor,
  DropDownFormatter */
} from 'react-data-grid';
/* import { renderAvatar, renderDropdown } from './renderers'; */

const Grid = ({ data }) => {
  const [columns, setColumns] = useState();

  /*   function rowKeyGetter(rowData) {
    return row.id;
  }
 */

  useEffect(() => {
    if (data && data.length > 0) {
      setColumns(
        Object.keys(data[0]).map((key) => ({
          key: key,
          name: key,
          resizable: true,
          frozen: true,
          renderEditCell: textEditor
        }))
      );
    }
  }, [data]);

  /* editor: AutoCompleteEditor, // Use any editor you want, or remove this line if you don't need editing
      formatter: DropDownFormatter  */ // Use any formatter you want, or remove this line if you don't need custom formatting

  const rowKeyGetter = (row) => {
    return row.afid;
  };

  return (
    <>
      {data && data.length > 0 && columns && (
        <DataGrid
          columns={columns}
          rows={data}
          rowKeyGetter={rowKeyGetter}
          rowsCount={data.length}
          minHeight={40}
        />
      )}
    </>
  );
};

export default Grid;
