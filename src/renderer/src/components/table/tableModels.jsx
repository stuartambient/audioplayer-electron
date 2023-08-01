import { useEffect } from 'react';
import { IndeterminateCheckbox } from './IndeterminateCheckbox';

/* SORTING */

export const fuzzySort = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(rowA.columnFiltersMeta[columnId], rowB.columnFiltersMeta[columnId]);
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

/* FILTERING */
export const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the ranking info
  addMeta(itemRank);

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export const defaultColumn = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue();
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue);

    // When the input is blurred, we'll call our table meta's updateData function
    /*   const onBlur = () => {
        ;(table.options.meta as TableMeta).updateData(index, id, value)
      } */

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
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
    header: 'Name',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'afid',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id
      },
      {
        accessorFn: (row) => row.audiofile,
        id: 'audiofile',
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        footer: (props) => props.column.id
      },
      {
        accessorFn: (row) => row.year,
        id: 'year',
        header: 'Full Name',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        filterFn: fuzzyFilter,
        sortingFn: fuzzySort
      },
      columnHelper.accessor('title', {
        header: () => <span>Title</span>,
        footer: (props) => props.column.id,
        filterFn: fuzzyFilter,
        sortingFn: fuzzySort
      }),
      columnHelper.accessor('artist', {
        header: 'Artist',
        footer: (props) => props.column.id,
        filterFn: fuzzyFilter,
        sortingFn: fuzzySort
      }),
      columnHelper.accessor('album', {
        header: 'Album',
        footer: (props) => props.column.id,
        filterFn: fuzzyFilter,
        sortingFn: fuzzySort
      }),
      columnHelper.accessor('genre', {
        header: 'Genre',
        footer: (props) => props.column.id,
        filterFn: fuzzyFilter,
        sortingFn: fuzzySort
      })
    ]
  }
];
