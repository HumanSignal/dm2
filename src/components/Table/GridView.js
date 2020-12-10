import { Checkbox } from "antd";
import { observer } from "mobx-react";
import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import styled from "styled-components";
import { getProperty, prepareColumns } from "../Common/Table/utils";
import * as DataGroups from "./DataGroups";

const GridHeader = observer(({ row, view, selected }) => {
  return (
    <GridCellHeader>
      <div style={{ display: "flex", width: "100%", flex: 1 }}>
        <Checkbox checked={selected.isSelected(row.id)} />
        <span style={{ marginLeft: 5 }}>{row.id}</span>
      </div>
    </GridCellHeader>
  );
});

const GridBody = observer(({ row, fields }) => {
  const dataFields = fields.filter((f) => f.parent?.alias === "data");

  return dataFields.map((field, index) => {
    const valuePath = field.id.split(":")[1] ?? field.id;
    const value = getProperty(row, valuePath);

    return (
      <GridDataGroup
        key={`${row.id}-${index}`}
        type={field.type}
        value={value}
      />
    );
  });
});

const GridDataGroup = observer(({ type, value }) => {
  const DataTypeComponent = DataGroups[type];

  return (
    <div>
      {DataTypeComponent ? (
        <DataTypeComponent value={value} />
      ) : (
        <DataGroups.TextDataGroup value={value} />
      )}
    </div>
  );
});

const GridCell = observer(
  ({ view, selected, row, fields, onClick, ...props }) => {
    return (
      <GridCellWrapper
        {...props}
        selected={selected.isSelected(row.id)}
        onClick={onClick}
      >
        <div>
          <GridHeader
            view={view}
            row={row}
            fields={fields}
            selected={view.selected}
          />
          <GridBody
            view={view}
            row={row}
            fields={fields}
            selected={view.selected}
          />
        </div>
      </GridCellWrapper>
    );
  }
);

export const GridView = observer(
  ({
    data,
    view,
    loadMore,
    fields,
    // isItemLoaded,
  }) => {
    const columnCount = 4;

    const getCellIndex = (row, column) => {
      return columnCount * row + column;
    };

    const fieldsData = React.useMemo(() => prepareColumns(fields), [fields]);

    const rowHeight = fields
      .filter((f) => f.parent?.alias === "data")
      .reduce((res, f) => {
        const height = (DataGroups[f.type] ?? DataGroups.TextDataGroup).height;
        return res + height;
      }, 0);

    const renderItem = React.useCallback(
      ({ style, rowIndex, columnIndex }) => {
        const index = getCellIndex(rowIndex, columnIndex);
        const row = data[index];

        if (!row) return null;

        const props = {
          style: {
            ...style,
          },
        };

        return (
          <GridCell
            {...props}
            view={view}
            row={row}
            fields={fieldsData}
            selected={view.selected}
            onClick={() => view.toggleSelected(row.id)}
          />
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        data,
        fieldsData,
        view.selected,
        view,
        view.selected.list,
        view.selected.all,
      ]
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

    const itemCount = Math.ceil(data.length / columnCount);

    const isItemLoaded = (index) => {
      const rowIndex = index * columnCount;
      const rowFullfilled =
        data.slice(rowIndex, columnCount).length === columnCount;
      return !view.dataStore.hasNextPage || rowFullfilled;
    };

    return (
      <div className="grid" style={{ flex: 1, padding: 5 }}>
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
                  rowHeight={rowHeight + 10}
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
  }
);

const GridCellWrapper = styled.div`
  padding: 5px;
  box-sizing: border-box;

  & > div {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 3px;
    background: ${({ selected }) => (selected ? "#eff7ff" : "none")};
    box-shadow: ${({ selected }) =>
      (selected
        ? [
            "0 0 2px 2px rgba(26, 144, 255, 0.44)",
            "0 0 0 1px rgba(26, 144, 255, 0.6)",
          ]
        : ["0 0 2px 0 rgba(0,0,0,0.32)"]
      ).join(", ")};
  }
`;

const GridCellHeader = styled.div`
  top: 0;
  padding: 5px;
  width: 100%;
  color: #fff;
  display: flex;
  position: absolute;
  justify-content: space-between;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent);
`;
