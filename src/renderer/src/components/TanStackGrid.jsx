import { useState } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table';
import FilterFunction from './table/FilterFunction';
import '../style/TanStackGrid.css';

const TanStackGrid = ({ data }) => {
  const [columnResizeMode, setColumnResizeMode] = useState('onChange');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnPinning, setColumnPinning] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
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

  const columns = [
    columnHelper.accessor('afid', {
      header: 'id'
    }),
    columnHelper.accessor('audiofile', {
      header: 'audiofile'
    }),
    columnHelper.accessor('year', {
      header: 'Year',
      enableSorting: true
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      enableSorting: true
    }),
    columnHelper.accessor('artist', {
      header: 'Artist',
      enableSorting: true
    }),
    columnHelper.accessor('album', {
      header: 'Album',
      enableSorting: true
    }),
    columnHelper.accessor('genre', {
      header: 'Genre',
      enableSorting: true
    })
  ];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableResizing: true,
    /* columnResizeMode: 'onChange', */
    /* getFilteredRowModel: getFilteredRowModel(), */
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    state: {
      /* columnFilters,
      columnVisibility,
      columnPinning,
      rowSelection */
      sorting: sorting,
      columnFilters: columnFilters
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true
  });
  return (
    <div className="p-2">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  {...{
                    key: header.id,
                    colSpan: header.colSpan,
                    onClick: header.column.getToggleSortingHandler()
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}

                  <div
                    {...{
                      onMouseDown: header.getResizeHandler(),
                      onTouchStart: header.getResizeHandler(),
                      className: `resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`,
                      style: {
                        transform:
                          columnResizeMode === 'onEnd' && header.column.getIsResizing()
                            ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
                            : ''
                      }
                    }}
                  />
                  {{ asc: '   up', desc: '   down' }[header.column.getIsSorted() ?? null]}
                  {header.column.getCanFilter() ? (
                    <div>
                      <FilterFunction column={header.column} table={table} />
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  {...{
                    key: cell.id,
                    style: {
                      width: cell.column.getSize()
                    }
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="h-4" />
      <button onClick={() => rerender()} className="border p-2">
        Rerender
      </button>
    </div>
  );
};

export default TanStackGrid;
