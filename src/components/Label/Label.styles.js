import styled from "styled-components";

export const Styles = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .navigation {
    padding: 15px;
  }

  .table {
    display: flex;
    flex: 200px 0 0;
    flex-direction: column;
  }

  .label-studio {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .label-studio__toolbar {
    height: 50px;
  }

  .label-studio__content {
    flex: 1;
    overflow: auto;
    box-sizing: border-box;
    padding-bottom: 50px;
  }

  .ant-page-header {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .ant-page-header-content {
    flex: 1;
    display: flex;
    overflow: hidden;

    .tab-panel {
      padding-top: 0;
    }
  }

  .ant-page-header-heading-title {
    font-weight: 400;
  }
`;

export const LabelStudioWrapper = styled.div`
  flex: 1;
  overflow: auto;
  box-sizing: border-box;
  padding-bottom: 50px;
  overflow: auto;
`;

export const LabelStudioContent = styled.div`
  padding: 0 1em;
`;

export const Hint = styled.sup`
  font-size: 9px;
`;
