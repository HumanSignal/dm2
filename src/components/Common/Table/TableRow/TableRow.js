import { observer } from "mobx-react";
import React from "react";
import { Block } from "../../../../utils/bem";
import { TableContext, TableElem } from "../TableContext";
import { getProperty, getStyle } from "../utils";
import "./TableRow.styl";

const CellRenderer = observer(
  ({ col: colInput, data, decoration, cellViews }) => {
    const { Header, Cell, id, ...col } = colInput;

    if (Cell instanceof Function) {
      const { headerClassName: _, cellClassName, ...rest } = col;
      return (
        <TableElem {...rest} name="cell" key={id} mix={cellClassName}>
          <Cell data={data} />
        </TableElem>
      );
    }

    const valuePath = id.split(":")[1] ?? id;
    const Renderer = cellViews?.[col.original.currentType] ?? cellViews.String;
    const value = getProperty(data, valuePath);
    const renderProps = { column: col, original: data, value: value };
    const Decoration = decoration?.get?.(col);
    const style = getStyle(cellViews, col, Decoration);

    return (
      <TableElem name="cell" mix="td">
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
      </TableElem>
    );
  }
);

export const TableRow = observer(
  ({
    data,
    onClick,
    style,
    isSelected,
    isHighlighted,
    decoration,
    stopInteractions,
    even,
  }) => {
    const classNames = ["table-row"];

    if (isSelected) classNames.push("selected");
    if (isHighlighted) classNames.push("highlighted");
    if (data.isLoading) classNames.push("loading");
    if (even === true) classNames.push("even");

    const mods = {
      even,
      selected: isSelected,
      highlighted: isHighlighted,
      loading: data.isLoading,
      disabled: stopInteractions,
    };

    const { columns, cellViews } = React.useContext(TableContext);

    return (
      <Block
        name="table-row"
        style={style}
        mod={mods}
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
      </Block>
    );
  }
);
