import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

/* import 'ag-grid-community'; */
import classNames from 'classnames';
import { FaSave } from 'react-icons/fa';
import { CiPlay1 } from 'react-icons/ci';
import { ImCancelCircle } from 'react-icons/im';
import CustomLoadingOverlay from './CustomLoadingOverlay';
import CustomToolPanel from './CustomToolPanel';
import EditForm from './EditForm';
import { openChildWindow } from '../ChildWindows/openChildWindow';
import { useColumnDefinitions, useColumnTypes } from './useTableDefinitions';
/* import { handlePicture } from '../../utility/audioUtils'; */
/* import CustomContextMenu from './ContextMenu'; */
import PlayButtonRenderer from './PlayButtonRenderer';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-material.css';

import './styles/AGGrid.css';

const AGGrid = ({ reset, data, playButton }) => {
  const [originalData, setOriginalData] = useState(null);
  const [nodesSelected, setNodesSelected] = useState([]);
  const [numNodes, setNumNodes] = useState();
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isUndoAction, setIsUndoAction] = useState(false);
  const [isRedoAction, setIsRedoAction] = useState(false);
  const [columnApi, setColumnApi] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  /*   const [artistPic, setArtistPic] = useState('');
  const [picture, setPicture] = useState(''); */
  const [roots, setRoots] = useState([]);
  const [imageFolderPath, setImageFolderPath] = useState(null);

  const gridRef = useRef(); // Optional - for accessing Grid's API
  const undoRedoCellEditing = false;

  const [undos, setUndos] = useState([]);
  const [redos, setRedos] = useState([]);

  const isRowsSelected = useRef([]);

  let gridApi;

  /*   useEffect(() => {
    metadataEditingApi.onContextMenuCommand(handleEmbedPicture);

    return () => {
      metadataEditingApi.off('context-menu-command', handleEmbedPicture);
    };
  }, []); */

  /*   useEffect(() => {
    const selected = nodesSelected.map((node) => node.data.audiotrack);
    console.log('selected: ', selected);
  }, [nodesSelected]); */

  /*   useEffect(() => {
    console.log('nodesSelected: ', nodesSelected);
  }, [nodesSelected]); */

  const getUndosLength = () => {
    return undos.length;
  };

  useEffect(() => {
    const loadPreferences = async () => {
      const preferences = await window.metadataEditingApi.getPreferences();
      /* console.log('preferences: ', preferences); */
      setHiddenColumns(preferences.hiddenColumns || []);
      setPrefsLoaded(true);
    };
    loadPreferences();
  }, []);

  useEffect(() => {
    const getRoots = async () => {
      const roots = await metadataEditingApi.getRoots();
      if (roots) setRoots(roots);
    };
    getRoots();
  }, [roots]);

  useEffect(() => {
    const updateColPrefs = async () => {
      await window.metadataEditingApi.savePreferences({ hiddenColumns });
    };
    if (hiddenColumns.length > 0) {
      updateColPrefs();
    }
  }, [hiddenColumns]);

  // Ensure initial column visibility based on preferences
  useEffect(() => {
    if (prefsLoaded && gridRef.current) {
      hiddenColumns.forEach((colId) => {
        const column = gridRef.current.columnApi.getColumn(colId);
        if (column) {
          gridRef.current.columnApi.setColumnVisible(colId, false);
        }
      });
    }
  }, [prefsLoaded, hiddenColumns]);

  useEffect(() => {
    if (reset) {
      setOriginalData(null);
    }
  }, [reset]);

  const resetAudio = () => {
    const event = new Event('resetAudio');
    window.dispatchEvent(event);
  };

  useEffect(() => {
    // Example of resetting audio when loading new data
    // You would call resetAudio in your actual logic where appropriate
    return () => {
      resetAudio();
    };
  }, []);

  const getRowId = useMemo(() => (params) => params.data.track_id, []);

  useEffect(() => {
    if (data && data.length > 0) {
      resetAudio();
      setUndos([]);
      setRedos([]);
      setNodesSelected([]);
      setOriginalData(data);
    }
  }, [data]);

  // Function to dispatch the custom event
  /*   const resetAudio = () => {
    const event = new Event('resetAudio');
    window.dispatchEvent(event);
  }; */

  useEffect(() => {
    setNumNodes(nodesSelected.length);
  }, [nodesSelected]);

  const onGridReady = (params) => {
    /*  console.log('grid ready'); */
    gridApi = params.api;
    const columnApi = params.columnApi;
    /* console.log('column api: ', columnApi); */
    setColumnApi(columnApi);
    /* updateHiddenColumns(columnApi); */

    /* updateHiddenColumns(columnApi); */

    // Get all columns and filter out the hidden ones
    /* const hiddenColumns = columnApi.getAllColumns().filter((col) => !col.isVisible());
    console.log(
      'Hidden Columns:',
      hiddenColumns.map((col) => col.getColId())
    ); */
  };

  useEffect(() => {
    const handleDownloadedImage = async (img) => {
      /* const buffer = handlePicture(img.buffer); */
      /* const myPic = Picture.fromPath(img) */
      console.log(img);
    };

    window.metadataEditingApi.onDownloadedImage(handleDownloadedImage);

    return () => {
      window.metadataEditingApi.off('downloaded-image', handleDownloadedImage);
    };
  }, []);

  useEffect(() => {
    const handleSelectedImage = async (img) => {
      console.log('img: ', img);
    };
    window.metadataEditingApi.onSelectedImage(handleSelectedImage);
    return () => {
      window.metadataEditingApi.off('selected-image', handleSelectedImage);
    };
  }, []);

  const selectedNodesImagePicker = () => {
    let artist, title, path;
    let paths = [];

    const nodes = gridRef.current.api.getSelectedNodes();

    nodes.forEach((node, index) => {
      const currentArtist = (node.data.albumArtists || node.data.performers || '').trim();
      const currentAlbum = (node.data.album || '').trim();
      const currentPath = node.data.audiotrack;

      if (index === 0) {
        artist = currentArtist;
        title = currentAlbum;
      }

      if (artist === currentArtist && title === currentAlbum) {
        paths.push(currentPath);
      } else {
        console.error('Artist or album mismatch detected!');
      }
    });

    return { artist, title, path: paths };
  };

  const handleNumNodes = () => {
    const n = gridRef.current.api.getSelectedNodes();
    return n.length;
  };

  const handleEmbedPicture = (values) => {
    console.log('values-type: ', values.type);
    let artist,
      title,
      path,
      type = values.type;
    /* let artist, title, path, type;
    let paths = []; */
    if (type === 'single-track') {
      artist = values.params.artist;
      title = values.params.album;
      path = values.params.path;
      /* type = values.type; */
    } else if (type === 'search-folder-single') {
      return setImageFolderPath(values.params.path);
    } else if (type === 'search-folder-all-tracks') {
      const numNodes = handleNumNodes();
      if (numNodes < 2) return;
      const nodesObj = selectedNodesImagePicker();
      return setImageFolderPath(nodesObj.path);
    } else if (type === 'all-tracks') {
      const numNodes = handleNumNodes();
      if (numNodes < 2) return;
      const nodesObj = selectedNodesImagePicker();
      artist = nodesObj.artist;
      title = nodesObj.title;
      path = nodesObj.path;
    }
    console.log('artist: ', artist, 'title: ', title, 'path: ', path, 'type: ', type);
    return openChildWindow(
      'cover-search-alt-tags',
      'cover-search-alt-tags',
      {
        width: 700,
        height: 600,
        show: false,
        resizable: true,
        preload: 'coverSearchAlt',
        sandbox: true,
        webSecurity: true,
        contextIsolation: true
      },
      { artist, title, path, type }
    );
  };

  useEffect(() => {
    // Attach the listener when the component mounts
    const handleTagContextMenu = (option) => {
      console.log('option: ', option);
    };
    metadataEditingApi.onContextMenuCommand(handleEmbedPicture);

    // Cleanup the listener when the component unmounts
    return () => {
      metadataEditingApi.off('context-menu-command', handleEmbedPicture);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    const handleTagUpdateStatus = (val) => {
      console.log('tag update stat: ', val);
      if (val === 'image(s) updated' && imageFolderPath) {
        setImageFolderPath(null);
      } else if (val === 'error processing' && imageFolderPath) {
        setImageFolderPath(null);
        console.error(val);
      } else if (val === 'tags updated') {
        deselectAll();
      }
    };

    window.metadataEditingApi.onUpdateTagsStatus(handleTagUpdateStatus);
    return () => {
      window.metadataEditingApi.off('update-tags', handleTagUpdateStatus);
    };
  }, []);

  useEffect(() => {
    if (imageFolderPath) {
      metadataEditingApi.selectImageFromFolder(imageFolderPath);
    }
  }, [imageFolderPath]);

  const IconCellRenderer = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CiPlay1 />
    </div>
  );

  const togglePanelVisibility = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  const loadingOverlayComponent = useMemo(() => {
    return CustomLoadingOverlay;
  }, []);

  useEffect(() => {
    if (reset) {
      gridRef.current.api.showLoadingOverlay();
    }
  });
  /*   const onBtShowLoading = useCallback(() => {
    gridRef.current.api.showLoadingOverlay();
  }, []); */

  /*   const loadingOverlayComponentParams = useMemo(() => {
    return {
      loadingMessage: 'One moment please...'
    };
  }, []); */

  const handleColumnPanel = (e) => {
    const col = e.target.name;
    const column = gridRef.current.columnApi.getColumn(col);
    if (column) {
      const isVisible = column.isVisible();
      gridRef.current.columnApi.setColumnVisible(col, !isVisible);
      updateHiddenColumns(col, !isVisible);
    }
  };

  const handleMultiRowUpdate = (multiRowChanges) => {
    multiRowChanges.forEach((edit) => {
      // Iterate over all displayed rows
      gridRef.current.api.forEachNodeAfterFilterAndSort((rowNode) => {
        // Match the row using rowIndex
        if (rowNode.rowIndex === edit.rowId) {
          switch (edit.newValue) {
            case 'true':
              return rowNode.setDataValue(edit.field, 1);
            case 'false':
              return rowNode.setDataValue(edit.field, 0);
            default:
              rowNode.setDataValue(edit.field, edit.newValue);
          }
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
    console.log('updateTags: ', arr);
    const writeTags = await window.metadataEditingApi.updateTags(arr);
  };

  const handleGridMenu = (e) => {
    switch (e.target.id) {
      case 'auto-size-all':
        return autoSize();
      case 'reset-window':
        return sizeToFit();
      case 'reset':
        return setOriginalData(undefined);
      case 'cancel-all':
        return handleCancel();
      case 'save-all':
        if (undos.length === 0) return;

        const updatesByRow = undos.reduce((acc, undo) => {
          if (!acc[undo.rowId]) {
            acc[undo.rowId] = {
              id: undo.audiotrack,
              track_id: undo.rowId,
              changes: {}
            };
          }
          acc[undo.rowId].changes[undo.field] = undo.newValue;

          return acc;
        }, {});
        const saveAll = Object.values(updatesByRow).map((row) => ({
          id: row.id,
          track_id: row.track_id,
          updates: row.changes
        }));
        return updateTags(saveAll);
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

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    editable: true

    /* autoSize: true, */
    /*     autoSizeAllColumns: true */
    /*  singleClickEdit: true */
    /* enableCellChangeFlash: true */
  }));

  const loadingOverlayComponentParams = useMemo(() => {
    return {
      loadingMessage: 'One moment please...'
    };
  }, []);

  const updateHiddenColumns = (api) => {
    if (!columnApi.getColumns()) return;
    const hiddenCols = columnApi.getColumns().filter((col) => !col.isVisible());
    setHiddenColumns(hiddenCols.map((col) => col.getColId()));
    /*  hiddenColumns.forEach((colId) => {
      console.log('colId: ', colId);
      const column = params.columnApi.getColumn(colId);
      if (column) {
        params.columnApi.setColumnVisible(colId, false);
      }
    }); */
  };

  const onRowClicked = (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.node.setSelected(!event.node.isSelected());
    }
  };

  const handleCellContextMenu = (params) => {
    params.event.preventDefault();
    //if (params.colDef.field === 'pictures') {
    const album = params.data.album ? params.data.album : '';
    const artist = params.data.albumArtists
      ? params.data.albumArtists
      : params.data.performers
      ? params.data.performers
      : '';
    const path = params.data.audiotrack;
    window.metadataEditingApi.showContextMenu({ artist, album, path }, 'picture');
    /* metadataEditingApi.onContextMenuCommand(handleEmbedPicture);
    return () => {
      metadataEditingApi.off('context-menu-command', handleEmbedPicture);
    }; */
    //}
  };

  /*   const loadingOverlayComponent = useMemo(() => {
    return CustomLoadingOverlay;
  }, []); */

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
        undos={undos.length}
      />
      {nodesSelected.length > 1 && (
        <div className={editFormClassname}>
          <EditForm
            onUpdate={handleMultiRowUpdate}
            nodesSelected={nodesSelected}
            hiddenColumns={hiddenColumns}
            getSelectedNodes={selectedNodesImagePicker}
          />
        </div>
      )}

      {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
      {/* < div className={isPanelVisible ? 'ag-theme-alpine-dark' : 'ag-theme-alpine-dark no-panel'}> */}
      <div className={gridClassName} style={{ width: '100%', height: '100%' }}>
        <AgGridReact
          ref={gridRef} // Ref for accessing Grid's API
          /* rowModelType="viewport" */
          rowData={originalData} // Row Data for Rows
          columnDefs={useColumnDefinitions()} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true}
          onSelectionChanged={onSelectionChanged}
          columnTypes={useColumnTypes()}
          components={{ PlayButtonRenderer }}
          getRowId={getRowId}
          /* onGridReady={(e) => console.log('gridReady: ', e)} */ // Optional - set to 'true' to have rows animate when sorted
          onGridReady={onGridReady}
          rowSelection="multiple" // Options - allows click selection of rows
          suppressRowClickSelection={true}
          /* onCellClicked={cellClickedListener}  */ // Optional - registering for Grid Event
          //enableRangeSelection={true}
          /* getRowNodeId={getRowNodeId} */
          autoSizeStrategy="fitCellContents"
          rowMultiSelectWithClick={true}
          onCellValueChanged={handleCellValueChanged}
          onColumnVisible={onColumnVisible}
          undoRedoCellEditing={false}
          rowDragManaged={true}
          rowDragMultiRow={true}
          onRowClicked={onRowClicked}
          loadingOverlayComponent={loadingOverlayComponent}
          loadingOverlayComponentParams={loadingOverlayComponent}
          maintainColumnOrder={true}
          headerHeight={50}
          accentedSort={true}
          multiSortKey="ctrl"
          suppressMaintainUnsortedOrder={true}
          onCellContextMenu={handleCellContextMenu}
          /* loadingOverlayComponent={loadingOverlayComponent}
          loadingOverlayComponentParams={loadingOverlayComponentParams} */
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
