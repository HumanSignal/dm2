import { observer } from "mobx-react";
import React from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import {
  TableCellContent,
  TableCellWrapper,
  TableHeadExtra,
  TableHeadWrapper,
} from "./Table.styled";
import { TableCheckboxCell } from "./TableCheckbox";
import { TableContext } from "./TableContext";
import { getStyle } from "./utils";

const OrderButton = observer(({ desc }) => {
  let SortIcon = FaSort;
  if (desc !== undefined) {
    SortIcon = desc ? FaSortDown : FaSortUp;
  }

  return (
    <SortIcon
      style={{ marginLeft: 10, opacity: desc !== undefined ? 0.8 : 0.25 }}
    />
  );
});

export const TableHead = observer(
  ({
    style,
    columnHeaderExtra,
    onSetOrder,
    sortingEnabled,
    selected,
    onSelect,
    stopInteractions,
    cellDecoration,
    ...props
  }) => {
    return (
      <TableContext.Consumer>
        {({ columns, headerRenderers, cellViews }) => (
          <TableHeadWrapper style={style}>
            <TableCheckboxCell
              enabled={!!onSelect}
              checked={selected.isAllSelected}
              indeterminate={selected.isIndeterminate}
              onChange={() => onSelect?.()}
              className="th"
            />

            {columns.map((col) => {
              const Renderer = headerRenderers?.[col.id];
              const extra = columnHeaderExtra ? columnHeaderExtra(col) : null;
              const canOrder = sortingEnabled && col.original?.canOrder;
              const Decoration = cellDecoration[col.alias];
              const content = Decoration?.content
                ? Decoration.content(col)
                : col.title;
              const style = getStyle(cellViews, col, Decoration);

              return (
                <TableCellWrapper
                  key={col.id}
                  {...style}
                  className="th"
                  data-id={col.id}
                >
                  <TableCellContent
                    canOrder={canOrder}
                    className="th-content"
                    onClick={() => canOrder && onSetOrder?.(col)}
                    disabled={props.stopInteractions}
                  >
                    {Renderer ? <Renderer column={col} /> : content}

                    {canOrder && <OrderButton desc={col.original.order} />}
                  </TableCellContent>

                  {extra && (
                    <TableHeadExtra className="th-extra">
                      {extra}
                    </TableHeadExtra>
                  )}
                </TableCellWrapper>
              );
            })}
          </TableHeadWrapper>
        )}
      </TableContext.Consumer>
    );
  }
);
