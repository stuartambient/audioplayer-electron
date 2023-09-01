import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
/* import 'ag-grid-community'; */
import { FaSave } from 'react-icons/fa';
import { ImCancelCircle } from 'react-icons/im';
import CustomToolPanel from './CustomToolPanel';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const AGGrid = ({ data }) => {
  const [rowData, setRowData] = useState();
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const undoRedoCellEditing = true;
  const undoRedoCellEditingLimit = 20;

  useEffect(() => {
    if (data) setRowData(data);
  }, [data]);

  /*   useEffect(() => {
    if (gridApi) {
      gridApi.sizeColumnsToFit();
    }
  }, []); */

  let gridApi;

  const onGridReady = (params) => {
    gridApi = params.api;
    /* console.log('params: ', params, 'current: ', gridRef.current); */
  };

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

  const handleCellEditingStarted = (event) => {
    /* const rowData = event.data;
    console.log('Editing started for row data:', rowData); */
    /* console.log(event.data, '====', gridRef.current.api.getEditingCells()); */
    // Perform your actions here
    return;
  };

  const handleCellValueChanged = (event) => {
    const { api, node, colDef, newValue } = event;

    console.log('field: ', colDef.field);
    console.log('old value: ', event.oldValue);
    console.log('new value: ', event.newValue);
    console.log(event);
    /* const getRowId = (event) => event.rowIndex; */
    const rowNode = gridRef.current.api.getRowNode(event.node.id);
    console.log('event data: ', rowNode);

    // Flash the edited cell
    api.flashCells({
      rowNodes: [node], // Array of rowNodes to flash
      columns: [colDef.field], // Array of column IDs to flash
      flashDelay: 200, // Duration in milliseconds
      fadeDelay: 500 // Duration in milliseconds
    });
  };

  const ActionCellRenderer = ({ data, onCancel, onSave }) => {
    return (
      <div className="action-cell">
        <span onClick={() => onCancel(data)}>
          <ImCancelCircle />
        </span>
        <span onClick={() => onSave(data)}>
          <FaSave />
        </span>
      </div>
    );
  };

  const handleCancel = () => {
    console.log('cancel');
  };

  const handleSave = () => {
    console.log('save');
  };

  const autoSize = useCallback((skipHeader) => {
    const allColumnIds = [];
    gridRef.current.columnApi.getColumns().forEach((column) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }, []);

  const sizeToFit = useCallback(() => {
    gridRef.current.api.sizeColumnsToFit();
  }, []);

  const handleGridMenu = (e) => {
    console.log(e.target.id);
    switch (e.target.id) {
      case 'auto-size-all':
        return autoSize();
      case 'reset-window':
        return sizeToFit();
      default:
        return;
    }
  };

  const columnDefs = useMemo(
    () => [
      { field: 'select', checkboxSelection: true, maxWidth: 20, resizable: false },
      { field: 'audiofile', filter: true, hide: false, editable: false },
      { field: 'year', filter: true, hide: false },
      { field: 'title', filter: true, hide: false },
      { field: 'artist', filter: true, hide: false },
      { field: 'album', filter: true, hide: false },
      { field: 'genre', filter: true, hide: false },
      {
        headerName: 'Actions',
        cellRenderer: ActionCellRenderer,
        cellRendererParams: {
          onCancel: handleCancel,
          onSave: handleSave
        }
      }
    ],
    []
  );

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    editable: true
    /* enableCellChangeFlash: true */
  }));

  /*   const sideBar = useMemo(() => {
    toolPanels: ['columns'];
  }, []); */

  // Example of consuming Grid Event
  const cellClickedListener = useCallback((event) => {
    console.log('cellClicked', /* event, */ gridRef.current.api.getEditingCells());
  }, []);

  const buttonListener = useCallback((e) => {
    gridRef.current.api.deselectAll();
  }, []);

  return (
    <div>
      {/* Example using Grid's API */}
      <button onClick={buttonListener}>Push Me</button>
      <CustomToolPanel onChange={handleColumnPanel} onClick={handleGridMenu} />
      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div className="ag-theme-alpine" style={{ width: '100%', height: 1200 }}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true}
          onFirstDataRendered={() => console.log('first data rendered')}
          /* onGridReady={(e) => console.log('gridReady: ', e)} */ // Optional - set to 'true' to have rows animate when sorted
          onGridReady={onGridReady}
          rowSelection="multiple" // Options - allows click selection of rows
          /* onCellClicked={cellClickedListener}  */ // Optional - registering for Grid Event
          headerHeight={25}
          /* valueCache={true} */
          onCellEditingStarted={handleCellEditingStarted}
          /*  onCellEditingStopped={handleCellEditingStopped} */
          onCellValueChanged={handleCellValueChanged}
          undoRedoCellEditing={undoRedoCellEditing}
          undoRedoCellEditingLimit={undoRedoCellEditingLimit}
        />
      </div>
    </div>
  );
};

export default AGGrid;
