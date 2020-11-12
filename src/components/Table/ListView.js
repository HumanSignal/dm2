import { observer } from "mobx-react";
import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { cleanArray } from "../../utils/utils";

const compileRowProps = (row, view, selected, style) => {
  const currentTask = row.original;
  const isCurrent = currentTask === selected;
  const props = row.getRowProps({
    onClick() {
      if (!isCurrent) {
        view.setTask({
          id: currentTask.id,
          taskID: currentTask.task_id,
        });
      }
    },
  });

  const styles = {
    ...style,
    background: isCurrent ? "#efefef" : "none",
  };

  if (props.style) {
    Object.assign(props.style, styles);
  } else {
    props.style = styles;
  }

  return props;
};

const compileTableCellProps = (column, className, propsGetter) => {
  const props = propsGetter(column);

  Object.assign(props, {
    className: cleanArray([props.className, className]),
  });

  return props;
};

const compileHeaderProps = (column) => {
  return compileTableCellProps(column, "dm-content__table-header", (column) =>
    column.getHeaderProps()
  );
};

const compileCellProps = (cell) => {
  return compileTableCellProps(cell, "dm-content__table-cell", (cell) =>
    cell.getCellProps()
  );
};

export const ListView = observer(
  ({
    getTableProps,
    getTableBodyProps,
    prepareRow,
    headerGroups,
    rows,
    view,
    selected,
    loadMore,
  }) => {
    const renderRow = React.useCallback(
      ({ style, index }) => {
        const row = rows[index];
        prepareRow(row);
        return (
          <div
            {...compileRowProps(row, view, selected, style)}
            className="dm-content__table-row"
          >
            {row.cells.map((cell) => (
              <div {...compileCellProps(cell)}>
                {cell.render("Cell") ?? null}
              </div>
            ))}
          </div>
        );
      },
      [rows, prepareRow, selected, view]
    );

    const isItemLoaded = React.useCallback(
      (index) => {
        const rowExists = !!rows[index];
        const hasNextPage = view.dataStore.hasNextPage;
        console.log({ index, itemLoaded: !hasNextPage || rowExists });

        return !hasNextPage || rowExists;
      },
      [rows, view.dataStore.hasNextPage]
    );

    const tableHeadContent = (
      <div className="dm-content__table-head">
        {headerGroups.map((headerGroup) => (
          <div
            {...headerGroup.getHeaderGroupProps()}
            className="dm-content__table-row"
          >
            {headerGroup.headers.map((column) => (
              <div {...compileHeaderProps(column)}>
                {column.render("Header")}
              </div>
            ))}
          </div>
        ))}
      </div>
    );

    const tableBodyContent = (
      <div {...getTableBodyProps()} className="dm-content__table-body">
        <AutoSizer>
          {({ width, height }) => (
            <InfiniteLoader
              itemCount={view.dataStore.total}
              isItemLoaded={isItemLoaded}
              loadMoreItems={loadMore}
            >
              {({ onItemsRendered, ref }) => (
                <FixedSizeList
                  ref={ref}
                  width={width}
                  height={height}
                  itemSize={100}
                  overscanCount={10}
                  itemCount={rows.length}
                  onItemsRendered={onItemsRendered}
                >
                  {renderRow}
                </FixedSizeList>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>
    );

    return (
      <div {...getTableProps({ className: "dm-content__table" })}>
        {tableHeadContent}
        {tableBodyContent}
      </div>
    );
  }
);
