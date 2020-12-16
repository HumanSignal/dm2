import styled, { css } from "styled-components";

export const Styles = styled.div`
  height: 100%;
  min-height: 500px;
  padding: 1em 0 0;
  box-sizing: border-box;
  background-color: #fafafa;

  .tab-panel {
    display: flex;
    justify-content: space-between;
    padding-top: 1em;
    padding-bottom: 1em;
  }

  .grid {
    flex: 1;
  }

  .grid__item {
    padding: 10px;
    justify-content: space-between;
    box-sizing: border-box;
    box-shadow: -0.5px -0.5px 0 0.5px #ccc;
  }

  .checkbox {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .container {
    padding: 2em;
    width: 90%;
    height: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .antdTable {
    width: auto;
  }

  .app-loader {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flex-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ant-picker-cell {
    padding: 3px 0 !important;
    border: none !important;
  }
`;

export const HorizontalShadow = css`
  &::after {
    top: 100%;
    width: 100%;
    left: 0;
    content: "";
    position: absolute;
    height: 2px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), transparent);
  }
`;

export const FillContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;
