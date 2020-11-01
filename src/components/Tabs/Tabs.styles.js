import styled from "styled-components";

export const TabsStyles = styled.div`
  height: 100%;
  width: 100%;

  .ant-tabs-content-holder {
    display: flex;
  }

  .ant-tabs {
    height: 100%;

    &-tabpane {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .tab-panel {
    display: flex;
    justify-content: space-between;
    padding-top: 1em;
    padding-bottom: 1em;
  }
`;
