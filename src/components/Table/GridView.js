import { Checkbox, Space } from "antd";
import { observer } from "mobx-react";
import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeGrid } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import styled from "styled-components";
import { getProperty, prepareColumns } from "../Common/Table/utils";
import * as DataGroups from "./DataGroups";

const GridHeader = observer(({ row, selected }) => {
  return (
    <GridCellHeader>
      <Space>
        <Checkbox checked={selected.isSelected(row.id)} />
        <span>{row.id}</span>
      </Space>
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
  return DataTypeComponent ? (
    <DataTypeComponent value={value} />
  ) : (
    <DataGroups.TextDataGroup value={value} />
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
    onChange,
    hiddenFields,
    // isItemLoaded,
  }) => {
    const columnCount = 4;

    const getCellIndex = (row, column) => columnCount * row + column;

    const fieldsData = React.useMemo(() => {
      return prepareColumns(fields, hiddenFields);
    }, [fields, hiddenFields]);

    const rowHeight = fieldsData
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
            marginLeft: "1em",
          },
        };

        return (
          <GridCell
            {...props}
            view={view}
            row={row}
            fields={fieldsData}
            selected={view.selected}
            onClick={() => onChange?.(row.id)}
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
      <div className="grid" style={{ flex: 1 }}>
        <AutoSizer className="grid-view-resize">
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
                  className="grid-view-list"
                  rowHeight={rowHeight + 42}
                  overscanRowCount={10}
                  columnCount={columnCount}
                  columnWidth={width / columnCount - 9.5}
                  rowCount={itemCount}
                  onItemsRendered={onItemsRenderedWrap(onItemsRendered)}
                  style={{ overflowX: "hidden", padding: "0 1em" }}
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
  padding: 0 10px 10px 0;
  box-sizing: border-box;

  &:nth-child(4n) {
    padding-right: 0;
  }

  & > div {
    width: 100%;
    height: 100%;
    cursor: pointer;
    overflow: hidden;
    position: relative;
    border-radius: 2px;
    background: ${({ selected }) => (selected ? "#eff7ff" : "none")};
    box-shadow: ${({ selected }) =>
      (selected ? ["0 0 2px 2px rgba(26, 144, 255, 0.44)"] : ["none"]).join(
        ", "
      )};
  }

  & > div::after {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    content: "";
    border-radius: 2px;
    position: absolute;
    box-shadow: ${({ selected }) =>
      (selected
        ? ["0 0 0 1px rgba(26, 144, 255, 0.6) inset"]
        : ["0 0 0 1px rgba(0,0,0,0.2) inset"]
      ).join(", ")};
  }
`;

const GridCellHeader = styled.div`
  padding: 5px;
  width: 100%;
  display: flex;
  background: #f9f9f9;
  justify-content: space-between;
`;
