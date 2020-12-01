import { observer } from "mobx-react";
import React from "react";
import { TableCellWrapper, TableRowWrapper } from "./Table.styled";
import { TableCheckboxCell } from "./TableCheckbox";
import { TableContext } from "./TableContext";
import { getProperty, getStyle } from "./utils";

export const TableRow = observer(
  ({ data, onClick, style, isSelected, isHighlighted }) => {
    const classNames = [];
    if (isSelected) classNames.push("selected");
    if (isHighlighted) classNames.push("highlighted");

    return (
      <TableContext.Consumer>
        {({ columns, onRowSelect, selectedRows, cellViews }) => (
          <TableRowWrapper
            className={classNames.join(" ")}
            onClick={() => {
              if (onClick) onClick(data);
            }}
            style={style}
          >
            <TableCheckboxCell
              enabled={!!onRowSelect}
              checked={selectedRows.includes(data.id)}
              onChange={(checked) => {
                onRowSelect(data.id, checked ? "add" : "delete");
              }}
            />

            {columns.map((col) => {
              const valuePath = col.id.split(":")[1] ?? col.id;
              const Renderer = cellViews?.[col.type] ?? cellViews.String;
              const style = getStyle(cellViews, col);
              const value = getProperty(data, valuePath);
              const renderProps = { column: col, original: data, value: value };

              return (
                <TableCellWrapper key={col.alias} {...style}>
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
