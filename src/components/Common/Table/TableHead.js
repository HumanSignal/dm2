import { Button, Dropdown, Menu, Radio } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { ViewColumnType } from "../../../stores/Views/view_column";
import { Resizer } from "../Resizer";
import {
  TableCellContent,
  TableCellWrapper,
  TableHeadExtra,
  TableHeadWrapper,
} from "./Table.styled";
import { TableContext } from "./TableContext";
import { getStyle } from "./utils";

const DropdownWrapper = observer(
  ({ column, cellViews, children, onChange }) => {
    const types = ViewColumnType._types
      .map((t) => t.value)
      .filter((t) => t in cellViews);
    return (
      <Dropdown
        overlay={
          <Menu title="Display as">
            {types.map((type) => {
              return (
                <Menu.Item key={type}>
                  <Radio
                    name={`${column.id}-type`}
                    value={type}
                    checked={type === column.currentType}
                    onChange={(e) => onChange?.(column, e.target.value)}
                  >
                    {type}
                  </Radio>
                </Menu.Item>
              );
            })}
          </Menu>
        }
        trigger="click"
      >
        <Button
          type="text"
          size="small"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "none",
          }}
        >
          {children}
        </Button>
      </Dropdown>
    );
  }
);

const ColumnRenderer = observer(
  ({
    column,
    cellViews,
    columnHeaderExtra,
    sortingEnabled,
    stopInteractions,
    decoration,
    onTypeChange,
    onResize,
    onReset,
  }) => {
    const { Header, id } = column;

    if (Header instanceof Function) {
      const { headerClassName, ...rest } = column;

      return (
        <TableCellWrapper
          {...rest}
          key={id}
          className={`th ${headerClassName}`}
        >
          <Header />
        </TableCellWrapper>
      );
    }

    const canOrder = sortingEnabled && column.original?.canOrder;
    const Decoration = decoration?.get?.(column);
    const extra = columnHeaderExtra
      ? columnHeaderExtra(column, Decoration)
      : null;
    const content = Decoration?.content
      ? Decoration.content(column)
      : column.title;
    const style = getStyle(cellViews, column, Decoration);

    const headContent = (
      <>
        <TableCellContent
          canOrder={canOrder}
          className="th-content"
          disabled={stopInteractions}
        >
          {content}
        </TableCellContent>

        {extra && <TableHeadExtra className="th-extra">{extra}</TableHeadExtra>}
      </>
    );

    return (
      <TableCellWrapper
        data-id={id}
        className={`th ${id.replace(/[:.]/g, "-")}`}
      >
        <Resizer
          style={{
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: style.justifyContent ?? "space-between",
            overflow: "hidden",
          }}
          handleStyle={{
            marginLeft: 9,
          }}
          initialWidth={style.width ?? 150}
          onResizeFinished={(width) => onResize?.(column, width)}
          onReset={() => onReset?.(column)}
        >
          {column.parent ? (
            <DropdownWrapper
              column={column}
              cellViews={cellViews}
              onChange={onTypeChange}
            >
              {headContent}
            </DropdownWrapper>
          ) : (
            headContent
          )}
        </Resizer>
      </TableCellWrapper>
    );
  }
);

export const TableHead = observer(
  React.forwardRef(
    (
      {
        style,
        columnHeaderExtra,
        sortingEnabled,
        stopInteractions,
        decoration,
        onTypeChange,
        onResize,
        onReset,
      },
      ref
    ) => {
      return (
        <TableContext.Consumer>
          {({ columns, headerRenderers, cellViews }) => (
            <TableHeadWrapper ref={ref} style={style}>
              {columns.map((col) => {
                return (
                  <ColumnRenderer
                    key={col.id}
                    column={col}
                    headerRenderers={headerRenderers}
                    cellViews={cellViews}
                    columnHeaderExtra={columnHeaderExtra}
                    sortingEnabled={sortingEnabled}
                    stopInteractions={stopInteractions}
                    decoration={decoration}
                    onTypeChange={onTypeChange}
                    onResize={onResize}
                    onReset={onReset}
                  />
                );
              })}
            </TableHeadWrapper>
          )}
        </TableContext.Consumer>
      );
    }
  )
);
