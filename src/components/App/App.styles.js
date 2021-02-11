import styled, { css } from "styled-components";

const TabsRestyle = css`
  .ant-tabs {
    width: 100%;
    flex: none;
    line-height: normal;

    &-tabpane {
      display: none;
    }
  }

  .ant-tabs > .ant-tabs-nav,
  .ant-tabs-top > .ant-tabs-nav {
    padding-left: 0;
    margin-bottom: 0;
  }

  .ant-tabs-content-holder {
    display: none;
  }

  .ant-tabs-extra-content {
    display: flex;
  }

  .ant-tabs-nav::before {
    border-block-color: #d9d9d9;
  }

  .ant-tabs-nav
    > .ant-tabs-nav-wrap
    > .ant-tabs-nav-list
    > .ant-tabs-tab:not(:last-of-type) {
    margin-right: 0;
  }

  .ant-tabs-nav > .ant-tabs-nav-wrap > .ant-tabs-nav-list > .ant-tabs-tab {
    border: none;
    height: 34px;
    border-radius: 0;
    font-size: 14px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    box-shadow: 0 0 0 1px #d9d9d9;
    border-top: 1px solid transparent;
    border-bottom: 1px solid #d9d9d9;
    background-color: #f5f5f5;
  }

  .ant-tabs-nav
    > .ant-tabs-nav-wrap
    > .ant-tabs-nav-list
    > .ant-tabs-tab.ant-tabs-tab-active {
    border-top-color: #69c0ff;
    border-bottom: 1px solid transparent;
    background-color: #fff;
  }

  .ant-tabs > .ant-tabs-nav .ant-tabs-nav-add {
    box-shadow: none;
    border: none;
    background: none;
  }

  .ant-tabs .ant-tabs-tab .ant-tabs-tab-btn {
    font-size: 14px;
    line-height: 24px;
  }
`;

const ButtonGroupRestyle = css`
  .ant-btn:not(.ant-btn-link):not(.ant-btn-text).ant-dropdown-trigger,
  .ant-btn-group > .ant-btn:not(:disabled) {
    border-color: #d9d9d9;
    background-color: #f5f5f5;
  }

  .ant-btn:not(.ant-btn-link):not(.ant-btn-text).ant-dropdown-trigger:disabled,
  .ant-btn-group > .ant-btn:disabled,
  .ant-radio-button-wrapper-disabled {
    opacity: 0.7;
  }

  .ant-btn {
    box-shadow: none;
    border-radius: var(--btn-radius);
    font-size: 12px;
  }

  .ant-btn-group .ant-btn:first-child {
    border-radius: var(--btn-radius) 0 0 var(--btn-radius);
  }

  .ant-btn-group .ant-btn:last-child {
    border-radius: 0 var(--btn-radius) var(--btn-radius) 0;
  }

  .ant-radio-button-wrapper {
    border-color: #d9d9d9;
    background-color: #f5f5f5;
    color: #595959;
  }

  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    background-color: #1890ff;
    border-color: #1890ff;
    color: #fff;
  }

  .ant-radio-button-wrapper {
    font-size: 12px;
  }

  .ant-radio-button-wrapper:first-child {
    border-radius: var(--btn-radius) 0 0 var(--btn-radius);
  }

  .ant-radio-button-wrapper:last-child {
    border-radius: 0 var(--btn-radius) var(--btn-radius) 0;
  }
`;

const TagRestyle = css`
  .ant-tag {
    border: none;
  }
`;

export const Styles = styled.div`
  --btn-radius: 4px;
  ${TabsRestyle}
  ${ButtonGroupRestyle}
  ${TagRestyle}

  height: 100%;
  min-height: 500px;
  box-sizing: border-box;
  background-color: #f0f0f0;

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
