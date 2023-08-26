import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
/* import 'ag-grid-community'; */
import CustomToolPanel from './CustomToolPanel';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const AGGrid = ({ data }) => {
  const [rowData, setRowData] = useState();
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (data) setRowData(data);
  }, [data]);

  /*   useEffect(() => {
    if (gridRef.current) {
      console.log(gridRef.current);
    }
  }, [gridRef.current]); */

  const handleColumnPanel = (e) => {
    /* console.log('checkbox: ', e.target.name, gridRef.current.columnApi); */
    const col = e.target.name;
    const column = gridRef.current.columnApi.getColumn(col);
    if (column) {
      gridRef.current.columnApi.setColumnVisible(column, !column.visible);
    }
  };

  const columnDefs = useMemo(
    () => [
      { field: 'select', checkboxSelection: true, maxWidth: 20 },
      { field: 'audiofile', filter: true, hide: false },
      { field: 'year', filter: true, hide: false },
      { field: 'title', filter: true, hide: false },
      { field: 'artist', filter: true, hide: false },
      { field: 'album', filter: true, hide: false },
      { field: 'genre', filter: true, hide: false }
    ],
    []
  );

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true
  }));

  /*   const sideBar = useMemo(() => {
    toolPanels: ['columns'];
  }, []); */

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
      <CustomToolPanel onClick={handleColumnPanel} />
      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div className="ag-theme-alpine" style={{ width: 1200, height: 1200 }}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true}
          /* onGridReady={(e) => console.log('gridReady: ', e)} */ // Optional - set to 'true' to have rows animate when sorted
          rowSelection="multiple" // Options - allows click selection of rows
          onCellClicked={cellClickedListener} // Optional - registering for Grid Event
        />
      </div>
    </div>
  );
};

export default AGGrid;
