import { observer, inject } from "mobx-react";
import React, { Fragment, memo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { GridCell } from "./GridView";
import { prepareColumns } from "../../Common/Table/utils";
import { Space } from "../../Common/Space/Space";
import { FieldsButton } from "../../Common/FieldsButton";
import * as DataGroups from "../DataGroups";
import "./GroupedView.styl";


const STORAGE_KEY = "groupByField";

const Rows = memo(
  ({ data, index, style, view, fields, hiddenFields, onChange, loadMore }) => {

    const columnCount = 1;
    const dataGroups = Object.keys(data);
    const group = dataGroups[index];
    const itemCount = data[group].length;
    const fieldsData = React.useMemo(() => {
      return prepareColumns(fields, hiddenFields);
    }, [fields, hiddenFields]);

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
          <h4 style={{ textAlign: "center", margin: "16px 0 0 0" }}>{group}</h4>
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
                  height={height - 50}
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
    const group = key.parent ? row[key.parent.alias][key.title] : row[key.title];

    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(row);

    return grouped;
  }, []);
};

const injector = inject(({ store }) => {
  const view = store?.currentView;

  return {
    view,
    ordering: view?.currentOrder,
  };
});

export const GroupByButton = injector(({ size, updateGrouping, currentValue }) => {

  window.localStorage.setItem(STORAGE_KEY, currentValue.title);

  return (
    <Space style={{ fontSize: 12, margin: "16px 0 0 16px", paddingLeft: "5px" }}>
      Group by
      <FieldsButton
        size={size}
        style={{ minWidth: 85, textAlign: "left" }}
        title={currentValue ? currentValue.title : "not set"}
        onClick={updateGrouping}
        onReset={updateGrouping}
        selected={currentValue}
        wrapper={({ children }) => (
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            {children}
          </Space>
        )}
      />
    </Space>
  );
});

const isDataField = (field) => field.parent?.alias === "data";

const getDataFields = (fields) => {
  return fields.filter(isDataField);
};

export const GroupedView = observer(
  ({ data, view, loadMore, fields, onChange, hiddenFields }) => {

    const choices = getDataFields(fields);

    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    const storedChoice = storedValue ?
      choices.filter((x) => x.title === storedValue)[0] :
      choices[0];

    const [grouping, setGrouping] = useState(storedChoice);

    const itemData = groupBy(data, grouping);

    const itemCount = Object.keys(itemData).length;

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
        <GroupByButton
          size="small"
          updateGrouping={setGrouping}
          currentValue={grouping}
        >
        </GroupByButton>
        <AutoSizer>
          {({ width, height }) => (
            <List
              className="list-cols"
              layout="horizontal"
              height={height}
              itemCount={itemCount}
              itemData={itemData}
              itemSize={Math.min(width / Math.min(itemCount, 3), 750)}
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