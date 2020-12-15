import { Button, Empty, Tag, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import { inject } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { VscQuestion } from "react-icons/vsc";
import { Table } from "../Common/Table/Table";
import * as CellViews from "./CellViews";
import { GridView } from "./GridView";
import { TableStyles } from "./Table.styles";

const injector = inject(({ store }) => {
  const { dataStore, currentView } = store;
  const props = {
    view: currentView,
    data: dataStore?.list ?? [],
    viewType: currentView?.type ?? "list",
    columns: currentView?.fieldsAsColumns ?? [],
    hiddenColumns: currentView?.hiddenColumnsList,
    selectedItems: currentView?.selected,
    selectedCount: currentView?.selected?.length ?? 0,
    total: dataStore?.total ?? 0,
    isLabeling: store.isLabeling ?? false,
    isLoading: dataStore?.isLoading ?? true,
    hasData: (store.project?.task_count ?? 0) > 0,
  };

  return props;
});

export const DataView = injector(
  ({
    data,
    columns,
    view,
    selectedItems,
    viewType,
    total,
    isLabeling,
    isLoading,
    hiddenColumns = [],
    hasData = false,
  }) => {
    const [showSource, setShowSource] = React.useState();

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

    const onSelectAll = React.useCallback(() => view.selectAll(), [view]);

    const onRowSelect = React.useCallback((id) => view.toggleSelected(id), [
      view,
    ]);

    const onRowClick = React.useCallback(
      (item) => {
        getRoot(view).startLabeling(item);
      },
      [view]
    );

    const renderContent = React.useCallback(
      (content) => {
        if (total === 0 || !hasData) {
          return (
            <Empty
              description={
                hasData ? (
                  <span>
                    Nothing's found.
                    <br />
                    Try adjusting the filter.
                  </span>
                ) : (
                  "Before you can start labeling, you need to import tasks."
                )
              }
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {!hasData && (
                <Button type="primary" href="./import">
                  Go to import
                </Button>
              )}
            </Empty>
          );
        }

        return content;
      },
      [hasData, isLabeling, isLoading, total]
    );

    const content =
      view.root.isLabeling || viewType === "list" ? (
        <Table
          view={view}
          data={data}
          rowHeight={70}
          total={total}
          loadMore={loadMore}
          fitContent={isLabeling}
          columns={columns}
          hiddenColumns={hiddenColumns}
          cellViews={CellViews}
          order={view.ordering}
          isItemLoaded={isItemLoaded}
          sortingEnabled={view.type === "list"}
          onSetOrder={(col) => view.setOrdering(col.id)}
          columnHeaderExtra={columnHeaderExtra}
          selectedItems={selectedItems}
          onSelectAll={onSelectAll}
          onSelectRow={onRowSelect}
          onRowClick={onRowClick}
          stopInteractions={view.dataStore.loading}
        />
      ) : (
        <GridView
          view={view}
          data={data}
          fields={columns}
          loadMore={loadMore}
          onChange={(id) => view.toggleSelected(id)}
          hiddenFields={hiddenColumns}
        />
      );

    // Render the UI for your table
    return (
      <TableStyles className="dm-content">
        {renderContent(content)}

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
