import React from "react";
import { Pagination } from "antd";
import {
  useTable,
  useRowSelect,
  useFilters,
  usePagination,
} from "react-table";

import { observer, inject } from "mobx-react";

import { fuzzyTextFilterFn } from "./Filters";

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

const Table = observer(({ columns, data, item, onSelectRow }) => {
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
    page,
    prepareRow,
    state,
    visibleColumns,
    selectedFlatRows,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { selectedRowIds },

    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 20 },
    },
    useFilters, // useFilters!
    // maybe?
    // useGlobalFilter, // useGlobalFilter!
    useRowSelect,
    usePagination,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          ...columns[0],
          // id: "selection",
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              { item.root.mode === "dm" ? <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} /> : null } ID
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row, value }) => (
            <div>
              {item.root.mode === "dm"
                ? <><IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /> {value}</>
                : <span style={{ cursor: 'pointer' }} onClick={() => onSelectRow && onSelectRow(row.original)}>{value}</span>
              }
            </div>
          ),
        },
        ...columns.slice(1),
      ]);
    }
  );

    const gridView = () => {
        return (
            <>
              { item.enableFilters === true ?
                <div>
                  {headerGroups.map((headerGroup) => (
                      <div
                        {...headerGroup.getHeaderGroupProps()}
                        style={{ background: "#ccc" }}
                      >
                        {headerGroup.headers.map((column) => (
                            <div {...column.getHeaderProps()}>
                              {column.render("Header")}                              
                              <div>{column.canFilter ? column.render("Filter") : null}</div>
                            </div>
                        ))}
                      </div>
                  ))}

                </div> : null
              }

              <div className="grid">
                {page.map((row, i) => {
                    prepareRow(row);
                    return (
                        <div {...row.getRowProps()}>
                          {row.cells.map((cell) => {
                              return (
                                  <div {...cell.getCellProps()}>{cell.render("Cell")}</div>
                              );
                          })}
                        </div>
                    );
                })}
              </div>
            </>
        );
    };

    const listView = () => {
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
                      <div>{column.canFilter && item.root.mode === "dm" ? column.render("Filter") : null}</div>
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
              {page.map((row, i) => {
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
          <Pagination
            current={pageIndex}
            total={data.length}
            pageSize={pageSize}
            onChange={(page, size) => { gotoPage(page); setPageSize(size); }}
          />
          <p>Selected Completions: {Object.keys(selectedRowIds).length}</p>
        </>
      );
    };
    
  // Render the UI for your table
    return (item.type === "list") ? listView() : gridView(); 
});

export default Table;
