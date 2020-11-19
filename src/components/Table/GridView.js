import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { groupBy } from "../../utils/utils";
import * as DataGroups from "./DataGroups";

const getCell = (cells, cellID) => {
  return cells.find((c) => {
    const split = c.column.id.split(":");
    const id = split[1] ?? split[0];
    console.log({ id, cellID });
    return id === cellID;
  });
};

const getDataCells = (cells) => {
  return cells.filter((c) => /data\./.test(c.column.id));
};

const cellRenderer = (cells) => (cellID) => {
  return getCell(cells, cellID).render("Cell");
};

const GridHeader = ({ row }) => {
  const { original } = row;
  const renderCell = cellRenderer(row.cells);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", width: "100%", flex: 1 }}>
        <span>{renderCell("selection")}</span>
        <span style={{ marginLeft: 5 }}>{renderCell("id")}</span>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "flex-end",
            flex: 1,
          }}
        >
          {original.completed_at ? original.completed_at : "Not completed"}
        </div>
      </div>
    </div>
  );
};

const GridBody = ({ row }) => {
  const dataCells = groupBy(
    getDataCells(row.cells),
    (item) => item.column.original.type
  );
  console.log(dataCells);

  return Object.entries(dataCells).map(([dataType, cells]) => {
    return <GridDataGroup key={dataType} type={dataType} cells={cells} />;
  });
};

const GridDataGroup = ({ type, cells }) => {
  const DataTypeComponent = DataGroups[type];

  return (
    <div style={{ padding: "3px 0" }}>
      {DataTypeComponent ? (
        <DataTypeComponent cells={cells} />
      ) : (
        <div>
          {cells.map((c) => (
            <div key={c.getCellProps().key}>{c.render("Cell")}</div>
          ))}
        </div>
      )}
    </div>
  );
};

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

      console.log({ ...props.style });
      console.log({ ...style });

      Object.assign(props, {
        style: {
          ...style,
        },
      });

      return (
        <div {...props} className="grid__item">
          <GridHeader row={row} />
          <GridBody row={row} />
          {/* {row.cells.map((cell) => {
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
          })} */}
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
                rowHeight={150}
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
