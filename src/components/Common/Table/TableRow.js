import { observer } from "mobx-react";
import React from "react";
import { TableCellWrapper, TableRowWrapper } from "./Table.styled";
import { TableContext } from "./TableContext";
import { getProperty, getStyle } from "./utils";

export const TableRow = observer(
  ({
    data,
    onClick,
    style,
    isSelected,
    isHighlighted,
    cellDecoration,
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
            onClick={(e) => {
              if (onClick) onClick(data, e);
            }}
          >
            {columns.map((col) => {
              const { Cell, id } = col;

              if (Cell instanceof Function) {
                const { cellClassName, ...rest } = col;
                return (
                  <TableCellWrapper
                    {...rest}
                    key={id}
                    className={cellClassName}
                  >
                    <Cell data={data} />
                  </TableCellWrapper>
                );
              }

              const valuePath = col.id.split(":")[1] ?? col.id;
              const Renderer = cellViews?.[col.type] ?? cellViews.String;
              const value = getProperty(data, valuePath);
              const renderProps = { column: col, original: data, value: value };
              const Decoration = cellDecoration[col.alias];
              const style = getStyle(cellViews, col, Decoration);

              return (
                <TableCellWrapper key={col.alias} {...style} className="td">
                  {Renderer ? <Renderer {...renderProps} /> : value}
                </TableCellWrapper>
              );
            })}
          </TableRowWrapper>
        )}
      </TableContext.Consumer>
    );
  }
);
