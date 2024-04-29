import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
/* import 'ag-grid-community'; */
import { FaSave } from 'react-icons/fa';
import { CiPlay1 } from 'react-icons/ci';
import { ImCancelCircle } from 'react-icons/im';
import CustomToolPanel from './CustomToolPanel';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import './styles/AGGrid.css';

const AGGrid = ({ data }) => {
  const [originalData, setOriginalData] = useState([]);
  const [nodesSelected, setNodesSelected] = useState([]);
  const [isUndoAction, setIsUndoAction] = useState(false);
  const [isRedoAction, setIsRedoAction] = useState(false);

  const gridRef = useRef(); // Optional - for accessing Grid's API
  const undoRedoCellEditing = false;
  const undosRef = useRef([]);
  const redosRef = useRef([]);
  const [undos, setUndos] = useState([]);
  const [redos, setRedos] = useState([]);

  const isRowsSelected = useRef([]);

  useEffect(() => {
    if (data) {
      setOriginalData(data);
    }
  }, [data]);

  /*   useEffect(() => {
    if (nodesSelected.length > 0) {
      console.log('rows selected');
    }
  }, [nodesSelected]); */

  let gridApi;

  const onGridReady = (params) => {
    gridApi = params.api;
  };

  const IconCellRenderer = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CiPlay1 />
    </div>
  );

  const handleColumnPanel = (e) => {
    const col = e.target.name;
    const column = gridRef.current.columnApi.getColumn(col);
    if (column) {
      gridRef.current.columnApi.setColumnVisible(column, !column.visible);
    }
  };

  const handleMultiRowUpdate = (edits) => {
    edits.forEach((edit) => {
      const rowNode = gridRef.current.api.getRowNode(edit.rowId);
      rowNode.setDataValue(edit.field, edit.newValue);
    });
    undosRef.current = [...undosRef.current, ...edits];
  };

  const handleCellValueChanged = useCallback(
    (event) => {
      if (!isUndoAction && !isRedoAction) {
        const { api, node, colDef, newValue } = event;
        const change = {
          rowId: node.id, // Ensure this is how you access the ID correctly
          field: event.colDef.field,
          newValue: event.newValue,
          oldValue: event.oldValue
        };

        /* undosRef.current.push(change); */
        setUndos((prevUndos) => [...prevUndos, change]);

        api.flashCells({
          rowNodes: [node], // Array of rowNodes to flash
          columns: [colDef.field], // Array of column IDs to flash
          flashDelay: 200, // Duration in milliseconds
          fadeDelay: 500 // Duration in milliseconds
        });
      } else {
        setIsUndoAction(false);
        setIsRedoAction(false);
      }
    },
    [isUndoAction, isRedoAction]
  );

  /*   const selectedNodes = () => {
    console.log(gridRef.current.api.getSelectedNodes());
  }; */

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    /* console.log('selected nodes: ', typeof selectedNodes, selectedNodes); */
    if (selectedNodes.length > 1) {
      /* console.log(selectedNodes); */
      /* isRowsSelected.current.push(selectedNodes); */
      setNodesSelected(selectedNodes);
    } else {
      setNodesSelected([]);
    }
  }, []);

  const handleUndoLastEdit = () => {
    //if (undosRef.current.length === 0) return;
    if (undos.length === 0) return;
    setIsUndoAction(true);

    /*     const lastEdit = undosRef.current.pop();
    console.log('last Edit: ', lastEdit); */

    // Push this last edit into the redo stack
    const newUndos = [...undos];
    const lastEdit = newUndos.pop();
    setUndos(newUndos);

    const newRedos = [
      ...redos,
      {
        rowId: lastEdit.rowId,
        field: lastEdit.field,
        oldValue: gridRef.current.api.getValue(
          lastEdit.field,
          gridRef.current.api.getRowNode(lastEdit.rowId)
        ),
        newValue: lastEdit.oldValue
      }
    ];
    setRedos(newRedos);

    const rowNode = gridRef.current.api.getRowNode(lastEdit.rowId);
    rowNode.setDataValue(lastEdit.field, lastEdit.oldValue);
  };

  const handleRedoLastEdit = () => {
    if (redos.length === 0) return;
    setIsRedoAction(true);

    const newRedos = [...redos];
    const lastRedo = newRedos.pop();
    setRedos(newRedos);

    const newUndos = [
      ...undos,
      {
        rowId: lastRedo.rowId,
        field: lastRedo.field,
        oldValue: gridRef.current.api.getValue(
          lastRedo.field,
          gridRef.current.api.getRowNode(lastRedo.rowId)
        ),
        newValue: lastRedo.newValue
      }
    ];
    setUndos(newUndos);

    const rowNode = gridRef.current.api.getRowNode(lastRedo.rowId);
    rowNode.setDataValue(lastRedo.field, lastRedo.oldValue);
  };

  const handleCancel = (e) => {
    gridRef.current.api.undoCellEditing();
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
    switch (e.target.id) {
      case 'auto-size-all':
        return autoSize();
      case 'reset-window':
        return sizeToFit();
      case 'cancel-all':
        return handleCancel();
      case 'save-all':
        if (undosRef.current.length === 0) return;

        const updatesByRow = undosRef.current.reduce((acc, undo) => {
          if (!acc[undo.rowId]) {
            acc[undo.rowId] = {
              id: originalData[undo.rowId].afid,
              changes: {}
            };
          }
          acc[undo.rowId].changes[undo.field] = undo.newValue;

          return acc;
        }, {});
        const saveAll = Object.values(updatesByRow).map((row) => ({
          id: row.id,
          updates: row.changes
        }));
        /* console.log('saveAll: ', saveAll, '---', undosRef.current); */
        return;
      case 'undo-last':
        /* isUndoAction.current = true;
        console.log(undosRef.current); */
        return handleUndoLastEdit();
      case 'redo-last':
        /* console.log('redos: ', redosRef.current); */
        return handleRedoLastEdit();
      case 'deselect-all':
        return deselectAll();
      case 'selected-nodes':
        return selectedNodes();
      default:
        return;
    }
  };

  const getRowId = useMemo(() => (params) => params.data.afid, []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    editable: true
    /* enableCellChangeFlash: true */
  }));

  const columnDefs = useMemo(
    () => [
      {
        field: 'Icon',
        cellRenderer: (params) => <CiPlay1 />,
        width: 50,
        editable: false,
        resizable: false
      },
      { field: 'select', checkboxSelection: true, maxWidth: 20, resizable: false },
      {
        field: 'audiofile',
        filter: true,
        hide: false,
        editable: false
        /*         cellClassRules: {
          'rag-green': (params) => params.value.startsWith('H:/')
        } */
      },
      {
        field: 'year',
        filter: 'agNumberColumnFilter',
        hide: false,
        type: 'numericColumn',
        valueSetter: (params) => {
          const newValue = Number(params.newValue);
          if (!isNaN(newValue) && params.data.year !== newValue) {
            params.data.year = newValue;
            return true; // Indicate the value has been updated
          }
          return false; // No valid update occurred
        }
      },
      { field: 'title', filter: true, hide: false },
      { field: 'artist', filter: true, hide: false },
      { field: 'album', filter: true, hide: false },
      {
        field: 'genre',
        filter: true,
        hide: false
      }
      /*     {
        field: 'Icon',
        cellRenderer: (params) => <CiPlay1 />,
        width: 50,
        editable: false,
        resizable: false
      } */ // Optional: Center the cell content }
    ],
    []
  );

  // Example of consuming Grid Event
  /*   const cellClickedListener = useCallback((event) => {
    console.log('cellClicked', gridRef.current.api.getEditingCells());
  }, []); */

  const deselectAll = useCallback((e) => {
    gridRef.current.api.deselectAll();
    /* isRowsSelected.current = []; */
    setNodesSelected([]);
  }, []);

  return (
    <>
      {/* Example using Grid's API */}
      <CustomToolPanel
        onChange={handleColumnPanel}
        onClick={handleGridMenu}
        onUpdate={handleMultiRowUpdate}
        nodesSelected={nodesSelected}
      />
      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      <div className="ag-theme-alpine-dark" style={{ width: '100%', height: '100%' }}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={originalData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true}
          onSelectionChanged={onSelectionChanged}
          getRowId={getRowId}
          /* onGridReady={(e) => console.log('gridReady: ', e)} */ // Optional - set to 'true' to have rows animate when sorted
          onGridReady={onGridReady}
          rowSelection="multiple" // Options - allows click selection of rows
          /* onCellClicked={cellClickedListener}  */ // Optional - registering for Grid Event
          //enableRangeSelection={true}
          headerHeight={25}
          rowMultiSelectWithClick={true}
          onCellValueChanged={handleCellValueChanged}
          undoRedoCellEditing={false}
        />
      </div>
      {/*       {isRowsSelected.current && isRowsSelected.current.length > 0 && (
        <EditForm
          onUpdate={() => console.log('updating')}
          selectedRowData={isRowsSelected.current}
        />
      )} */}
    </>
  );
};

export default AGGrid;
