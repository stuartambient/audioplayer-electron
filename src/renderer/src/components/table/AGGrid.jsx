import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
/* import 'ag-grid-community'; */
import { FaSave } from 'react-icons/fa';
import { ImCancelCircle } from 'react-icons/im';
import CustomToolPanel from './CustomToolPanel';
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const AGGrid = ({ data }) => {
  const [originalData, setOriginalData] = useState([]);
  const gridRef = useRef(); // Optional - for accessing Grid's API
  const undoRedoCellEditing = false;
  const editsRef = useRef([]);
  const isUndoAction = useRef(false);

  useEffect(() => {
    if (data) {
      setOriginalData(data);
      console.log(data);
    }
  }, [data]);

  let gridApi;

  const onGridReady = (params) => {
    gridApi = params.api;
  };

  const handleColumnPanel = (e) => {
    const col = e.target.name;
    const column = gridRef.current.columnApi.getColumn(col);
    if (column) {
      gridRef.current.columnApi.setColumnVisible(column, !column.visible);
    }
  };

  const handleCellValueChanged = (event) => {
    const { api, node, colDef, newValue } = event;
    if (isUndoAction.current) {
      return (isUndoAction.current = true);
    }

    const change = {
      rowId: node.id, // Ensure this is how you access the ID correctly
      field: event.colDef.field,
      newValue: event.newValue,
      oldValue: event.oldValue
    };

    editsRef.current.push(change);

    api.flashCells({
      rowNodes: [node], // Array of rowNodes to flash
      columns: [colDef.field], // Array of column IDs to flash
      flashDelay: 200, // Duration in milliseconds
      fadeDelay: 500 // Duration in milliseconds
    });
  };

  const selectedNodes = () => {
    console.log(gridRef.current.api.getSelectedNodes());
  };

  const handleUndoLastEdit = () => {
    /* console.log('ref', editsRef.current); */
    if (editsRef.current.length === 0) return;
    const lastEdit = editsRef.current.pop();
    const rowNode = gridRef.current.api.getRowNode(lastEdit.rowId);
    rowNode.setDataValue(lastEdit.field, lastEdit.oldValue);
    console.log('ref', editsRef.current);
  };

  const handleCancel = (e) => {
    gridRef.current.api.undoCellEditing();
    console.log(originalData);
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
    console.log('target id: ', e.target.id);
    switch (e.target.id) {
      case 'auto-size-all':
        return autoSize();
      case 'reset-window':
        return sizeToFit();
      case 'cancel-all':
        return handleCancel();
      case 'undo-last':
        isUndoAction.current = true;

        return handleUndoLastEdit();
      case 'redo-last':
        return () => console.log('redo-last');
      case 'deselect-all':
        return deselectAll();
      case 'selected-nodes':
        return selectedNodes();
      default:
        return;
    }
  };

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    editable: true
    /* enableCellChangeFlash: true */
  }));

  const columnDefs = useMemo(
    () => [
      { field: 'select', checkboxSelection: true, maxWidth: 20, resizable: false },
      { field: 'audiofile', filter: true, hide: false, editable: false },
      { field: 'year', filter: true, hide: false },
      { field: 'title', filter: true, hide: false },
      { field: 'artist', filter: true, hide: false },
      { field: 'album', filter: true, hide: false },
      {
        field: 'genre',
        filter: true,
        hide: false,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Option 1', 'Option 2', 'Option 3'] // Define your options here
        }
      }
    ],
    []
  );

  // Example of consuming Grid Event
  const cellClickedListener = useCallback((event) => {
    console.log('cellClicked', /* event, */ gridRef.current.api.getEditingCells());
  }, []);

  const deselectAll = useCallback((e) => {
    gridRef.current.api.deselectAll();
  }, []);

  return (
    <div>
      {/* Example using Grid's API */}
      <CustomToolPanel onChange={handleColumnPanel} onClick={handleGridMenu} />
      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div className="ag-theme-alpine-dark" style={{ width: '100%', height: 1200 }}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={originalData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true}
          onFirstDataRendered={() => console.log('Data Rendered')}
          /* onGridReady={(e) => console.log('gridReady: ', e)} */ // Optional - set to 'true' to have rows animate when sorted
          onGridReady={onGridReady}
          rowSelection="multiple" // Options - allows click selection of rows
          /* onCellClicked={cellClickedListener}  */ // Optional - registering for Grid Event
          enableRangeSelection={true}
          headerHeight={25}
          rowMultiSelectWithClick={true}
          /* valueCache={true} */
          //onCellEditingStarted={handleCellEditingStarted}
          /*  onCellEditingStopped={handleCellEditingStopped} */
          onCellValueChanged={handleCellValueChanged}
          //undoRedoCellEditing={undoRedoCellEditing}
          //undoRedoCellEditingLimit={undoRedoCellEditingLimit}
        />
      </div>
    </div>
  );
};

export default AGGrid;
