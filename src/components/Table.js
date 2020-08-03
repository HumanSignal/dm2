import React from "react";
import { Pagination } from "antd";
import {
  useTable,
  useRowSelect,
  useFilters,
  usePagination,
  useSortBy,
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

const Table = inject('store')(observer(({ store, columns, data, item, onSelectRow }) => {
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
    pageCount,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 20,
        hiddenColumns: item.root.mode === "dm" ? [] : item.dataFields,
        filters: columns
          .filter(c => c._filterState)
          .map(c => ({ id: c.id || c.accessor, value: c._filterState.value })),
        sortBy: [{ id: 'id', desc: false }],
      },
    },
    useFilters, // useFilters!
    // maybe?
    // useGlobalFilter, // useGlobalFilter!
    useSortBy,
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
               ? <><span style={{ position: "relative", top: "1px" }}><IndeterminateCheckbox {...row.getToggleRowSelectedProps()} /></span> {value}</>
               : <span style={{ cursor: 'pointer', color: "rgb(18, 129, 239)", borderBottom: "1px dashed rgb(18, 129, 239)" }}
                       onClick={() => onSelectRow && onSelectRow(row.original)}>{value}</span>
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
          <table {...getTableProps()} style={{ width: "100%", borderTop: "1px solid #f0f0f0", borderRight: "1px solid #f0f0f0", borderRadiusRight: "2px" }}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
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
                  const style = (store && store.mode !== "dm" && store.tasksStore.selectedTaskID === row.values.id) ?
                        { background: "#ffffb8" } : null;
                return (
                  <tr {...row.getRowProps()} style={style}>
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
            current={pageIndex + 1}
            total={pageCount * pageSize}
            pageSize={pageSize}
            size="small"
            onChange={(page, size) => { gotoPage(page - 1); setPageSize(size); }}
          />
          { store.mode === "dm" ?
            <p>Selected Completions: {Object.keys(selectedRowIds).length}</p>
            : null
          }
        </>
      );
    };
    
  // Render the UI for your table
    return (item.root.mode === "dm") ?
        (item.type === "list") ?
          listView() :
          gridView()
        : listView(); 
}));

export default Table;
