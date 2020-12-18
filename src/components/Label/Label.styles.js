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
    max-width: 35vw;
    /* box-shadow: 0 0 0 1px #ccc; */
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

export const LabelHeader = styled.div`
  flex: 0;
  display: flex;
  padding: 0 1em 1em;
  align-items: flex-start;
  justify-content: space-between;
`;

export const LabelContent = styled.div`
  flex: 1;
  display: flex;
  height: calc(100% - 46px);
`;

export const DataViewWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  box-shadow: 0 0 0 1px #ccc;
`;
