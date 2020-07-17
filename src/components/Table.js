import React from "react";

import {
  useTable,
  useRowSelect,
  useFilters,
  useResizeColumns,
} from "react-table";

import { fuzzyTextFilterFn } from "./GlobalFilter";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input type="checkbox" ref={resolvedRef} {...rest} />
      </>
    );
  }
);

function Table({ columns, data }) {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    selectedFlatRows,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data,
    },
    useFilters, // useFilters!
    useResizeColumns,
    // maybe?
    // useGlobalFilter, // useGlobalFilter!
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  // Render the UI for your table
  return (
    <>
      <table {...getTableProps()} style={{ width: "100%" }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              style={{ background: "#ccc" }}
            >
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>
                  {column.render("Header")}
                  <div>{column.canFilter ? column.render("Filter") : null}</div>

                  {/* this is resize the column code which we may need  */}
                  {/* <div */}
                  {/*   {...column.getResizerProps()} */}
                  {/*   className={`resizer ${column.isResizing ? "isResizing" : ""}`} */}
                  {/* /> */}
                </th>
              ))}
            </tr>
          ))}

          {/* <tr> */}
          {/*   <th colSpan={visibleColumns.length} */}
          {/*     style={{ */}
          {/*       textAlign: 'left', */}
          {/*     }}> */}

          {/* maybe we show that on Ctrl+f? */}
          {/* <GlobalFilter preGlobalFilteredRows={preGlobalFilteredRows} */}
          {/*                   globalFilter={state.globalFilter} */}
          {/*                   setGlobalFilter={setGlobalFilter} */}
          {/* /> */}
          {/* </th> */}
          {/*     </tr> */}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p>Selected Completions: {Object.keys(selectedRowIds).length}</p>
    </>
  );
}

export default Table;
