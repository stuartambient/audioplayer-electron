import { useMemo } from 'react';
import DebouncedInput from './DebouncedInput';

const NumberInput = ({ columnFilterValue, getFacetedMinMaxValues, setFilterValue }) => {
  const minOpt = getFacetedMinMaxValues()?.[0];
  const min = Number(minOpt ?? '');

  const maxOpt = getFacetedMinMaxValues()?.[1];
  const max = Number(maxOpt);

  return (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={min}
          max={max}
          value={columnFilterValue?.[0] ?? ''}
          onChange={(value) => setFilterValue((old) => [value, old?.[1]])}
          placeholder={`Min ${minOpt ? `(${min})` : ''}`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          min={min}
          max={max}
          value={columnFilterValue?.[1] ?? ''}
          onChange={(value) => setFilterValue((old) => [old?.[0], value])}
          placeholder={`Max ${maxOpt ? `(${max})` : ''}`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  );
};

const TextInput = ({
  columnId,
  columnFilterValue,
  columnSize,
  setFilterValue,
  sortedUniqueValues
}) => {
  const dataListId = columnId + 'list';

  return (
    <>
      <datalist id={dataListId}>
        {sortedUniqueValues.slice(0, 5000).map((value) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={columnFilterValue ?? ''}
        onChange={(value) => setFilterValue(value)}
        placeholder={`Search... (${columnSize})`}
        className="w-36 border shadow rounded"
        list={dataListId}
      />
      <div className="h-1" />
    </>
  );
};

export function Filter({ column, table }) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();
  const uniqueValues = column.getFacetedUniqueValues();

  const sortedUniqueValues = useMemo(
    () => (typeof firstValue === 'number' ? [] : Array.from(uniqueValues.keys()).sort()),
    [uniqueValues]
  );

  return typeof firstValue === 'number' ? (
    <NumberInput
      columnFilterValue={columnFilterValue}
      getFacetedMinMaxValues={column.getFacetedMinMaxValues}
      setFilterValue={column.setFilterValue}
    />
  ) : (
    <TextInput
      columnId={column.id}
      columnFilterValue={columnFilterValue}
      columnSize={uniqueValues.size}
      setFilterValue={column.setFilterValue}
      sortedUniqueValues={sortedUniqueValues}
    />
  );
}

export default Filter;
