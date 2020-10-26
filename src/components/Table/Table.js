import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { useFilters, useRowSelect, useSortBy, useTable } from "react-table";
import { fuzzyTextFilterFn } from "../Filters";

const COLUMN_WIDTHS = new Map([
  ["selection", 50],
  ["id", 100],
  ["status", 100],
  ["annotations", 150],
]);

const getPropsForColumnCell = (cell) => {
  const props = {};

  if (COLUMN_WIDTHS.has(cell.column.id)) {
    props.style = {
      width: COLUMN_WIDTHS.get(cell.column.id),
    };
  }

  return props;
};

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          onClick={(e) => e.stopPropagation()}
        />
      </>
    );
  }
);

export const Table = observer(({ columns, data, item, onSelectRow }) => {
  const tasks = getRoot(item).tasksStore;
  const { totalTasks, pageSize, loading } = tasks;
  let currentScroll = 0;
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

  const loadNextPage = (e) => {
    if (loading) return;

    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollTop > currentScroll) {
      const endReached = scrollHeight - clientHeight - scrollTop < 100;

      if (endReached) {
        tasks.fetchTasks();
      }
    }

    currentScroll = scrollTop;
  };

  // const initialFilters = columns
  //   .filter((c) => c._filterState)
  //   .map((c) => ({
  //     id: c.id ?? c.accessor,
  //     value: c._filterState.value,
  //   }));

  // console.log({initialFilters});

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
      initialState: {
        hiddenColumns: item.root.mode === "dm" ? [] : item.dataFields,
        // filters: initialFilters,
        sortBy: [{ id: "id", desc: false }],
      },
    },
    useFilters, // useFilters!
    // maybe?
    // useGlobalFilter, // useGlobalFilter!
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => {
        return [
          // Let's make a column for selection
          {
            id: "selection",
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps }) =>
              item.root.mode === "dm" ? (
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              ) : null,
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row, value }) =>
              item.root.mode === "dm" ? (
                <>
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />{" "}
                </>
              ) : (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectRow && onSelectRow(row.original)}
                ></span>
              ),
          },
          ...columns,
        ];
      });
    }
  );

  const gridView = () => {
    return (
      <>
        {item.enableFilters === true ? (
          <div>
            {headerGroups.map((headerGroup) => (
              <div
                {...headerGroup.getHeaderGroupProps()}
                style={{ background: "#ccc" }}
              >
                {headerGroup.headers.map((column) => (
                  <div {...column.getHeaderProps()}>
                    {column.render("Header")}
                    <div>
                      {column.canFilter ? column.render("Filter") : null}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid">
          {rows.map((row, i) => {
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
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps()}>
                    {column.render("Header")}
                    <div>
                      {column.canFilter && item.root.mode === "dm"
                        ? column.render("Filter")
                        : null}
                    </div>
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
            {/*   </th> */}
            {/* </tr> */}
          </thead>
        </table>
        <div style={{ flex: 1, overflow: "auto" }} onScroll={loadNextPage}>
          <table style={{ width: "100%" }}>
            <tbody {...getTableBodyProps()}>
              {rows.map((row, i) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => {
                      const task = row.original;
                      getRoot(item).tasksStore.setTask(task);
                    }}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <td {...cell.getCellProps(getPropsForColumnCell(cell))}>
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // Render the UI for your table
  return item.root.mode === "dm" ? (
    <>
      {item.type === "list" ? listView() : gridView()}

      <div style={{ display: "flex", alignItems: "center", paddingTop: 10 }}>
        <div>
          Selected {Object.keys(selectedRowIds).length} of {totalTasks} tasks
        </div>
      </div>
    </>
  ) : (
    listView()
  );
});
