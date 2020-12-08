import styled from "styled-components";

export const TableWrapper = styled.div`
  width: ${({ fitToContent }) => (fitToContent ? "min-content" : "100%")};
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 0 1px #f0f0f0 inset;
  overflow: auto;

  .table-auto-size,
  .virtual-table {
    width: ${({ fitToContent }) =>
      fitToContent ? "fit-content" : "auto"} !important;
    min-width: ${({ fitToContent }) =>
      fitToContent ? "fit-content" : "auto"} !important;
  }
`;

export const TableHeadWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 50px;
  z-index: 150;
  font-weight: bold;
  position: sticky;
  background-color: #fafafa;
`;

export const TableBody = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  flex-flow: row wrap;
`;

export const TableRowWrapper = styled.div`
  display: flex;
  width: 100%;
  z-index: 5;
  cursor: pointer;

  &.selected,
  &:hover {
    z-index: 50;
    background-color: #f3f9ff;
  }

  &:not(.selected).highlighted::after {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    content: "";
    z-index: 50;
    position: absolute;
    pointer-events: none;
    box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.8) inset;
  }
`;

export const TableCellWrapper = styled.div`
  flex: ${({ width }) => `${width ?? 150} 0 auto`};
  width: ${({ width }) => width ?? 150}px;
  min-width: ${({ width, minWidth }) => minWidth ?? width ?? 150}px;
  max-width: ${({ maxWidth }) => `${maxWidth}px` ?? "auto"};
  padding: 10px;
  box-sizing: border-box;
  box-shadow: 0 0 0 0.5px #f0f0f0 inset;
  display: flex;
  align-items: center;
  justify-content: ${({ justifyContent }) => justifyContent ?? "space-between"};
  overflow: hidden;
  position: relative;
`;

export const TableCellContent = styled.div`
  flex: 0;
  display: flex;
  white-space: nowrap;
  align-items: center;
  cursor: ${({ canOrder }) => (canOrder ? "pointer" : "default")};
`;

export const TableHeadExtra = styled.div`
  margin-left: 10px;
  display: flex;
  align-items: center;
`;
