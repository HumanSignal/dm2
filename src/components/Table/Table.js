import { Button, Checkbox, Tag, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { RiCodeSSlashLine } from "react-icons/ri";
import { VscQuestion } from "react-icons/vsc";
import { useFlexLayout, useRowSelect, useTable } from "react-table";
import * as CellViews from "./CellViews";
import { GridView } from "./GridView";
import { ListView } from "./ListView";
import { TableStyles } from "./Table.styles";

const COLUMN_WIDTHS = new Map([
  [
    "selection",
    {
      width: "30px",
      minWidth: "30px",
      maxWidth: "30px",
      align: "center",
    },
  ],
  [
    "show-source",
    {
      width: "40px",
      minWidth: "40px",
      maxWidth: "40px",
      align: "center",
    },
  ],
]);

const getColumnWidth = (colID) => {
  const props = COLUMN_WIDTHS.get(colID);

  if (props !== undefined) {
    return props;
  }

  return { minWidth: 30 };
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

const OrderButton = observer(({ desc }) => {
  let SortIcon = FaSort;
  if (desc !== undefined) {
    SortIcon = desc ? FaSortDown : FaSortUp;
  }

  return (
    <SortIcon
      style={{ marginLeft: 10, opacity: desc !== undefined ? 0.8 : 0.25 }}
    />
  );
});

const applySort = (view, col) => {
  if (col.original?.canOrder) view.setOrdering(col.original.id);
};

const renderColHeaderContent = (view, col) => {
  const canOrder = col.original?.canOrder && view.type === "list";

  return (
    <div
      style={{ display: "flex", alignItems: "center" }}
      onClick={() => applySort(view, col)}
    >
      {col.original?.title}

      {canOrder && <OrderButton desc={col.original.order} />}
    </div>
  );
};

const TableCellHeader = (view) => ({ column: col }) => {
  const { parent, help, orderable } = col.original ?? {};
  const className = [
    "data-variable",
    orderable ? "data-variable__orderable" : null,
  ];

  return (
    <div className={className.join(" ")}>
      {renderColHeaderContent(view, col)}

      {parent && (
        <Tag color="blue" style={{ fontWeight: "bold" }}>
          {parent.title}
        </Tag>
      )}

      {help && (
        <Tooltip title={help}>
          <VscQuestion size={16} style={{ opacity: 0.5 }} />
        </Tooltip>
      )}
    </div>
  );
};

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
      Object.assign(
        col,
        {
          Header: TableCellHeader(view),
        },
        getColumnWidth(col.id)
      );

      if (CellViews[col.type]) {
        const cellRenderer = CellViews[col.type];
        let constraints = cellRenderer.constraints ?? {};

        if (constraints instanceof Function) {
          constraints = constraints(col);
        }

        Object.assign(col, { Cell: cellRenderer, ...constraints });
      }

      return col;
    })
  );

  if (!getRoot(view).isLabeling) {
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
          style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <RiCodeSSlashLine size={18} />
        </Button>
      ),
    });
  }

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
        selectedRowIds: view.selected.reduce(
          (res, el) => ({ ...res, [el]: true }),
          {}
        ),
      },
    },
    useRowSelect,
    useFlexLayout,
    (hooks) => {
      hooks.visibleColumns.push(SelectionCell(view, setShowSource));
    }
  );

  const loadMore = React.useCallback(() => {
    if (view.dataStore.hasNextPage) {
      view.dataStore.fetch();
    }
  }, [view.dataStore]);

  const gridView = () => {
    return (
      <GridView
        rows={rows}
        view={view}
        loadMore={loadMore}
        selected={selected}
        prepareRow={prepareRow}
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
        headerGroups={headerGroups}
        getTableProps={getTableProps}
        getTableBodyProps={getTableBodyProps}
        lineHeight={50}
      />
    );
  };

  React.useEffect(() => {
    setHiddenColumns(hiddenColumns);
  }, [setHiddenColumns, hiddenColumns]);

  React.useEffect(() => {
    view.setSelected(selectedRowIds);
  }, [view, selectedRowIds]);

  const content = view.root.isLabeling ? (
    listView()
  ) : (
    <>
      {view.type === "list" ? listView() : gridView()}
      <div className="dm-content__statusbar">
        <div>
          Selected {Object.keys(selectedRowIds).length} of {total} items
        </div>
        <div>{view.dataStore.loading && "Loading"}</div>
      </div>
    </>
  );

  // Render the UI for your table
  return (
    <TableStyles className="dm-content">
      {content}

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
