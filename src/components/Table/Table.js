import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { useFilters, useRowSelect, useSortBy, useTable } from "react-table";
import { TableStyles } from "./Table.styles";

const COLUMN_WIDTHS = new Map([
  ["selection", 50],
  ["id", 100],
  ["status", 100],
  ["annotations", 150],
  ["created_on", 100],
]);

const getPropsForColumnCell = (column) => {
  const props = {};

  if (COLUMN_WIDTHS.has(column.id)) {
    props.style = {
      width: COLUMN_WIDTHS.get(column.id),
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

export const Table = observer(({ data, columns, view, onSelectRow }) => {
  const tasks = getRoot(view).tasksStore;
  const tableHead = React.createRef();
  const table = React.createRef();
  const { totalTasks, task, loading } = tasks;
  let currentScroll = 0;

  const hiddenColumns = view.columns.filter((c) => c.hidden).map((c) => c.id);

  console.log({ hiddenColumns });

  const handleScroll = (e) => {
    // console.log(e);
    // e.preserve();
    // if (tableHead.current) {
    //   requestAnimationFrame(() => {
    //     const { scrollTop } = e.target;
    //     Object.assign(tableHead.current?.style, {
    //       transform: `translateY(${scrollTop}px)`
    //     });
    //   })
    // }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { selectedRowIds },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        hiddenColumns: view.root.isLabeling ? [] : hiddenColumns,
        sortBy: [{ id: "id", desc: false }],
      },
    },
    useFilters, // useFilters!
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
              !view.root.isLabeling ? (
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              ) : null,
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row, value }) =>
              !view.root.isLabeling ? (
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
        {view.enableFilters === true ? (
          <div>
            {headerGroups.map((headerGroup) => (
              <div
                {...headerGroup.getHeaderGroupProps()}
                style={{ background: "#ccc" }}
              >
                {headerGroup.headers.map((column) => (
                  <div {...column.getHeaderProps()}>
                    {column.render("Header")}
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
        <div className="dm-content__table" onScroll={handleScroll}>
          <table {...getTableProps()}>
            <thead ref={tableHead} className="dm-content__table-head">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(getPropsForColumnCell(column))}
                    >
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row, i) => {
                prepareRow(row);
                const currentTask = row.original;
                const isCurrent = currentTask === task;
                const rowProps = row.getRowProps({
                  style: {
                    background: isCurrent ? "#efefef" : "none",
                  },
                });
                const onClick = () => {
                  if (!isCurrent) {
                    getRoot(view).tasksStore.setTask(currentTask);
                  }
                };
                return (
                  <tr {...rowProps} onClick={onClick}>
                    {row.cells.map((cell) => {
                      const cellProps = {
                        ...cell.getCellProps(),
                        ...getPropsForColumnCell(cell.column),
                      };

                      const cellContent = cell.render("Cell");

                      return <td {...cellProps}>{cellContent ?? null}</td>;
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
  return (
    <TableStyles className="dm-content">
      {view.root.isLabeling ? (
        listView()
      ) : (
        <>
          {view.type === "list" ? listView() : gridView()}
          <div className="dm-content__statusbar">
            <div>
              Selected {Object.keys(selectedRowIds).length} of {totalTasks}{" "}
              tasks
            </div>
          </div>
        </>
      )}
    </TableStyles>
  );
});
