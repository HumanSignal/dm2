import { Tag, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { VscQuestion } from "react-icons/vsc";
import { Table } from "../Common/Table/Table";
import * as CellViews from "./CellViews";
import { GridView } from "./GridView";
import { TableStyles } from "./Table.styles";

export const DataView = observer(
  ({ data, columns, view, hiddenColumns = [] }) => {
    const { dataStore, isLabeling } = getRoot(view);
    const { total, selected } = dataStore;
    const [showSource, setShowSource] = React.useState();
    const { selected: selectedItems } = view;

    const gridView = () => {
      return (
        <GridView
          view={view}
          data={data}
          fields={columns}
          loadMore={loadMore}
          selected={selected}
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
      (state, data) => {
        if (state === "update") {
          view.selectAll();
        } else {
          view.toggleSelected(data);
        }
      },
      [view]
    );

    const onRowClick = React.useCallback(
      (currentTask) => {
        if (view.dataStore.loadingItem) return;

        if (!currentTask.isSelected) {
          view.setTask({
            id: currentTask.id,
            taskID: currentTask.task_id,
          });
        } else {
          view.closeLabeling();
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
          selected={selectedItems}
          onRowSelect={onRowSelect}
          onRowClick={onRowClick}
          stopInteractions={view.dataStore.loading}
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
