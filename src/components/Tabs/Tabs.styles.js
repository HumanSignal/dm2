import styled from "styled-components";

export const TabsStyles = styled.div`
  height: 100%;
  width: 100%;
  display: flex;

  .ant-tabs-content-holder {
    display: flex;
  }

  .ant-tabs {
    flex: 1;
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

  .sidebar {
    width: 330px;
  }

  .ant-page-header-heading {
    align-items: center;
  }
`;
