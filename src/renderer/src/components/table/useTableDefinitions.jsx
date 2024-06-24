import { useMemo } from 'react';
import PlayButtonRenderer from './PlayButtonRenderer';
import { CiPlay1 } from 'react-icons/ci';

export const useColumnDefinitions = () => {
  const columnDefs = useMemo(
    () => [
      {
        field: 'playing',
        width: 70,
        editable: false,
        resizable: false,
        headerName: 'Play',
        cellRenderer: 'PlayButtonRenderer'
      },
      /* { field: 'select', checkboxSelection: true, maxWidth: 20, resizable: false }, */
      {
        field: 'audiotrack',
        checkboxSelection: true,
        filter: true,
        editable: false,
        rowDrag: true
      },
      { field: 'title', filter: true },
      { field: 'performers', filter: true },
      { field: 'performersRole' },
      { field: 'albumArtists', filter: true },
      { field: 'album', filter: true },
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
      { field: 'genres', filter: true },
      { field: 'composers', filter: true },
      { field: 'conductor', filter: true },
      { field: 'comment' },
      { field: 'description' },
      { field: 'disc' },
      { field: 'discCount' },
      { field: 'track' },
      { field: 'trackCount' },
      { field: 'isCompilation', editable: true, type: 'bool' },
      { field: 'publisher' },
      { field: 'isrc' },
      { field: 'copyright', filter: true },
      { field: 'pictures', type: 'bool' },
      { field: 'duration', editable: false },
      { field: 'bpm', filter: true },
      { field: 'lyrics' },
      { field: 'remixedBy' },
      { field: 'like', editable: true, type: 'bool' },
      { field: 'error', filter: true },
      {
        field: 'audioBitrate',
        filter: true,
        editable: false
      },
      {
        field: 'audioSampleRate',
        filter: true,
        editable: false
      },
      { field: 'codecs', filter: true, editable: false },

      { field: 'replayGainAlbumGain', hide: true },
      { field: 'replayGainAlbumPeak', hide: true },
      { field: 'replayGainTrackGain', hide: true },
      { field: 'replayGainTrackPeak', hide: true },
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
