import { observer } from "mobx-react";
import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { TableWrapper } from "./Table.styled";
import { TableContext } from "./TableContext";
import { TableHead } from "./TableHead";
import { TableRow } from "./TableRow";
import { prepareColumns } from "./utils";

export const Table = observer(
  ({ data, onRowSelect, selected, cellViews, headerRenderers, ...props }) => {
    const columns = prepareColumns(props.columns, props.hiddenColumns);

    const contextValue = {
      columns,
      onRowSelect,
      data,
      cellViews,
      headerRenderers,
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selectedItems = React.useMemo(() => selected, [
      selected.list,
      selected.all,
    ]);

    const selectedRowIndex = data.findIndex(
      (r) => r.original?.isSelected || r.original?.isHighlighted
    );

    const initialScrollOffset = selectedRowIndex * 100;

    const headerHeight = 42;

    const renderRow = React.useCallback(
      ({ style, index }) => {
        const row = data[index - 1];

        return (
          <TableRow
            key={row.id}
            data={row}
            isSelected={row.isSelected}
            isHighlighted={row.isHighlighted}
            onClick={props.onRowClick}
            selected={selectedItems}
            style={{
              ...style,
              height: props.rowHeight,
              width: props.fitContent ? "fit-content" : "100%",
            }}
          />
        );
      },
      [data, props.fitContent, props.onRowClick, props.rowHeight, selectedItems]
    );

    const renderStickyComponent = React.useCallback(
      ({ style }) => (
        <TableHead
          style={style}
          order={props.order}
          columnHeaderExtra={props.columnHeaderExtra}
          sortingEnabled={props.sortingEnabled}
          onSetOrder={props.onSetOrder}
          selected={selectedItems}
        />
      ),
      [
        props.order,
        props.columnHeaderExtra,
        props.sortingEnabled,
        props.onSetOrder,
        selectedItems,
      ]
    );

    const isItemLoaded = React.useCallback(
      (index) => {
        return props.isItemLoaded(data, index);
      },
      [props, data]
    );

    return (
      <TableWrapper fitToContent={props.fitToContent}>
        <TableContext.Provider value={contextValue}>
          <StickyList
            overscanCount={10}
            className="virtual-table"
            itemHeight={props.rowHeight}
            totalCount={props.total}
            itemCount={data.length + 1}
            itemKey={(index) => data[index]?.key ?? index}
            innerElementType={innerElementType}
            stickyItems={[0]}
            stickyItemsHeight={[headerHeight]}
            stickyComponent={renderStickyComponent}
            initialScrollOffset={(height) =>
              initialScrollOffset - height / 2 + headerHeight
            }
            isItemLoaded={isItemLoaded}
            loadMore={props.loadMore}
          >
            {renderRow}
          </StickyList>
        </TableContext.Provider>
      </TableWrapper>
    );
  }
);

const StickyListContext = React.createContext();
StickyListContext.Provider.displayName = "StickyListProvider";
StickyListContext.Consumer.displayName = "StickyListConsumer";

const ItemWrapper = ({ data, index, style }) => {
  const { Renderer, stickyItems } = data;

  if (stickyItems?.includes(index) === true) {
    return null;
  }

  return <Renderer index={index} style={style} />;
};

const StickyList = observer((props) => {
  const {
    children,
    stickyComponent,
    stickyItems,
    stickyItemsHeight,
    totalCount,
    isItemLoaded,
    loadMore,
    initialScrollOffset,
    ...rest
  } = props;

  const itemData = {
    Renderer: children,
    StickyComponent: stickyComponent,
    stickyItems,
    stickyItemsHeight,
  };

  const itemSize = (index) => {
    if (stickyItems.includes(index)) {
      return stickyItemsHeight[index] ?? rest.itemHeight;
    }
    return rest.itemHeight;
  };

  return (
    <StickyListContext.Provider value={itemData}>
      <AutoSizer className="table-auto-size">
        {({ width, height }) => (
          <InfiniteLoader
            itemCount={totalCount}
            loadMoreItems={loadMore}
            isItemLoaded={isItemLoaded}
          >
            {({ onItemsRendered, ref }) => (
              <VariableSizeList
                {...rest}
                ref={ref}
                width={width}
                height={height}
                itemData={itemData}
                itemSize={itemSize}
                onItemsRendered={onItemsRendered}
                initialScrollOffset={initialScrollOffset?.(height) ?? 0}
              >
                {ItemWrapper}
              </VariableSizeList>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </StickyListContext.Provider>
  );
});

StickyList.displayName = "StickyList";

const innerElementType = React.forwardRef(({ children, ...rest }, ref) => {
  return (
    <StickyListContext.Consumer>
      {({ stickyItems, stickyItemsHeight, StickyComponent }) => (
        <div ref={ref} {...rest}>
          {stickyItems.map((index) => (
            <StickyComponent
              key={index}
              index={index}
              style={{
                width: "100%",
                height: stickyItemsHeight[index],
                top: index * stickyItemsHeight[index],
              }}
            />
          ))}

          {children}
        </div>
      )}
    </StickyListContext.Consumer>
  );
});
