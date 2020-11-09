import React from "react";

export const ListView = ({
  getTableProps,
  getTableBodyProps,
  tableHead,
  prepareRow,
  headerGroups,
  rows,
  view,
  selected,
  onScroll,
}) => {
  const tableHeadContent = (
    <thead ref={tableHead} className="dm-content__table-head">
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
        const isCurrent = currentTask === selected;
        const rowProps = row.getRowProps({
          style: {
            background: isCurrent ? "#efefef" : "none",
          },
          onClick() {
            if (!isCurrent) {
              view.setTask({
                id: currentTask.id,
                taskID: currentTask.task_id,
              });
            }
          },
        });

        return (
          <tr {...rowProps}>
            {row.cells.map((cell) => {
              const cellContent = cell.render("Cell");
              return <td {...cell.getCellProps()}>{cellContent ?? null}</td>;
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
