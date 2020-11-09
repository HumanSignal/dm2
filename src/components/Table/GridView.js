import React from "react";

export const GridView = ({ rows, prepareRow }) => {
  return (
    <>
      <div className="grid">
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <div {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return (
                  <div {...cell.getCellProps()}>{cell.render("Cell")}</div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
};
