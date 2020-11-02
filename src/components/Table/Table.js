import { Checkbox } from "antd";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { useFilters, useRowSelect, useSortBy, useTable } from "react-table";
import { ListView } from "./ListView";
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
        <Checkbox
          ref={resolvedRef}
          {...rest}
          onClick={(e) => e.stopPropagation()}
        />
      </>
    );
  }
);

export const Table = observer(
  ({ data, columns, view, onSelectRow, hiddenColumns = [] }) => {
    const tasks = getRoot(view).tasksStore;
    const tableHead = React.createRef();
    const { totalTasks, task } = tasks;

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
      setHiddenColumns,
      state: { selectedRowIds },
    } = useTable(
      {
        columns,
        data,
        initialState: {
          sortBy: [{ id: "id", desc: false }],
          hiddenColumns,
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
              Cell: ({ row }) =>
                !view.root.isLabeling ? (
                  <>
                    <IndeterminateCheckbox
                      {...row.getToggleRowSelectedProps()}
                    />{" "}
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
        <ListView
          getTableProps={getTableProps}
          getTableBodyProps={getTableBodyProps}
          getPropsForColumnCell={getPropsForColumnCell}
          tableHead={tableHead}
          prepareRow={prepareRow}
          headerGroups={headerGroups}
          rows={rows}
          view={view}
          task={task}
          onScroll={handleScroll}
        />
      );
    };

    React.useEffect(() => {
      console.log("set hidden columns");
      setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, hiddenColumns]);

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
  }
);
