import { useMemo } from 'react';
import { CiPlay1 } from 'react-icons/ci';

const columnDefs = [
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
  {
    field: 'like',
    /*  cellRenderer: (params) => <span>{params.value ? 'true' : 'false'}</span>,
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
    }, */
    editable: true,
    type: 'bool'
  },
  { field: 'error', filter: true },
  { field: 'albumArtists', filter: true },
  { field: 'audioBitrate', filter: true, editable: false },
  { field: 'audioSamplerate', filter: true, editable: false },
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
  {
    field: 'isCompilation',
    /*  cellRenderer: (params) => {
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
    }, */
    editable: true,
    type: 'bool'
  },
  { field: 'isrc' },
  { field: 'lyrics' },
  { field: 'performersRole' },
  {
    field: 'pictures',
    type: 'bool'
    /* cellRenderer: (params) => <span>{params.value === 1 ? 'true' : 'false'}</span> */
  },
  { field: 'publisher' },
  { field: 'remixedBy' },
  { field: 'replayGainAlbumGain', hide: true },
  { field: 'replayGainAlbumPeak', hide: true },
  { field: 'replayGainTrackGain', hide: true },
  { field: 'replayGainTrackPeak', hide: true },
  { field: 'track' },
  { field: 'trackCount' },
  { field: 'created_datetime' }
];

export default columnDefs;
