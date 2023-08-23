import { useState, useEffect } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table';
import FilterFunction from './table/FilterFunction';
import IndeterminateCheckbox from './table/IndeterminateCheckbox';
import '../style/TanStackGrid.css';

const TanStackGrid = ({ data, setData }) => {
  const [columnResizeMode, setColumnResizeMode] = useState('onChange');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnPinning, setColumnPinning] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [editedRows, setEditedRows] = useState({});

  /*   <svg width="512" height="512" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="currentColor"
      d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m6.16 12.31c-1.56 0-2.97.58-4.05 1.52L6 13.72V19h5.28l-2.13-2.12c.82-.68 1.85-1.1 3.01-1.1c2.07 0 3.84 1.35 4.45 3.22l1.39-.46c-.81-2.45-3.12-4.23-5.84-4.23Z"
    />
  </svg>; */

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

  const TableCell = ({ getValue, row, column, table }) => {
    const initialValue = getValue();
    const columnMeta = column.columnDef.meta;
    const tableMeta = table.options.meta;
    const [value, setValue] = useState(initialValue);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    const onBlur = () => {
      tableMeta?.updateData(row.index, column.id, value);
    };

    const onClick = (e) => {
      setOpen(() => !open);
    };

    return open ? (
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        onClick={onClick}
      />
    ) : (
      <span onClick={onClick}>{value}</span>
    );
  };

  const defaultColumn = {
    size: 20,
    minSize: 20,
    maxSize: Number.MAX_SAFE_INTEGER
  };

  const columns = [
    {
      id: 'select',
      size: 15,
      minSize: 15,
      maxSize: 15,
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler()
          }}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler()
          }}
        />
      )
    },
    /* columnHelper.accessor('afid', {
      header: 'id'
    }), */
    columnHelper.accessor('audiofile', {
      header: 'File Path'
    }),
    columnHelper.accessor('year', {
      header: 'Year',
      enableSorting: true
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      enableSorting: true,
      cell: TableCell
    }),
    columnHelper.accessor('artist', {
      header: 'Artist',
      enableSorting: true,
      onClick: (e) => console.log('clicked')
    }),
    columnHelper.accessor('album', {
      header: 'Album',
      enableSorting: true
    }),
    columnHelper.accessor('genre', {
      header: 'Genre',
      enableSorting: true
    })
    /*   columnHelper.display({
      id: 'edit',
      cell: EditCell
    }) */
  ];

  const table = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    enableResizing: true,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableColumnResizing: true,
    enableRowSelection: true,
    columnResizeMode: 'onChange',
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    state: {
      columnVisibility: columnVisibility,
      sorting: sorting,
      columnFilters: columnFilters,
      rowSelection: rowSelection
    },
    meta: {
      editedRows,
      setEditedRows,

      updateData: (rowIndex, columnId, value) => {
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value
              };
            }
            return row;
          })
        );
      }
    }

    /*    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
    debugRows: true */
  });
  return (
    <>
      <div className="columns-list" style={{ display: 'flex' }}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={table.getIsAllColumnsVisible()}
              onChange={table.getToggleAllColumnsVisibilityHandler()}
              className="columns-list--chkbox"
            />
            Toggle All
          </label>
        </div>
        {table.getAllLeafColumns().map((column) => {
          return (
            <div key={column.id} className="px-1">
              <label>
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  className="mr-1"
                />
                {column.id}
              </label>
            </div>
          );
        })}
      </div>

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
                      <div onClick={(e) => e.stopPropagation()}>
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
                      /* console.log(cell.getValue(), '----', cell.column.id, '----', cell.id), */
                      /* onClick: table.options.meta.setEditedCells(cell.id), */
                      style: {
                        width: cell.column.getSize()
                        /* whiteSpace: 'nowrap',
                        overflowX: 'hidden' */
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
        <hr />
        {/*<div>{console.log(table.getSelectedRowModel())}</div>
         
        <div className="h-4" />
        <button onClick={() => rerender()} className="border p-2">
          Rerender
        </button> */}
      </div>
    </>
  );
};

export default TanStackGrid;
