import { inject } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import { useCallback, useMemo } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { useShortcut } from "../../../sdk/hotkeys";
import { Block, Elem } from "../../../utils/bem";
import { Icon } from "../../Common/Icon/Icon";
import { ImportButton } from "../../Common/SDKButtons";
import { Spinner } from "../../Common/Spinner";
import { Table } from "../../Common/TableOld/Table";
import { Tag } from "../../Common/Tag/Tag";
import { Tooltip } from "../../Common/Tooltip/Tooltip";
import * as CellViews from "../../CellViews";
import { GridView } from "../GridViewOld/GridView";
import "./Table.styl";

const injector = inject(({ store }) => {
  const { dataStore, currentView } = store;
  const props = {
    store,
    dataStore,
    updated: dataStore.updated,
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
    hasData: (store.project?.task_count ?? store.project?.task_number ?? 0) > 0,
    focusedItem: dataStore?.selected ?? dataStore?.highlighted,
  };

  return props;
});

export const DataView = injector(
  ({
    store,
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
    const focusedItem = useMemo(() => {
      return props.focusedItem;
    }, [props.focusedItem]);

    const loadMore = useCallback(() => {
      if (!dataStore.hasNextPage || dataStore.loading) return;

      dataStore.fetch({ interaction: "scroll" });
    }, [dataStore]);

    const isItemLoaded = useCallback(
      (data, index) => {
        const rowExists = !!data[index];
        const hasNextPage = dataStore.hasNextPage;

        return !hasNextPage || rowExists;
      },
      [dataStore.hasNextPage],
    );

    const columnHeaderExtra = useCallback(
      ({ parent, original, help }, decoration) => {
        const children = [];

        if (parent) {
          children.push(
            <Tag
              key="column-type"
              color="blue"
              style={{ fontWeight: "500", fontSize: 14, cursor: "pointer", width: 45, padding: 0 }}
            >
              {original?.readableType ?? parent.title}
            </Tag>,
          );
        }

        if (help && decoration?.help !== false) {
          children.push(
            <Tooltip key="help-tooltip" title={help}>
              <Icon icon={FaQuestionCircle} style={{ opacity: 0.5 }} />
            </Tooltip>,
          );
        }

        return children.length ? <>{children}</> : null;
      },
      [],
    );

    const onSelectAll = useCallback(() => view.selectAll(), [view]);

    const onRowSelect = useCallback((id) => view.toggleSelected(id), [
      view,
    ]);

    const onRowClick = useCallback(
      (item, e) => {
        if (e.metaKey || e.ctrlKey) {
          window.open(`./?task=${item.task_id ?? item.id}`, "_blank");
        } else {
          getRoot(view).startLabeling(item);
        }
      },
      [view],
    );

    const renderContent = useCallback(
      (content) => {
        if (isLoading && total === 0 && !isLabeling) {
          return (
            <Block name="fill-container">
              <Spinner size="large" />
            </Block>
          );
        } else if (total === 0 || !hasData) {
          return (
            <Block name="no-results">
              <Elem name="description">
                {hasData ? (
                  <>
                    <h3>Nothing found</h3>
                    Try adjusting the filter
                  </>
                ) : (
                  "Looks like you have not imported any data yet"
                )}
              </Elem>
              {!hasData && (
                <Elem name="navigation">
                  <ImportButton look="primary" href="./import">
                    Go to import
                  </ImportButton>
                </Elem>
              )}
            </Block>
          );
        }

        return content;
      },
      [hasData, isLabeling, isLoading, total],
    );

    const decorationContent = (col) => {
      const column = col.original;

      if (column.icon) {
        return (
          <Tooltip title={column.help ?? col.title}>
            {column.icon}
          </Tooltip>
        );
      }

      return column.title;
    };

    const commonDecoration = useCallback((
      alias,
      size,
      align = "flex-start",
      help = false,
    ) => ({
      alias,
      content: decorationContent,
      style: (col) => ({ width: col.width ?? size, justifyContent: align }),
      help,
    }), []);

    const decoration = useMemo(
      () => [
        commonDecoration("total_annotations", 60, "center"),
        commonDecoration("cancelled_annotations", 60, "center"),
        commonDecoration("total_predictions", 60, "center"),
        commonDecoration("completed_at", 180, "space-between", true),
        commonDecoration("reviews_accepted", 60, "center"),
        commonDecoration("reviews_rejected", 60, "center"),
        commonDecoration("ground_truth", 60, "center"),
        {
          resolver: (col) => col.type === "Number",
          style(col) {
            return /id/.test(col.id) ? { width: 50 } : { width: 110 };
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
      [commonDecoration],
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
            col.original.setWidth(width);
          }}
          onColumnReset={(col) => {
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

    useShortcut("dm.focus-previous", () => {
      if (document.activeElement !== document.body) return;
      dataStore.focusPrev();
    });

    useShortcut("dm.focus-next", () => {
      if (document.activeElement !== document.body) return;

      dataStore.focusNext();
    });

    useShortcut("dm.close-labeling", () => {
      if (document.activeElement !== document.body) return;

      if (dataStore.selected) store.closeLabeling();
    });

    useShortcut("dm.open-labeling", () => {
      if (document.activeElement !== document.body) return;

      const { highlighted } = dataStore;
      // don't close QuickView by Enter

      if (highlighted && !highlighted.isSelected) store.startLabeling(highlighted);
    });

    // Render the UI for your table
    return (
      <Block
        name="data-view"
        className="dm-content"
        style={{ pointerEvents: isLocked ? "none" : "auto" }}
      >
        {renderContent(content)}
      </Block>
    );
  },
);
