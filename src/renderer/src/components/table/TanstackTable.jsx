import { useState, useReducer, useEffect } from 'react';

import {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';

import styled from '@emotion/styled';
import { useSkipper } from './hooks';
import { columns, defaultColumn, fuzzyFilter, getTableMeta } from './tableModels';
import DebouncedInput from './DebouncedInput';
import ActionButtons from './ActionButtons';
import CustomTable from './CustomTable';

const Styles = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }
    }

    td {
      input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`;

export const TanstackTable = ({ data }) => {
  const rerender = useReducer(() => ({}), {})[1];

  /*   const [data, setData] = useState(makeData(1000)); */
  /* const refreshData = () => setData(makeData(1000)); */

  const [columnVisibility, setColumnVisibility] = useState({});
  const [grouping, setGrouping] = useState([]);
  const [isSplit, setIsSplit] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  /* const [columnPinning, setColumnPinning] = useState({}); */
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    autoResetPageIndex,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    /* onColumnPinningChange: setColumnPinning, */
    onRowSelectionChange: setRowSelection,
    // Provide our updateData function to our table meta
    meta: getTableMeta(data, skipAutoResetPageIndex),
    state: {
      grouping,
      columnFilters,
      globalFilter,
      columnVisibility,
      /* columnPinning, */
      rowSelection
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true
  });

  useEffect(() => {
    if (table.getState().columnFilters[0]?.id === 'fullName') {
      if (table.getState().sorting[0]?.id !== 'fullName') {
        table.setSorting([{ id: 'fullName', desc: false }]);
      }
    }
  }, [table.getState().columnFilters[0]?.id]);

  const randomizeColumns = () => {
    table.setColumnOrder(faker.helpers.shuffle(table.getAllLeafColumns().map((d) => d.id)));
  };

  return (
    <Styles>
      <div className="p-2 grid grid-cols-4 gap-4">
        <div className="p-2">
          Search:
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => setGlobalFilter(String(value))}
            className="mx-1 p-2 font-lg shadow border border-block"
            placeholder="Search all columns..."
          />
        </div>
        <div className="p-2 inline-block border border-black shadow rounded">
          <div className="px-1 border-b border-black">
            <label>
              <input
                type="checkbox"
                checked={table.getIsAllColumnsVisible()}
                onChange={table.getToggleAllColumnsVisibilityHandler()}
                className="mr-1"
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
          <div>
            <input
              type="checkbox"
              checked={isSplit}
              onChange={(e) => setIsSplit(e.target.checked)}
              className="mx-1"
            />
            Split Mode
          </div>
          <button onClick={randomizeColumns} className="border rounded p-1">
            Shuffle Columns
          </button>
        </div>
      </div>
      <div className={`flex ${isSplit ? 'gap-4' : ''}`}>
        {isSplit ? <CustomTable table={table} tableGroup="left" /> : null}
        <CustomTable table={table} tableGroup={isSplit ? 'center' : undefined} />
        {isSplit ? <CustomTable table={table} tableGroup="right" /> : null}
      </div>
      <div className="p-2" />
      <ActionButtons
        getSelectedRowModel={table.getSelectedRowModel}
        hasNextPage={table.getCanNextPage()}
        hasPreviousPage={table.getCanPreviousPage()}
        nextPage={table.nextPage}
        pageCount={table.getPageCount()}
        pageIndex={table.getState().pagination.pageIndex}
        pageSize={table.getState().pagination.pageSize}
        previousPage={table.previousPage}
        /*  refreshData={refreshData} */
        rerender={rerender}
        rowSelection={rowSelection}
        setPageIndex={table.setPageIndex}
        setPageSize={table.setPageSize}
        totalRows={table.getPrePaginationRowModel().rows.length}
      />
      <div className="p-2" />
      <pre>{JSON.stringify(table.getState(), null, 2)}</pre>
    </Styles>
  );
};

export default TanstackTable;
