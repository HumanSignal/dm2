import { observer, useLocalStore } from "mobx-react";
import { toJS } from "mobx";
import React, { forwardRef, useEffect, useRef } from "react";
import {
  ViewColumnType,
  ViewColumnTypeName,
  ViewColumnTypeShort
} from "../../../../stores/Tabs/tab_column";
import { BemWithSpecifiContext } from "../../../../utils/bem";
import { Button } from "../../Button/Button";
import { Dropdown } from "../../Dropdown/Dropdown";
import { Menu } from "../../Menu/Menu";
import { Resizer } from "../../Resizer/Resizer";
import { Space } from "../../Space/Space";
import { Tag } from "../../Tag/Tag";
import { TableCell, TableCellContent } from "../TableCell/TableCell";
import { TableContext, TableElem } from "../TableContext";
import { getStyle } from "../utils";
import "./TableHead.styl";
import { useCallback } from "react";

const { Block, Elem } = BemWithSpecifiContext();

const DropdownWrapper = observer(
  ({ column, cellViews, children, onChange }) => {
    const types = ViewColumnType._types
      .map((t) => t.value)
      .filter((t) => {
        const cellView = cellViews[t];

        const selectable = cellView?.userSelectable !== false;
        const displayType = cellView?.displayType !== false;

        return cellView && (selectable && displayType);
      });

    return (
      <Dropdown.Trigger
        content={(
          <Menu
            title="Display as"
            size="compact"
            selectedKeys={[column.currentType]}
          >
            {types.map((type) => {
              return (
                <Menu.Item key={type} onClick={() => onChange?.(column, type)}>
                  <Space>
                    <Tag
                      size="small"
                      style={{
                        width: 45,
                        textAlign: "center",
                        cursor: "pointer",
                        fontSize: 14,
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
        )}
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
            fontSize: 14,
          }}
        >
          {children}
        </Button>
      </Dropdown.Trigger>
    );
  },
);

const ColumnRenderer = observer(
  ({
    column: columnInput,
    cellViews,
    columnHeaderExtra,
    sortingEnabled,
    stopInteractions,
    decoration,
    onTypeChange,
    onResize,
    onReset,
  }) => {
    const { Header, Cell: _, id, ...column } = columnInput;

    if (Header instanceof Function) {
      const { cellClassName: _, headerClassName, ...rest } = column;

      return (
        <TableElem 
          {...rest} 
          name="cell" 
          key={id} 
          mix={["th", headerClassName]}
        >
          <Header />
        </TableElem>
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
          mod={{ canOrder, disabled: stopInteractions }}
          mix="th-content"
        >
          {content}
        </TableCellContent>

        {extra && <Elem name="column-extra">{extra}</Elem>}
      </>
    );

    return (
      <TableCell data-id={id} mix="th">
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
          minWidth={style.minWidth ?? 30}
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
      </TableCell>
    );
  },
);

export const TableHead = observer(
  forwardRef(
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
      ref,
    ) => {
      const { columns, headerRenderers, cellViews } = React.useContext(
        TableContext,
      );
      const states = useLocalStore(() => ({
        displayedColumns: [],
        setDisplayedColumns(updatedColumns) {
          states.displayedColumns = [...updatedColumns];
        },
        getDisplayedColumns() {
          return toJS(states.displayedColumns) ?? [];
        },
        isDragging: false,
        setIsDragging(isDragging) {
          states.isDragging = isDragging;
        },
        getIsDragging() {
          return toJS(states.isDragging);
        },
        initialDragPos: false,
        setInitialDragPos(initPos) {
          states.initialDragPos = initPos;
        },
        getInitialDragPos() {
          return toJS(states.isDragging);
        },
        draggedCol: false,
        setDraggedCol(draggedCol) {
          states.draggedCol = draggedCol;
        },
        getDraggedCol() {
          return toJS(states.draggedCol);
        },
      }));
      let colRefs = useRef({});

      useEffect(() => {
        states.setDisplayedColumns(columns);
      }, [columns]);

      return (
        <Block
          name="table-head"
          ref={ref}
          style={style}
          mod={{ droppable: true }}
          mix="horizontal-shadow"
          onDragOver={useCallback((e) => {
            const updatedColumns = [...states.getDisplayedColumns()].sort((a, b) => {
              const colRefrence = colRefs.current;
              const colAID = a.id;
              const colBID = b.id;

              console.log(colRefrence, colRefrence[colAID], colRefrence[colBID]);
              return 0;
            });

            console.log("onDragOver", e.clientX, updatedColumns);
          }, [states])}
        >
          {states.getDisplayedColumns().map((col) => {
            
            return (
              <Elem name="draggable" draggable={true} ref={(ele) => colRefs.current[col.id] = ele} key={col.id}
                onDragStart={() => {
                  const ele = colRefs.current[col.id];

                  states.setInitialDragPos({
                    x: ele.clientX,
                    y: ele.clientY,
                  });
                  states.setDraggedCol(ele);
                }}
                onDragEnd ={(e) => {
                  console.log("drag ended", col, e, colRefs[col.id]);
                  states.setDraggedCol(colRefs[col.id]);
                }}>
                <ColumnRenderer
                  column={col}
                  mod={{ draggable: true }}
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
              </Elem>
            );
          })}
          <Elem name="extra">{extra}</Elem>
        </Block>
      );
    },
  ),
);
