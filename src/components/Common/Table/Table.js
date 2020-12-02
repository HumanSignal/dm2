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
  ({
    data,
    onRowSelect,
    selectedRows,
    cellViews,
    headerRenderers,
    ...props
  }) => {
    const columns = prepareColumns(props.columns, props.hiddenColumns);

    const contextValue = {
      columns,
      onRowSelect,
      selectedRows,
      data,
      cellViews,
      headerRenderers,
    };

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
            style={{
              ...style,
              height: props.rowHeight,
              width: props.fitContent ? "fit-content" : "100%",
            }}
          />
        );
      },
      [data, props.fitContent, props.onRowClick, props.rowHeight]
    );

    const renderStickyComponent = React.useCallback(
      ({ style }) => (
        <TableHead
          style={style}
          order={props.order}
          columnHeaderExtra={props.columnHeaderExtra}
          sortingEnabled={props.sortingEnabled}
          onSetOrder={props.onSetOrder}
        />
      ),
      [
        props.order,
        props.columnHeaderExtra,
        props.sortingEnabled,
        props.onSetOrder,
      ]
    );

    return (
      <TableWrapper fitToContent={props.fitToContent}>
        <TableContext.Provider value={contextValue}>
          <AutoSizer className="table-auto-size">
            {({ width, height }) => (
              <InfiniteLoader
                itemCount={props.total}
                isItemLoaded={(index) => props.isItemLoaded(data, index)}
                loadMoreItems={props.loadMore}
              >
                {({ onItemsRendered, ref }) => (
                  <StickyList
                    ref={ref}
                    width={width}
                    height={height}
                    overscanCount={10}
                    className="virtual-table"
                    itemHeight={props.rowHeight}
                    itemCount={data.length + 1}
                    itemKey={(index) => data[index]?.key ?? index}
                    onItemsRendered={onItemsRendered}
                    innerElementType={innerElementType}
                    stickyItems={[0]}
                    stickyItemsHeight={[headerHeight]}
                    stickyComponent={renderStickyComponent}
                    initialScrollOffset={
                      initialScrollOffset - height / 2 + headerHeight
                    }
                  >
                    {renderRow}
                  </StickyList>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
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
  if (stickyItems && stickyItems.includes(index)) {
    return null;
  }
  return <Renderer index={index} style={style} />;
};

const StickyList = React.forwardRef(
  (
    { children, stickyComponent, stickyItems, stickyItemsHeight, ...rest },
    ref
  ) => {
    const itemData = {
      Renderer: children,
      StickyComponent: stickyComponent,
      stickyItems,
      stickyItemsHeight,
    };

    return (
      <StickyListContext.Provider value={itemData}>
        <VariableSizeList
          ref={ref}
          itemData={itemData}
          itemSize={(index) => {
            if (stickyItems.includes(index)) {
              return stickyItemsHeight[index] ?? rest.itemHeight;
            }
            return rest.itemHeight;
          }}
          {...rest}
        >
          {ItemWrapper}
        </VariableSizeList>
      </StickyListContext.Provider>
    );
  }
);
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
