import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

export const GridView = ({
  rows,
  prepareRow,
  view,
  loadMore,
  // isItemLoaded,
}) => {
  const columnCount = 4;

  const getCellIndex = (row, column) => {
    return columnCount * row + column;
  };

  const renderItem = React.useCallback(
    ({ style, rowIndex, columnIndex }) => {
      const index = getCellIndex(rowIndex, columnIndex);
      const row = rows[index];

      if (!row) return null;

      prepareRow(row);
      const props = row.getRowProps?.() ?? {};

      Object.assign(props, {
        style: {
          ...(props.style ?? {}),
          ...style,
        },
      });

      return (
        <div {...props} className="grid__item">
          {row.cells.map((cell) => {
            const { column } = cell;
            return (
              <div key={cell.getCellProps().key}>
                {!["selection", "tasks:id", "show-source"].includes(
                  column.id
                ) ? (
                  <>
                    {cell.column.render("Header")}
                    {": "}
                  </>
                ) : null}

                {cell.render("Cell")}
              </div>
            );
          })}
        </div>
      );
    },
    [prepareRow, rows]
  );

  const onItemsRenderedWrap = (cb) => ({
    visibleRowStartIndex,
    visibleRowStopIndex,
    overscanRowStopIndex,
    overscanRowStartIndex,
  }) => {
    cb({
      overscanStartIndex: overscanRowStartIndex,
      overscanStopIndex: overscanRowStopIndex,
      visibleStartIndex: visibleRowStartIndex,
      visibleStopIndex: visibleRowStopIndex,
    });
  };

  const itemCount = Math.ceil(rows.length / columnCount);

  const isItemLoaded = (index) => {
    const rowIndex = index * columnCount;
    const rowFullfilled =
      rows.slice(rowIndex, columnCount).length === columnCount;
    return !view.dataStore.hasNextPage || rowFullfilled;
  };

  return (
    <div className="grid" style={{ flex: 1 }}>
      <AutoSizer>
        {({ width, height }) => (
          <InfiniteLoader
            itemCount={itemCount}
            isItemLoaded={isItemLoaded}
            loadMoreItems={loadMore}
          >
            {({ onItemsRendered, ref }) => (
              <FixedSizeGrid
                ref={ref}
                width={width}
                height={height}
                rowHeight={100}
                overscanRowCount={10}
                columnCount={columnCount}
                columnWidth={width / columnCount}
                rowCount={itemCount}
                onItemsRendered={onItemsRenderedWrap(onItemsRendered)}
              >
                {renderItem}
              </FixedSizeGrid>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  );
};
