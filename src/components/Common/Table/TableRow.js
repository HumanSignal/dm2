import { observer } from "mobx-react";
import React from "react";
import { TableCellWrapper, TableRowWrapper } from "./Table.styled";
import { TableContext } from "./TableContext";
import { getProperty, getStyle } from "./utils";

const CellRenderer = observer(({ col, data, decoration, cellViews }) => {
  const { Cell, id } = col;

  if (Cell instanceof Function) {
    const { cellClassName, ...rest } = col;
    return (
      <TableCellWrapper {...rest} key={id} className={cellClassName}>
        <Cell data={data} />
      </TableCellWrapper>
    );
  }

  const valuePath = col.id.split(":")[1] ?? col.id;
  const Renderer = cellViews?.[col.type] ?? cellViews.String;
  const value = getProperty(data, valuePath);
  const renderProps = { column: col, original: data, value: value };
  const Decoration = decoration?.get?.(col);
  const style = getStyle(cellViews, col, Decoration);

  return (
    <TableCellWrapper className="td">
      <div
        style={{
          ...(style ?? {}),
          display: "flex",
          height: "100%",
          alignItems: "center",
        }}
      >
        {Renderer ? <Renderer {...renderProps} /> : value}
      </div>
    </TableCellWrapper>
  );
});

export const TableRow = observer(
  ({
    data,
    onClick,
    style,
    isSelected,
    isHighlighted,
    cellDecoration,
    decoration,
    stopInteractions,
    even,
  }) => {
    const classNames = ["table-row"];
    if (isSelected) classNames.push("selected");
    if (isHighlighted) classNames.push("highlighted");
    if (data.isLoading) classNames.push("loading");
    if (even === true) classNames.push("even");

    return (
      <TableContext.Consumer>
        {({ columns, cellViews }) => (
          <TableRowWrapper
            style={style}
            disabled={stopInteractions}
            className={classNames.join(" ")}
            onClick={(e) => onClick?.(data, e)}
          >
            {columns.map((col) => {
              return (
                <CellRenderer
                  key={col.id}
                  col={col}
                  data={data}
                  cellViews={cellViews}
                  decoration={decoration}
                />
              );
            })}
          </TableRowWrapper>
        )}
      </TableContext.Consumer>
    );
  }
);
