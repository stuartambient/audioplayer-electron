import { sortingFns, createColumnHelper } from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { rankItem, compareItems } from '@tanstack/match-sorter-utils';
import IndeterminateCheckbox from './IndeterminateCheckbox';

const AudioFile = {
  afid: '',
  audiofile: '',
  year: '',
  title: '',
  artist: '',
  album: '',
  genre: ''
};

const columnHelper = createColumnHelper(AudioFile);

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the ranking info
  addMeta(itemRank);

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export const fuzzySort = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(rowA.columnFiltersMeta[columnId], rowB.columnFiltersMeta[columnId]);
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

// Give our default column cell renderer editing superpowers!
export const defaultColumn = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue();
    // We need to keep and update the state of the cell normally
    const [value, setValue] = useState(initialValue);

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta.updateData(index, id, value);
    };

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return <input value={value} onChange={(e) => setValue(e.target.value)} onBlur={onBlur} />;
  }
};

export const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <IndeterminateCheckbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <div className="px-1">
        <IndeterminateCheckbox
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    )
  },

  {
    id: 'afid',
    accessorFn: (row) => row.afid,
    header: 'afid',
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id
  },
  {
    id: 'audiofile',
    accessorFn: (row) => row.audiofile,

    cell: (info) => info.getValue(),
    header: 'file',
    footer: (props) => props.column.id
  },
  {
    id: 'year',
    accessorFn: (row) => row.year,

    header: 'year',
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
    filterFn: fuzzyFilter,
    sortingFn: fuzzySort
  },
  {
    id: 'title',
    accessorFn: (row) => row.title,
    header: 'title',
    footer: (props) => props.column.id,
    filterFn: fuzzyFilter,
    sortingFn: fuzzySort
  },
  {
    id: 'artist',
    accessorFn: (row) => row.artist,
    header: 'Artist',
    footer: (props) => props.column.id,
    filterFn: fuzzyFilter,
    sortingFn: fuzzySort
  },
  {
    id: 'album',
    accessorFn: (row) => row.album,
    header: 'Album',
    footer: (props) => props.column.id,
    filterFn: fuzzyFilter,
    sortingFn: fuzzySort
  },
  {
    id: 'genre',
    accessorFn: (row) => row.genre,
    header: 'Genre',
    footer: (props) => props.column.id,
    filterFn: fuzzyFilter,
    sortingFn: fuzzySort
  }
];

export const getTableMeta = (setData, skipAutoResetPageIndex) => ({
  updateData: (rowIndex, columnId, value) => {
    // Skip age index reset until after next rerender
    skipAutoResetPageIndex();
    setData((old) =>
      old.map((row, index) => {
        if (index !== rowIndex) return row;

        return {
          ...old[rowIndex],
          [columnId]: value
        };
      })
    );
  }
});
