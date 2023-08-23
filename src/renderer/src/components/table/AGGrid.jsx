import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const AGGrid = ({ data }) => {
  const [rowData, setRowData] = useState();
  const gridRef = useRef();

  useEffect(() => {
    if (data) setRowData(data);
  }, [data]);

  useEffect(() => {
    if (gridRef.current) {
      console.log(gridRef.current);
    }
  }, [gridRef.current]);

  const columnDefs = useMemo(
    () => [
      { field: 'audiofile', filter: true },
      { field: 'year', filter: true },
      { field: 'title', filter: true },
      { field: 'artist', filter: true },
      { field: 'album', filter: true },
      { field: 'genre', filter: true }
    ],
    []
  );

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true
  }));

  // Example of consuming Grid Event
  const cellClickedListener = useCallback((event) => {
    console.log('cellClicked', event);
  }, []);

  const buttonListener = useCallback((e) => {
    gridRef.current.api.deselectAll();
  }, []);

  return (
    <div>
      {/* Example using Grid's API */}
      <button onClick={buttonListener}>Push Me</button>

      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div className="ag-theme-alpine" style={{ width: 1000, height: 1000 }}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true} // Optional - set to 'true' to have rows animate when sorted
          rowSelection="multiple" // Options - allows click selection of rows
          onCellClicked={cellClickedListener} // Optional - registering for Grid Event
        />
      </div>
    </div>
  );
};

export default AGGrid;
