import React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

const compileRowProps = (row, view, selected, style) => {
  const currentTask = row.original;
  const isCurrent = currentTask === selected;
  const props = row.getRowProps({
    onClick() {
      if (!isCurrent) {
        view.setTask({
          id: currentTask.id,
          taskID: currentTask.task_id,
        });
      }
    },
  });
  const styles = {
    ...style,
    background: isCurrent ? "#efefef" : "none",
  };

  if (props.style) {
    Object.assign(props.style, styles);
  } else {
    props.style = styles;
  }

  return props;
};

export const ListView = ({
  getTableProps,
  getTableBodyProps,
  prepareRow,
  headerGroups,
  rows,
  view,
  selected,
}) => {
  const tableHead = React.useRef();

  const renderRow = React.useCallback(
    ({ style, index }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div
          {...compileRowProps(row, view, selected, style)}
          className="dm-content__table-row"
        >
          {row.cells.map((cell) => (
            <div {...cell.getCellProps()} className="dm-content__table-cell">
              {cell.render("Cell") ?? null}
            </div>
          ))}
        </div>
      );
    },
    [rows, prepareRow, selected, view]
  );

  const tableHeadContent = (
    <div ref={tableHead} className="dm-content__table-head">
      {headerGroups.map((headerGroup) => (
        <div
          {...headerGroup.getHeaderGroupProps()}
          className="dm-content__table-row"
        >
          {headerGroup.headers.map((column) => (
            <div
              {...column.getHeaderProps()}
              className="dm-content__table-header"
            >
              {column.render("Header")}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const tableBodyContent = (
    <div {...getTableBodyProps()} className="dm-content__table-body">
      <AutoSizer>
        {({ width, height }) => (
          <FixedSizeList
            width={width}
            height={height}
            itemSize={100}
            itemCount={rows.length}
          >
            {renderRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );

  return (
    <div {...getTableProps({ className: "dm-content__table" })}>
      {tableHeadContent}
      {tableBodyContent}
    </div>
  );
};
