import { EyeOutlined } from "@ant-design/icons";
import { Button, Checkbox } from "antd";
import Modal from "antd/lib/modal/Modal";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { useFilters, useFlexLayout, useRowSelect, useTable } from "react-table";
import * as CellViews from "./CellViews";
import { GridView } from "./GridView";
import { ListView } from "./ListView";
import { TableStyles } from "./Table.styles";

const COLUMN_WIDTHS = new Map([
  ["selection", 50],
  ["show-source", 30],
]);

const getColumnWidth = (colID) => {
  const width = COLUMN_WIDTHS.get(colID);
  if (width !== undefined) {
    return {
      width: width,
      minWidth: width,
      maxWidth: width,
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
      ...getColumnWidth("selection"),
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

      Object.assign(col, getColumnWidth(col.id));

      return col;
    })
  );

  result.push({
    id: "show-source",
    title: "Source",
    ...getColumnWidth("show-source"),
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

export const Table = observer(({ data, columns, view, hiddenColumns = [] }) => {
  const { dataStore } = getRoot(view);
  const { total, selected } = dataStore;
  const [showSource, setShowSource] = React.useState();

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
    useRowSelect,
    useFlexLayout,
    (hooks) => {
      hooks.visibleColumns.push(SelectionCell(view, setShowSource));
    }
  );

  const loadMore = React.useCallback(() => {
    view.dataStore.fetch();
  }, [view.dataStore]);

  const isItemLoaded = React.useCallback(
    (index) => {
      const rowExists = !!rows[index];
      const hasNextPage = view.dataStore.hasNextPage;

      return !hasNextPage || !rowExists;
    },
    [rows, view.dataStore.hasNextPage]
  );

  const gridView = () => {
    return (
      <GridView
        rows={rows}
        view={view}
        loadMore={loadMore}
        selected={selected}
        prepareRow={prepareRow}
        isItemLoaded={isItemLoaded}
      />
    );
  };

  const listView = () => {
    return (
      <ListView
        rows={rows}
        view={view}
        loadMore={loadMore}
        selected={selected}
        prepareRow={prepareRow}
        isItemLoaded={isItemLoaded}
        headerGroups={headerGroups}
        getTableProps={getTableProps}
        getTableBodyProps={getTableBodyProps}
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
          {showSource ? JSON.stringify(JSON.parse(showSource), null, "  ") : ""}
        </pre>
      </Modal>
    </TableStyles>
  );
});
