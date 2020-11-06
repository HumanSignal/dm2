import { getRoot } from "mobx-state-tree";
import React from "react";

export const ListView = ({
  getTableProps,
  getTableBodyProps,
  getPropsForColumnCell,
  tableHead,
  prepareRow,
  headerGroups,
  rows,
  view,
  task,
  onScroll,
}) => {
  const tableHeadContent = (
    <thead ref={tableHead} className="dm-content__table-head">
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th {...column.getHeaderProps(getPropsForColumnCell(column))}>
              {column.render("Header")}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );

  const tableBodyContent = (
    <tbody {...getTableBodyProps()}>
      {rows.map((row, i) => {
        prepareRow(row);
        const currentTask = row.original;
        const isCurrent = currentTask === task;
        const rowProps = row.getRowProps({
          style: {
            background: isCurrent ? "#efefef" : "none",
          },
          onClick() {
            if (!isCurrent) {
              getRoot(view).dataStore.setSelected(currentTask);
            }
          },
        });

        return (
          <tr {...rowProps}>
            {row.cells.map((cell) => {
              const cellProps = {
                ...cell.getCellProps(),
                ...getPropsForColumnCell(cell.column),
              };

              const cellContent = cell.render("Cell");

              return <td {...cellProps}>{cellContent ?? null}</td>;
            })}
          </tr>
        );
      })}
    </tbody>
  );

  return (
    <div className="dm-content__table" onScroll={onScroll}>
      <table {...getTableProps()}>
        {tableHeadContent}
        {tableBodyContent}
      </table>
    </div>
  );
};
