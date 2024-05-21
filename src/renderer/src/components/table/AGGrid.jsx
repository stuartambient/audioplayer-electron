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

  /*   const handleColumnPanel = (e) => {
    const col = e.target.name;
    const column = gridRef.current.columnApi.getColumn(col);
    if (column) {
      const newVisibility = !gridRef.current.columnApi
        .getColumnState()
        .find((colState) => colState.colId === col).hide;
      gridRef.current.columnApi.setColumnVisible(column, newVisibility);
      setFields((prevFields) =>
        prevFields.map((field) =>
          field.name === col ? { ...field, defaultChecked: newVisibility } : field
        )
      );
    }
  }; */

  const handleMultiRowUpdate = (multiRowChanges) => {
    multiRowChanges.forEach((edit) => {
      // Iterate over all displayed rows
      gridRef.current.api.forEachNodeAfterFilterAndSort((rowNode) => {
        // Match the row using rowIndex
        if (rowNode.rowIndex === edit.rowId) {
          // Apply the edit
          rowNode.setDataValue(edit.field, edit.newValue);
        }
      });
    });

    // Optionally refresh the grid after updates to ensure it reflects the changes
    gridRef.current.api.refreshCells({ force: true });
  };

  const handleCellValueChanged = useCallback(
    (event) => {
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

  /*   const autoSize = useCallback((skipHeader) => {
    const allColumnIds = [];
    gridRef.current.columnApi.getColumns().forEach((column) => {
      allColumnIds.push(column.getId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }, []); */

  const autoSize = useCallback((skipHeader = false) => {
    if (gridRef.current) {
      const allColumnIds = gridRef.current.columnApi
        .getAllColumns()
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
    editable: true,
    autoSize: true,
    autoSizeAllColumns: true
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
        field: 'audiotrack',
        filter: true,
        hide: false,
        editable: false,
        rowDrag: true
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
      { field: 'performers', filter: true, hide: false },
      { field: 'album', filter: true, hide: false },
      { field: 'genres', filter: true, hide: false },
      {
        field: 'like',
        cellRenderer: (params) => <span>{params.value ? 'true' : 'false'}</span>,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['true', 'false']
        },
        valueParser: (params) => {
          return params.newValue === 'true';
        },
        valueSetter: (params) => {
          params.data.like = params.newValue ? 1 : 0;
          return true;
        },
        valueGetter: (params) => {
          return params.data.like === 1;
        },
        editable: true
      },
      { field: 'error', filter: true, hide: false },
      { field: 'albumArtists', filter: true, hide: false },
      { field: 'audioBitrate', filter: true, editable: false, hide: false },
      { field: 'audioSamplerate', filter: true, editable: false, hide: false },
      { field: 'codecs', filter: true, editable: false, hide: false },
      { field: 'bpm', filter: true },
      { field: 'composers', filter: true },
      { field: 'conductor', filter: true },
      { field: 'copyright', filter: true },
      { field: 'comment' },
      { field: 'disc' },
      { field: 'discCount' },
      { field: 'description' },
      { field: 'duration', editable: false },
      {
        field: 'isCompilation',
        cellRenderer: (params) => {
          console.log('Rendering value:', params.value);
          return <span>{params.value === 1 ? 'true' : 'false'}</span>;
        },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['true', 'false']
        },
        valueParser: (params) => {
          console.log('Parsing new value:', params.newValue);
          return params.newValue === 'true' ? 1 : 0;
        },
        valueSetter: (params) => {
          console.log('Setting new value:', params.newValue);
          if (params.newValue === 'true' || params.newValue === 'false') {
            params.data.isCompilation = params.newValue === 'true' ? 1 : 0;
            return true;
          }
          return false;
        },
        valueGetter: (params) => {
          console.log('Getting value for rendering:', params.data.isCompilation);
          return params.data.isCompilation;
        },
        editable: true
      },
      { field: 'isrc' },
      { field: 'lyrics' },
      { field: 'performersRole' },
      {
        field: 'pictures',
        cellRenderer: (params) => <span>{params.value === 1 ? 'true' : 'false'}</span>
      },
      { field: 'publisher' },
      { field: 'remixedBy' },
      { field: 'replayGainAlbumGain', hide: true },
      { field: 'replayGainAlbumPeak', hide: true },
      { field: 'replayGainTrackGain', hide: true },
      { field: 'replayGainTrackPeak', hide: true },
      { field: 'title', filter: true },
      { field: 'track' },
      { field: 'trackCount' },
      { field: 'year' },
      { field: 'created_datetime' }

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
