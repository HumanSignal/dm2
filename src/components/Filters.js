import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Input, Select, Slider } from "antd";
// A great library for fuzzy filtering/sorting items
import matchSorter from "match-sorter";
import React from "react";

const { Option } = Select;

// Define a default UI for filtering
// function GlobalFilter({
//   preGlobalFilteredRows,
//   globalFilter,
//   setGlobalFilter,
// }) {
//     const count = preGlobalFilteredRows.length;
//     const [value, setValue] = React.useState(globalFilter);
//     const onChange = useAsyncDebounce(value => {
//         setGlobalFilter(value || undefined);
//     }, 200);

//   return (
//     <span>
//       Search:{' '}
//       <input
//         value={value || ""}
//         onChange={e => {
//           setValue(e.target.value);
//           onChange(e.target.value);
//         }}
//         placeholder={`${count} records...`}
//         style={{
//           fontSize: '1.1rem',
//           border: '0',
//         }}
//       />
//     </span>
//   );
// }

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, _filterState, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <Input
      allowClear
      style={{ maxWidth: "300px" }}
      value={filterValue || _filterState.stringValue || ""}
      onChange={(e) => {
        _filterState.update(e.target.value);
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
  column: { filterValue, _filterState, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <Select
      style={{ width: "100%", maxWidth: "300px" }}
      value={filterValue || _filterState.stringValue}
      onChange={(value) => {
        _filterState.update(value);
        setFilter(value || undefined);
      }}
    >
      <Option value="">All</Option>
      {options.map((option, i) => (
        <Option key={i} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  );
}

// This is a custom filter UI that uses a
// slider to set the filter value between a column's
// min and max values
function SliderColumnFilter({
  column: { filterValue, _filterState, setFilter, preFilteredRows, id },
}) {
  // Calculate the min and max
  // using the preFilteredRows

  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  console.log({ min, max });

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <Slider
        style={{ flex: "auto 1 0" }}
        min={min}
        max={max}
        value={filterValue || _filterState.value || min}
        onChange={(value) => {
          const val = parseInt(value, 10);
          _filterState.update(val);
          setFilter(val);
        }}
      />
      <Button
        type="text"
        icon={<CloseCircleOutlined />}
        onClick={() => {
          _filterState.update(min);
          setFilter(min);
        }}
      />
    </div>
  );
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({
  column: { filterValue = [], _filterState, preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <input
        value={filterValue[0] || _filterState.startNum || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          const num = parseInt(val, 10);

          _filterState.update([num, null]);
          setFilter((old = []) => [val ? num : undefined, old[1]]);
        }}
        placeholder={`Min (${min})`}
        style={{
          width: "70px",
          marginRight: "0.5rem",
        }}
      />
      to
      <input
        value={filterValue[1] || _filterState.endNum || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          const num = parseInt(val, 10);

          _filterState.update([null, num]);
          setFilter((old = []) => [old[0], val ? num : undefined]);
        }}
        placeholder={`Max (${max})`}
        style={{
          width: "70px",
          marginLeft: "0.5rem",
        }}
      />
    </div>
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== "number";

export {
  DefaultColumnFilter,
  SelectColumnFilter,
  SliderColumnFilter,
  NumberRangeColumnFilter,
  fuzzyTextFilterFn,
  filterGreaterThan,
};
