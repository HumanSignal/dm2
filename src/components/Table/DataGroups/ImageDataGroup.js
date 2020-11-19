import React from "react";
import styled from "styled-components";

const ImageGrid = styled.div`
  display: grid;
  column-gap: 3px;
  row-gap: 3px;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: 50px;
`;

export const ImageDataGroup = ({ cells }) => {
  return (
    <ImageGrid>
      {cells.map((c) => (
        <div key={c.getCellProps().key}>{c.render("Cell")}</div>
      ))}
    </ImageGrid>
  );
};
