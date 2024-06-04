import { useMemo } from 'react';
import { CiPlay1 } from 'react-icons/ci';

export const useColumnDefinitions = () => {
  const columnDefs = useMemo(
    () => [
      {
        field: 'Icon',
        cellRenderer: (params) => <CiPlay1 />,
        width: 50,
        editable: false,
        resizable: false
      },
      /* { field: 'select', checkboxSelection: true, maxWidth: 20, resizable: false }, */
      {
        field: 'audiotrack',
        checkboxSelection: true,
        filter: true,
        editable: false,
        rowDrag: true
      },
      {
        field: 'year',
        filter: 'agNumberColumnFilter',
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
      { field: 'title', filter: true },
      { field: 'performers', filter: true },
      { field: 'album', filter: true },
      { field: 'genres', filter: true },
      { field: 'like', editable: true, type: 'bool' },
      { field: 'error', filter: true },
      { field: 'albumArtists', filter: true },
      {
        field: 'audioBitrate',
        filter: true,
        editable: false
        /*  cellStyle: (params) => {
          return !params.colDef.editable ? { backgroundColor: '#2f4f4f', color: '#000000' } : {};
        } */
      },
      {
        field: 'audioSampleRate',
        filter: true,
        editable: false
        /* cellStyle: (params) => {
          return !params.colDef.editable ? { backgroundColor: '#2f4f4f', color: '#000000' } : {};
        } */
      },
      { field: 'codecs', filter: true, editable: false },
      { field: 'bpm', filter: true },
      { field: 'composers', filter: true },
      { field: 'conductor', filter: true },
      { field: 'copyright', filter: true },
      { field: 'comment' },
      { field: 'disc' },
      { field: 'discCount' },
      { field: 'description' },
      { field: 'duration', editable: false },
      { field: 'isCompilation', editable: true, type: 'bool' },
      { field: 'isrc' },
      { field: 'lyrics' },
      { field: 'performersRole' },
      { field: 'pictures', type: 'bool' },
      { field: 'publisher' },
      { field: 'remixedBy' },
      { field: 'replayGainAlbumGain', hide: true },
      { field: 'replayGainAlbumPeak', hide: true },
      { field: 'replayGainTrackGain', hide: true },
      { field: 'replayGainTrackPeak', hide: true },
      { field: 'track' },
      { field: 'trackCount' },
      { field: 'created_datetime' }
    ],
    []
  );
  return columnDefs;
};

export const useColumnTypes = () => {
  const columnTypes = useMemo(() => {
    return {
      bool: {
        cellRenderer: (params) => <span>{params.value === 1 ? 'true' : 'false'}</span>,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: [0, 1] // Use strings for display in the select element
        },
        valueFormatter: (params) => (params.value === 1 ? 'true' : 'false'),
        valueParser: (params) => (params.newValue === 'true' ? 1 : 0),
        editable: true
      }
    };
  }, []);
  return columnTypes;
};
