import { Button, Empty, Tag, Tooltip } from "antd";
import Modal from "antd/lib/modal/Modal";
import { inject } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { VscQuestion } from "react-icons/vsc";
import { FillContainer } from "../App/App.styles";
import { Spinner } from "../Common/Spinner";
import { Table } from "../Common/Table/Table";
import * as CellViews from "./CellViews";
import { GridView } from "./GridView";
import { TableStyles } from "./Table.styles";

const injector = inject(({ store }) => {
  const { dataStore, currentView } = store;
  const props = {
    dataStore,
    view: currentView,
    viewType: currentView?.type ?? "list",
    columns: currentView?.fieldsAsColumns ?? [],
    hiddenColumns: currentView?.hiddenColumnsList,
    selectedItems: currentView?.selected,
    selectedCount: currentView?.selected?.length ?? 0,
    isLabeling: store.isLabeling ?? false,
    data: dataStore?.list ?? [],
    total: dataStore?.total ?? 0,
    isLoading: dataStore?.loading ?? true,
    isLocked: currentView?.locked ?? false,
    hasData: (store.project?.task_count ?? 0) > 0,
    focusedItem: dataStore?.selected ?? dataStore?.highlighted,
  };

  return props;
});

export const DataView = injector(
  ({
    data,
    columns,
    view,
    selectedItems,
    dataStore,
    viewType,
    total,
    isLoading,
    isLabeling,
    hiddenColumns = [],
    hasData = false,
    isLocked,
    ...props
  }) => {
    const [showSource, setShowSource] = React.useState();

    const focusedItem = React.useMemo(() => {
      return props.focusedItem;
    }, [props.focusedItem]);

    const loadMore = React.useCallback(() => {
      if (!dataStore.hasNextPage || dataStore.loading) return;

      dataStore.fetch({ interaction: "scroll" });
    }, [dataStore]);

    const isItemLoaded = React.useCallback(
      (data, index) => {
        const rowExists = !!data[index];
        const hasNextPage = dataStore.hasNextPage;

        return !hasNextPage || rowExists;
      },
      [dataStore.hasNextPage]
    );

    const columnHeaderExtra = React.useCallback(
      ({ parent, help }, decoration) => (
        <>
          {parent && (
            <Tag color="blue" style={{ fontWeight: "bold" }}>
              {parent.title}
            </Tag>
          )}

          {help && decoration?.help !== false && (
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
      (item, e) => {
        if (e.metaKey || e.ctrlKey) {
          window.open(`./?task=${item.task_id ?? item.id}`, "_blank");
        } else {
          getRoot(view).startLabeling(item);
        }
      },
      [view]
    );

    const renderContent = React.useCallback(
      (content) => {
        if (isLoading && total === 0 && !isLabeling) {
          return (
            <FillContainer>
              <Spinner size="large" />
            </FillContainer>
          );
        } else if (total === 0 || !hasData) {
          return (
            <Empty
              description={
                hasData ? (
                  <span>Nothing's found.</span>
                ) : (
                  "Looks like you have not imported any data yet"
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

    const decorationContent = (col) => {
      const column = col.original;

      if (column.icon) {
        return (
          <Tooltip title={column.help ?? col.title}>{column.icon}</Tooltip>
        );
      }
    };

    const commonDecoration = React.useCallback(
      (alias, size, align = "flex-start") => ({
        alias,
        content: decorationContent,
        style: (col) => ({ width: col.width ?? size, justifyContent: align }),
        help: false,
      }),
      []
    );

    const decoration = React.useMemo(
      () => [
        commonDecoration("total_completions", 60, "center"),
        commonDecoration("cancelled_completions", 60, "center"),
        commonDecoration("total_predictions", 60, "center"),
        commonDecoration("completed_at", 180),
        {
          resolver: (col) => col.type === "Number",
          style(col) {
            return /id/.test(col.id) ? { width: 110 } : { width: 50 };
          },
        },
        {
          resolver: (col) => col.type === "Image",
          style: { width: 150, justifyContent: "center" },
        },
        {
          resolver: (col) => ["Date", "Datetime"].includes(col.type),
          style: { width: 240 },
        },
        {
          resolver: (col) => ["Audio", "AudioPlus"].includes(col.type),
          style: { width: 150 },
        },
      ],
      [commonDecoration]
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
          decoration={decoration}
          order={view.ordering}
          focusedItem={focusedItem}
          isItemLoaded={isItemLoaded}
          sortingEnabled={view.type === "list"}
          columnHeaderExtra={columnHeaderExtra}
          selectedItems={selectedItems}
          onSelectAll={onSelectAll}
          onSelectRow={onRowSelect}
          onRowClick={onRowClick}
          stopInteractions={isLocked}
          onTypeChange={(col, type) => col.original.setType(type)}
          onColumnResize={(col, width) => {
            console.log("resize", width);
            col.original.setWidth(width);
          }}
          onColumnReset={(col) => {
            console.log("reset");
            col.original.resetWidth();
          }}
        />
      ) : (
        <GridView
          view={view}
          data={data}
          fields={columns}
          loadMore={loadMore}
          onChange={(id) => view.toggleSelected(id)}
          hiddenFields={hiddenColumns}
          stopInteractions={isLocked}
        />
      );

    // Render the UI for your table
    return (
      <TableStyles
        className="dm-content"
        style={{ pointerEvents: isLocked ? "none" : "auto" }}
      >
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
