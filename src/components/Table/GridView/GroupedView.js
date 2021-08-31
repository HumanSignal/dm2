import { inject, observer } from "mobx-react";
import React, { Fragment, memo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { GridCell } from "./GridView";
import { prepareColumns } from "../../Common/Table/utils";
import { Space } from "../../Common/Space/Space";
import { FieldsButton } from "../../Common/FieldsButton";
import { Button } from "../../Common/Button/Button";
import { Icon } from "../../Common/Icon/Icon";
import { FaCaretDown } from "react-icons/fa";
import * as DataGroups from "../DataGroups";
import "./GroupedView.styl";


const STORAGE_KEY = "groupByField";
const COLWIDTH_KEY = "columnWidth";

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
          // marginLeft: "1em",
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

    const columnStyle = {
      ...style,
      borderRightStyle: "solid",
      borderRightColor: "#fff",
      borderRightWidth: "1px",
      paddingRight: "0.5em",
      // marginRight: "1em",
    };

    return (
      <div style={columnStyle}>
        <div>
          <h4 style={{ textAlign: "center", margin: "16px 0 0 0" }}>{group} ({itemCount})</h4>
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
                  style={{ marginLeft: "1em" }}
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

function isDataField(field) {
  return field.parent?.alias === "data";
}

const getDataFields = (fields) => {
  return fields.filter(isDataField);
};

const injector = inject(({ store }) => {
  const view = store?.currentView;

  return {
    view,
    ordering: view?.currentOrder,
  };
});

export const GroupByButton = injector(({ size, updateGrouping, currentValue, colWidth, updateColWidth }) => {

  window.localStorage.setItem(STORAGE_KEY, currentValue.title);

  window.localStorage.setItem(COLWIDTH_KEY, colWidth);
  
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
        trailingIcon={<Icon icon={FaCaretDown} />}
        wrapper={({ children }) => (
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            {children}
          </Space>
        )}
      />
      Column width
      <Button
        size={size}
        onClick={updateColWidth}
      >
        {colWidth}
      </Button>
    </Space>
  );
});

const convertColumnWidth = (columnWidth) => {
  switch (columnWidth) {
    case "small":
      return 8;
    case "medium":
      return 4;
    case "large":
      return 2;
    default:
      return 3;
  }
};

export const GroupedView = observer(
  ({ data, view, loadMore, fields, onChange, hiddenFields }) => {

    const choices = getDataFields(fields);

    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    const storedChoice = storedValue ?
      choices.find((x) => x.title === storedValue) :
      choices[0];

    const [grouping, setGrouping] = useState(storedChoice);

    const itemData = groupBy(data, grouping);

    const itemCount = Object.keys(itemData).length;

    const storedColWidth = window.localStorage.getItem(COLWIDTH_KEY) ?? "medium";

    const [colWidth, setColWidth] = useState(storedColWidth);

    const updateColWidth = () => {
      switch (colWidth) {
        case "small":
          setColWidth("medium");
          break;
        case "medium":
          setColWidth("large");
          break;
        case "large":
          setColWidth("small");
          break;
        default:
          setColWidth("medium");
      }
    };

    const numColumns = convertColumnWidth(colWidth);

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
          colWidth={colWidth}
          updateColWidth={updateColWidth}
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
              itemSize={Math.max(250, Math.min(width / Math.min(itemCount, numColumns), 750))}
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