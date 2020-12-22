import styled, { css } from "styled-components";
import { HorizontalShadow } from "../../App/App.styles";

export const TableWrapper = styled.div`
  width: ${({ fitToContent }) => (fitToContent ? "min-content" : "100%")};
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background-color: #efefef;

  .table-auto-size,
  .virtual-table {
    width: ${({ fitToContent }) =>
      fitToContent ? "fit-content" : "auto"} !important;
    min-width: ${({ fitToContent }) =>
      fitToContent ? "fit-content" : "auto"} !important;
  }

  .virtual-table > div {
    min-width: fit-content;
  }

  .row-wrapper {
    min-width: fit-content;
  }
`;

export const TableHeadWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 50px;
  z-index: 150;
  font-weight: bold;
  position: sticky;
  overflow: visible;
  background-color: #fff;
  min-width: fit-content;

  ${HorizontalShadow}
`;

export const TableBody = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  flex-flow: row wrap;
`;

export const TableRowWrapper = styled.div`
  width: auto;
  z-index: 5;
  cursor: pointer;
  position: relative;
  display: inline-flex;

  &.even .td {
    background-color: #fafafa;
  }

  &.selected,
  &:hover {
    z-index: 50;

    .td {
      background-color: #e3f1ff;
    }
  }

  &.loading {
    opacity: 0.4;
    pointer-events: none;
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

  &[disabled] {
    pointer-events: none;
    opacity: 0.6;
  }
`;

export const TableCellWrapper = styled.div`
  flex: ${({ width }) => `${width ?? 150} 0 auto`};
  width: ${({ width }) => width ?? 150}px;
  min-width: ${({ width, minWidth }) => minWidth ?? width ?? 150}px;
  max-width: ${({ width, minWidth, maxWidth }) =>
    `${maxWidth ?? minWidth ?? width}px` ?? "auto"};
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: ${({ justifyContent }) => justifyContent ?? "space-between"};
  position: relative;
  background-color: #fff;
  overflow: hidden;
  word-break: break-word;

  &.th {
    background-color: #fff;
  }
`;

export const TableCellContent = styled.div`
  flex: 0;
  display: flex;
  white-space: nowrap;
  align-items: center;

  ${({ disabled }) =>
    disabled
      ? css`
          pointer-events: none;
          opacity: 0.6;
        `
      : null}
`;

export const TableHeadExtra = styled.div`
  margin-left: 10px;
  display: flex;
  align-items: center;
`;
