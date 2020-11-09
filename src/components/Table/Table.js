import { EyeOutlined } from "@ant-design/icons";
import { Button, Checkbox } from "antd";
import Modal from "antd/lib/modal/Modal";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { useFilters, useRowSelect, useSortBy, useTable } from "react-table";
import * as CellViews from "./CellViews";
import { ListView } from "./ListView";
import { TableStyles } from "./Table.styles";

const COLUMN_WIDTHS = new Map([
  ["selection", 50],
  ["show-source", 30],
]);

const getColumnWidth = (colID) => {
  if (COLUMN_WIDTHS[colID]) {
    return {
      width: COLUMN_WIDTHS[colID],
      minWidth: COLUMN_WIDTHS[colID],
      maxWidth: COLUMN_WIDTHS[colID],
    };
  }

  return {};
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

const SelectionCell = (view, setShowSource) => (columns) => {
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

  result.push(
    ...columns.map((col) => {
      if (CellViews[col.type]) {
        Object.assign(col, { Cell: CellViews[col.type] });
      }

      console.log("Column ID", col.id);
      Object.assign(col, getColumnWidth(col.id));

      return col;
    })
  );

  result.push({
    id: "show-source",
    ...getColumnWidth("show-source"),
    Header: ({ getToggleAllRowsSelectedProps }) => "Source",
    Cell: ({ row: { original } }) => (
      <Button
        type="link"
        onClick={(e) => {
          e.stopPropagation();
          setShowSource(original.source);
        }}
      >
        <EyeOutlined />
      </Button>
    ),
  });

  return result;
};

export const Table = observer(
  ({ data, columns, view, onSelectRow, hiddenColumns = [] }) => {
    const { dataStore } = getRoot(view);
    const tableHead = React.createRef();
    const { total, selected } = dataStore;
    const [showSource, setShowSource] = React.useState();

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
          hiddenColumns,
        },
      },
      useFilters, // useFilters!
      useSortBy,
      useRowSelect,
      (hooks) => {
        hooks.visibleColumns.push(SelectionCell(view, setShowSource));
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
        <Modal
          visible={!!showSource}
          onOk={() => setShowSource("")}
          onCancel={() => setShowSource("")}
        >
          <pre>
            {showSource
              ? JSON.stringify(JSON.parse(showSource), null, "  ")
              : ""}
          </pre>
        </Modal>
      </TableStyles>
    );
  }
);
