import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

/* import 'ag-grid-community'; */
import classNames from 'classnames';
import { FaSave } from 'react-icons/fa';
import { CiPlay1 } from 'react-icons/ci';
import { ImCancelCircle } from 'react-icons/im';
import CustomToolPanel from './CustomToolPanel';
import EditForm from './EditForm';
import { useColumnDefinitions, useColumnTypes } from './useTableDefinitions';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import './styles/AGGrid.css';

const AGGrid = ({ data }) => {
  const [originalData, setOriginalData] = useState([]);
  const [nodesSelected, setNodesSelected] = useState([]);
  const [numNodes, setNumNodes] = useState(0);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isUndoAction, setIsUndoAction] = useState(false);
  const [isRedoAction, setIsRedoAction] = useState(false);
  const [columnApi, setColumnApi] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);

  const gridRef = useRef(); // Optional - for accessing Grid's API
  const undoRedoCellEditing = false;

  const [undos, setUndos] = useState([]);
  const [redos, setRedos] = useState([]);

  const isRowsSelected = useRef([]);

  useEffect(() => {
    if (data) {
      setOriginalData(data);
    }
  }, [data]);

  useEffect(() => {
    setNumNodes(nodesSelected.length);
  }, [nodesSelected]);

  let gridApi;

  const onGridReady = (params) => {
    gridApi = params.api;
    const columnApi = params.columnApi;
    setColumnApi(columnApi);
    updateHiddenColumns(columnApi);
    // Get all columns and filter out the hidden ones
    /* const hiddenColumns = columnApi.getAllColumns().filter((col) => !col.isVisible());
    console.log(
      'Hidden Columns:',
      hiddenColumns.map((col) => col.getColId())
    ); */
  };

  const IconCellRenderer = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CiPlay1 />
    </div>
  );

  const togglePanelVisibility = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const handleColumnPanel = (e) => {
    const col = e.target.name;
    const column = gridRef.current.columnApi.getColumn(col);
    if (column) {
      gridRef.current.columnApi.setColumnVisible(column, !column.visible);
    }
  };

  const checkForBool = (value) => {
    if (value === 'true') {
      return 1;
    } else if (value === 'false') {
      return 0;
    } else value;
  };

  const handleMultiRowUpdate = (multiRowChanges) => {
    multiRowChanges.forEach((edit) => {
      console.log('multi change: ', edit);
      // Iterate over all displayed rows
      gridRef.current.api.forEachNodeAfterFilterAndSort((rowNode) => {
        // Match the row using rowIndex
        if (rowNode.rowIndex === edit.rowId) {
          const checkValue = checkForBool(edit.newValue);
          rowNode.setDataValue(edit.field, checkValue);
        }
      });
    });

    // Optionally refresh the grid after updates to ensure it reflects the changes
    gridRef.current.api.refreshCells({ force: true });
  };

  const handleCellValueChanged = useCallback(
    (event) => {
      console.log('Cell value changed: ', event);
      if (!isUndoAction && !isRedoAction) {
        const { api, node, colDef, newValue } = event;
        const change = {
          rowId: node.id, // Ensure this is how you access the ID correctly
          field: event.colDef.field,
          audiotrack: event.data.audiotrack,
          newValue: event.newValue,
          oldValue: event.oldValue
        };

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
    if (undos.length === 0) return;
    setIsUndoAction(true);

    // Push this last edit into the redo stack
    const newUndos = [...undos];
    const lastEdit = newUndos.pop();
    setUndos(newUndos);

    const newRedos = [
      ...redos,
      {
        rowId: lastEdit.rowId,
        field: lastEdit.field,
        audiotrack: lastEdit.audiotrack,
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
        audiotrack: lastRedo.audiotrack,
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

  const booleanCellRenderer = (params) => {
    return <span>{params.value === 1 ? 'true' : 'false'}</span>;
  };

  const autoSize = useCallback((skipHeader = false) => {
    if (gridRef.current) {
      const allColumnIds = gridRef.current.columnApi
        .getColumns()
        .map((column) => column.getColId());
      gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
    }
  }, []);

  const sizeToFit = useCallback(() => {
    gridRef.current.api.sizeColumnsToFit();
  }, []);

  const updateTags = async (arr) => {
    const writeTags = await window.metadataEditingApi.updateTags(arr);
  };

  const handleGridMenu = (e) => {
    switch (e.target.id) {
      case 'auto-size-all':
        return autoSize();
      case 'reset-window':
        return sizeToFit();
      case 'cancel-all':
        return handleCancel();
      case 'save-all':
        if (undos.length === 0) return;

        const updatesByRow = undos.reduce((acc, undo) => {
          if (!acc[undo.rowId]) {
            acc[undo.rowId] = {
              id: originalData[undo.rowId].audiotrack,
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
        /* console.log('save all: ', saveAll); */
        return updateTags(saveAll);
      /*  if (undos.length === 0) return;

        const updatesByRow = undos.reduce((acc, undo) => {
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
        console.log('save all: ', saveAll);
        return; */
      case 'undo-last':
        return handleUndoLastEdit();
      case 'redo-last':
        return handleRedoLastEdit();
      case 'deselect-all':
        return deselectAll();
      case 'selected-nodes':
        return selectedNodes();
      default:
        return;
    }
  };

  const getRowId = useMemo(() => (params) => params.data.audiotrack, []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    editable: true
    /* autoSize: true, */
    /*     autoSizeAllColumns: true */
    /*  singleClickEdit: true */
    /* enableCellChangeFlash: true */
  }));

  const updateHiddenColumns = (api) => {
    const hiddenCols = api.getColumns().filter((col) => !col.isVisible());
    setHiddenColumns(hiddenCols.map((col) => col.getColId()));
  };

  const onColumnVisible = useCallback(() => {
    if (columnApi) {
      updateHiddenColumns(columnApi);
    }
  }, [columnApi]);

  const deselectAll = useCallback((e) => {
    gridRef.current.api.deselectAll();
    /* isRowsSelected.current = []; */
    setNodesSelected([]);
  }, []);

  const gridClassName = classNames('ag-theme-alpine-dark', {
    'no-panel': !isPanelVisible,
    'two-column': numNodes > 1
  });

  const editFormClassname = classNames('edit-form', {
    'no-panel': !isPanelVisible,
    hidden: numNodes <= 1
  });

  return (
    <>
      {/* Example using Grid's API */}
      <CustomToolPanel
        onChange={handleColumnPanel}
        onClick={handleGridMenu}
        /* onUpdate={handleMultiRowUpdate} */
        nodesSelected={nodesSelected}
        hiddenColumns={hiddenColumns}
        isPanelVisible={isPanelVisible}
        togglePanelVisibility={togglePanelVisibility}
      />
      {nodesSelected.length > 1 && (
        <div className={editFormClassname}>
          <EditForm
            onUpdate={handleMultiRowUpdate}
            nodesSelected={nodesSelected}
            hiddenColumns={hiddenColumns}
          />
        </div>
      )}

      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      {/* < div className={isPanelVisible ? 'ag-theme-alpine-dark' : 'ag-theme-alpine-dark no-panel'}> */}
      <div className={gridClassName}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          rowData={originalData} // Row Data for Rows
          columnDefs={useColumnDefinitions()} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true}
          onSelectionChanged={onSelectionChanged}
          columnTypes={useColumnTypes()}
          /* getRowId={getRowId} */
          /* onGridReady={(e) => console.log('gridReady: ', e)} */ // Optional - set to 'true' to have rows animate when sorted
          onGridReady={onGridReady}
          rowSelection="multiple" // Options - allows click selection of rows
          /* onCellClicked={cellClickedListener}  */ // Optional - registering for Grid Event
          //enableRangeSelection={true}
          autoSizeStrategy="fitCellContents"
          headerHeight={25}
          rowMultiSelectWithClick={true}
          onCellValueChanged={handleCellValueChanged}
          onColumnVisible={onColumnVisible}
          undoRedoCellEditing={false}
          rowDragManaged={true}
          rowDragMultiRow={true}
          /*     frameworkComponents={{ booleanCellRenderer: BooleanCellRenderer }} */
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
