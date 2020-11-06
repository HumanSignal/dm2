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

    return (
      <>
        <Checkbox
          ref={resolvedRef}
          {...rest}
          indeterminate={indeterminate}
          onClick={(e) => e.stopPropagation()}
        />
      </>
    );
  }
);

const SelectionCell = (view) => (columns) => {
  const result = [];

  if (!view.root.isLabeling) {
    result.push({
      id: "selection",
      Header: ({ getToggleAllRowsSelectedProps }) => (
        <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
      ),
      Cell: ({ row: { getToggleRowSelectedProps } }) => (
        <IndeterminateCheckbox {...getToggleRowSelectedProps()} />
      ),
    });
  }

  result.push(...columns);

  return result;
};

export const Table = observer(
  ({ data, columns, view, onSelectRow, hiddenColumns = [] }) => {
    const { dataStore } = getRoot(view);
    const tableHead = React.createRef();
    const { total, selected } = dataStore;

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
        hooks.visibleColumns.push(SelectionCell(view));
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
          selected={selected}
          onScroll={handleScroll}
        />
      );
    };

    React.useEffect(() => {
      setHiddenColumns(hiddenColumns);
    }, [setHiddenColumns, hiddenColumns]);

    React.useEffect(() => {
      console.log(selectedRowIds);
    }, [selectedRowIds]);

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
                Selected {Object.keys(selectedRowIds).length} of {total} items
              </div>
            </div>
          </>
        )}
      </TableStyles>
    );
  }
);
