import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  useReactTable
} from '@tanstack/react-table';
import '../style/TanStackGrid.css';

const TanStackGrid = ({ data }) => {
  const [columnResizeMode, setColumnResizeMode] = useState('onChange');
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
      cell: (info) => info.getValue()
    }),
    columnHelper.accessor((row) => row.audiofile, {
      id: 'Audiofile',
      cell: (info) => <i>{info.getValue()}</i>,
      header: () => <span>audiofile</span>,
      footer: (info) => info.column.id
    }),
    columnHelper.accessor('year', {
      header: () => 'Year',
      enableResizing: true,
      size: '200',
      minSize: '100',
      cell: (info) => info.renderValue(),
      footer: (info) => info.column.id,
      getResizeHandler: () => 'onMouseDown'
    }),
    columnHelper.accessor('title', {
      header: () => <span>Title</span>,
      footer: (info) => info.column.id
    }),
    columnHelper.accessor('artist', {
      header: 'Artist',
      footer: (info) => info.column.id
    }),
    columnHelper.accessor('album', {
      header: 'Album',
      footer: (info) => info.column.id
    }),
    columnHelper.accessor('genre', {
      header: 'Genre',
      footer: (info) => info.column.id
    })
  ];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableResizing: true,
    columnResizeMode: 'onChange',
    /*     state: {
      sorting
    }, */
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    debugTable: true
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
                    colSpan: header.colSpan
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
