import { observer } from "mobx-react";
import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { cleanArray } from "../../utils/utils";

const compileRowProps = (row, view, className) => {
  const currentTask = row.original;
  const props = row.getRowProps({
    onClick() {
      if (!currentTask.isSelected) {
        view.setTask({
          id: currentTask.id,
          taskID: currentTask.task_id,
        });
      }
    },
  });

  let currentClass = className ? [className] : [];
  if (currentTask.isSelected) currentClass.push("selected");
  if (currentTask.isHighlighted) currentClass.push("highlighted");

  props.key = `row-${currentTask.updated}`;
  props.className = currentClass.join(" ");

  return props;
};

const compileTableCellProps = (column, className, propsGetter) => {
  const props = propsGetter(column);

  Object.assign(props, {
    className: cleanArray([props.className, className]),
  });

  props.style = { ...(props.style ?? {}) };
  const align = column.align ?? column.column?.align;

  if (align === "center") {
    props.style.justifyContent = "center";
  }

  return props;
};

const compileHeaderProps = (column) => {
  return compileTableCellProps(column, "dm-content__table-heading", (column) =>
    column.getHeaderProps()
  );
};

const compileCellProps = (cell) => {
  return compileTableCellProps(cell, "dm-content__table-cell", (cell) =>
    cell.getCellProps()
  );
};

const StickyListContext = React.createContext();
StickyListContext.Consumer.displayName = "StickyListContext";

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

export const ListView = observer(
  ({
    getTableProps,
    getTableBodyProps,
    prepareRow,
    headerGroups,
    rows,
    view,
    loadMore,
    lineHeight,
  }) => {
    const headerHeight = 42;
    const isItemLoaded = React.useCallback(
      (index) => {
        const rowExists = !!rows[index];
        const hasNextPage = view.dataStore.hasNextPage;

        return !hasNextPage || rowExists;
      },
      [rows, view.dataStore.hasNextPage]
    );

    const tableHeadContent = ({ style }) => (
      <div className="dm-content__table-header" style={style}>
        {headerGroups.map((headerGroup) => (
          <div
            className="dm-content__table-heading-group"
            {...headerGroup.getHeaderGroupProps()}
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

    const renderRow = React.useCallback(
      ({ style, index }) => {
        const row = rows[index - 1];
        prepareRow(row);
        return (
          <div
            {...compileRowProps(row, view, "dm-content__table-row")}
            style={{ ...style, height: lineHeight }}
          >
            {row.cells.map((cell) => (
              <div {...compileCellProps(cell)}>
                {cell.render("Cell") ?? null}
              </div>
            ))}
          </div>
        );
      },
      [rows, prepareRow, view, lineHeight]
    );

    const selectedRowIndex = rows.findIndex(
      (r) => r.original?.isSelected || r.original?.isHighlighted
    );

    const initialScrollOffset = selectedRowIndex * 100;

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
                <StickyList
                  ref={ref}
                  width={width}
                  height={height}
                  overscanCount={10}
                  itemHeight={lineHeight}
                  itemCount={rows.length + 1}
                  itemKey={(index) => rows[index]?.original?.key ?? index}
                  onItemsRendered={onItemsRendered}
                  innerElementType={innerElementType}
                  stickyItems={[0]}
                  stickyItemsHeight={[headerHeight]}
                  stickyComponent={tableHeadContent}
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
      </div>
    );

    return (
      <div {...getTableProps({ className: "dm-content__table" })}>
        {tableBodyContent}
      </div>
    );
  }
);
