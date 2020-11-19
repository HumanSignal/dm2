const { default: styled } = require("styled-components");

export const Styles = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .navigation {
    padding: 15px;
  }

  .wrapper {
    display: flex;
    align-items: stretch;
    height: 100%;
  }

  .table {
    display: flex;
    flex: 200px 0 0;
    margin-right: 1em;
    flex-direction: column;
  }

  .label-studio {
    width: 100%;
    overflow: auto;
    box-sizing: border-box;
    padding-bottom: 50px;
  }

  .ant-page-header {
    flex: 1;
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
`;
