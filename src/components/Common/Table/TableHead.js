import { Space, Tag } from "antd";
import { observer } from "mobx-react";
import React from "react";
import {
  ViewColumnType,
  ViewColumnTypeName,
  ViewColumnTypeShort,
} from "../../../stores/Tabs/tab_column";
import { Button } from "../Button/Button";
import { Dropdown } from "../Dropdown/Dropdown";
import { Menu } from "../Menu/Menu";
import { Resizer } from "../Resizer";
import {
  TableCellContent,
  TableCellWrapper,
  TableHeaderExtra,
  TableHeadExtra,
  TableHeadWrapper,
} from "./Table.styled";
import { TableContext } from "./TableContext";
import { getStyle } from "./utils";

const DropdownWrapper = observer(
  ({ column, cellViews, children, onChange }) => {
    const types = ViewColumnType._types
      .map((t) => t.value)
      .filter((t) => t in cellViews && cellViews[t].userSelectable !== false);
    return (
      <Dropdown.Trigger
        style={{ display: "flex", justifyContent: "space-between", flex: 1 }}
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

        <Dropdown>
          <Menu title="Display as" selectedKeys={[column.currentType]}>
            {types.map((type) => {
              return (
                <Menu.Item key={type} onClick={(e) => onChange?.(column, type)}>
                  <Space>
                    <Tag
                      color="blue"
                      style={{
                        width: 45,
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                    >
                      {ViewColumnTypeShort(type)}
                    </Tag>
                    {ViewColumnTypeName(type)}
                  </Space>
                </Menu.Item>
              );
            })}
          </Menu>
        </Dropdown>
      </Dropdown.Trigger>
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
        extra,
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
              <TableHeaderExtra>{extra}</TableHeaderExtra>
            </TableHeadWrapper>
          )}
        </TableContext.Consumer>
      );
    }
  )
);
