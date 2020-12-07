import { Button, Checkbox, Tag, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { RiCodeSSlashLine } from "react-icons/ri";
import { VscQuestion } from "react-icons/vsc";
import { useRowSelect, useTable } from "react-table";
import { useFlexLayout } from "react-table/dist/react-table.development";
import { Table } from "../Common/Table/Table";
import * as CellViews from "./CellViews";
import { GridView } from "./GridView";
import { TableStyles } from "./Table.styles";

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

  result.push({
    id: "selection",
    onClick: (e) => e.stopPropagation(),
    Header: ({ getToggleAllRowsSelectedProps }) => (
      <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
    ),
    Cell: ({ row: { getToggleRowSelectedProps } }) => (
      <IndeterminateCheckbox {...getToggleRowSelectedProps()} />
    ),
  });

  result.push(
    ...columns.map((col) => {
      Object.assign(col, {
        Header: TableCellHeader(view),
      });

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

export const DataView = observer(
  ({ data, columns, view, hiddenColumns = [] }) => {
    const { dataStore, isLabeling } = getRoot(view);
    const { total, selected } = dataStore;
    const [showSource, setShowSource] = React.useState();

    const {
      rows,
      prepareRow,
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
        manualRowSelectedKey: "selected",
      },
      useRowSelect,
      useFlexLayout,
      (hooks) => {
        hooks.visibleColumns.push(SelectionCell(view, setShowSource));
      }
    );

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

    const loadMore = React.useCallback(() => {
      if (view.dataStore.hasNextPage) {
        view.dataStore.fetch();
      }
    }, [view.dataStore]);

    const isItemLoaded = React.useCallback(
      (data, index) => {
        const rowExists = !!data[index];
        const hasNextPage = view.dataStore.hasNextPage;

        return !hasNextPage || rowExists;
      },
      [view.dataStore.hasNextPage]
    );

    const columnHeaderExtra = React.useCallback(
      ({ parent, help }) => (
        <>
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
        </>
      ),
      []
    );

    const onRowSelect = React.useCallback(
      (selected, state) => {
        console.log({ selected });
        if (state === "add") {
          view.markSelected(selected);
        } else if (state === "update") {
          view.selectAll();
        } else {
          view.unmarkSelected(selected);
        }
      },
      [view]
    );

    const onRowClick = React.useCallback(
      (currentTask) => {
        if (!currentTask.isSelected) {
          view.setTask({
            id: currentTask.id,
            taskID: currentTask.task_id,
          });
        }
      },
      [view]
    );

    const listView = () => {
      return (
        <Table
          data={data}
          rowHeight={70}
          total={total}
          loadMore={loadMore}
          fitContent={isLabeling}
          hiddenColumns={hiddenColumns}
          cellViews={CellViews}
          columns={columns}
          order={view.ordering}
          isItemLoaded={isItemLoaded}
          sortingEnabled={view.type === "list"}
          onSetOrder={(col) => view.setOrdering(col.id)}
          columnHeaderExtra={columnHeaderExtra}
          selectedRows={view.selected}
          onRowSelect={onRowSelect}
          onRowClick={onRowClick}
        />
      );
    };

    const content = view.root.isLabeling
      ? listView()
      : view.type === "list"
      ? listView()
      : gridView();

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
            {showSource
              ? JSON.stringify(JSON.parse(showSource), null, "  ")
              : ""}
          </pre>
        </Modal>
      </TableStyles>
    );
  }
);
