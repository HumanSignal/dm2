import { Button, Dropdown, Menu, Radio } from "antd";
import { observer } from "mobx-react";
import React from "react";
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
    return (
      <Dropdown
        overlay={
          <Menu title="Display as">
            {Object.keys(cellViews).map((view) => {
              return (
                <Menu.Item key={view}>
                  <Radio
                    name={`${column.id}-type`}
                    value={view}
                    checked={view === column.type}
                    onChange={(e) => onChange?.(column, e.target.value)}
                  >
                    {view}
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

export const TableHead = observer(
  React.forwardRef(
    (
      {
        style,
        columnHeaderExtra,
        sortingEnabled,
        stopInteractions,
        cellDecoration,
        onTypeChange,
      },
      ref
    ) => {
      return (
        <TableContext.Consumer>
          {({ columns, headerRenderers, cellViews }) => (
            <TableHeadWrapper ref={ref} style={style}>
              {columns.map((col) => {
                const { Header, id } = col;

                if (Header instanceof Function) {
                  const { headerClassName, ...rest } = col;
                  return (
                    <TableCellWrapper
                      {...rest}
                      key={id}
                      className={headerClassName}
                    >
                      <Header />
                    </TableCellWrapper>
                  );
                }

                const Renderer = headerRenderers?.[id];
                const canOrder = sortingEnabled && col.original?.canOrder;
                const decoration = cellDecoration[col.alias];
                const extra = columnHeaderExtra
                  ? columnHeaderExtra(col, decoration)
                  : null;
                const content = decoration?.content
                  ? decoration.content(col)
                  : col.title;
                const style = getStyle(cellViews, col, decoration);

                const headContent = (
                  <>
                    <TableCellContent
                      canOrder={canOrder}
                      className="th-content"
                      disabled={stopInteractions}
                    >
                      {Renderer ? <Renderer column={col} /> : content}
                    </TableCellContent>

                    {extra && (
                      <TableHeadExtra className="th-extra">
                        {extra}
                      </TableHeadExtra>
                    )}
                  </>
                );

                return (
                  <TableCellWrapper
                    key={id}
                    {...style}
                    className={`th ${id.replace(/[:.]/g, "-")}`}
                    data-id={id}
                  >
                    {col.parent ? (
                      <DropdownWrapper
                        column={col}
                        cellViews={cellViews}
                        onChange={onTypeChange}
                      >
                        {headContent}
                      </DropdownWrapper>
                    ) : (
                      headContent
                    )}
                  </TableCellWrapper>
                );
              })}
            </TableHeadWrapper>
          )}
        </TableContext.Consumer>
      );
    }
  )
);
