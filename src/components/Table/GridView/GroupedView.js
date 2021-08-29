import { observer } from "mobx-react";
import React, { Fragment, memo } from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { GridCell } from "./GridView";
import { prepareColumns } from "../../Common/Table/utils";
import * as DataGroups from "../DataGroups";
import "./GroupedView.styl";

const Rows = memo(
  ({ data, index, style, view, fields, hiddenFields, onChange, loadMore }) => {

    const columnCount = 1;
    const dataGroups = Object.keys(data);
    const group = dataGroups[index];
    const itemCount = data[group].length;
    const fieldsData = React.useMemo(() => {
      return prepareColumns(fields, hiddenFields);
    }, [fields, hiddenFields]);

    console.log(group, ' ', itemCount);

    const rowHeight = fieldsData
      .filter((f) => f.parent?.alias === "data")
      .reduce((res, f) => {
        const height = (DataGroups[f.currentType] ?? DataGroups.TextDataGroup)
          .height;

        return res + height;
      }, 16);

    const isItemLoaded = React.useCallback(
      (index) => {
        const rowIndex = index * columnCount;
        const rowFullfilled =
          data.slice(rowIndex, columnCount).length === columnCount;

        return !view.dataStore.hasNextPage || rowFullfilled;
      },
      [columnCount, data, view.dataStore.hasNextPage],
    );

    const renderRowItems = ({ data, index, style }) => {
      const row = data[index];

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
    };

    return (
      <div style={style}>
        <div>
          <h5 style={{ textAlign: "center" }}>{group}</h5>
        </div>
        <AutoSizer>
          {({ width, height }) => (
            <InfiniteLoader
              itemCount={itemCount}
              isItemLoaded={isItemLoaded}
              loadMoreItems={loadMore}
            >
              {({ onItemsRendered, ref }) => (
                <List
                  className="list-rows"
                  height={height}
                  itemCount={itemCount}
                  itemSize={rowHeight + 42}
                  itemData={data[group]}
                  width={width}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                >
                  {renderRowItems}
                </List>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>
    );
  });

const groupBy = (data, key) => {
  return data.reduce((grouped, row) => {
    const group = row['data'][key];

    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(row);

    return grouped;
  }, []);
};

export const GroupedView = observer(
  ({ data, view, loadMore, fields, onChange, hiddenFields }) => {

    const itemData = groupBy(data, 'source');

    const itemCount = Object.keys(itemData).length;

    console.log(itemData);

    const renderRows = ({ data, index, style }) => {
      return (
        <Rows
          data={data}
          index={index}
          style={style}
          view={view}
          loadMore={loadMore}
          fields={fields}
          onChange={onChange}
          hiddenFields={hiddenFields}
        >
        </Rows>
      );
    };

    return (
      <Fragment>
        <AutoSizer>
          {({ width, height }) => (
            <List
              className="list-cols"
              layout="horizontal"
              height={height}
              itemCount={itemCount}
              itemData={itemData}
              itemSize={500}
              width={width}
            >
              {renderRows}
            </List>
          )}
        </AutoSizer>
      </Fragment>
    );
  },
);