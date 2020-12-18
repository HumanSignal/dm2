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

    &-tabpane {
      display: none;
    }
  }

  .sidebar {
    width: 350px;
    background: #fff;
    margin-top: -1em;
    padding-top: 1em;
  }

  .sidebar::before {
    content: "";
    position: absolute;
    top: 0;
    right: 100%;
    width: 2px;
    height: 100%;
    background: linear-gradient(to right, #0000002e, transparent);
    z-index: 100;
  }

  .ant-tabs-nav {
    margin-bottom: 0;
  }

  .ant-page-header-heading {
    align-items: center;
  }

  .tab-panel {
    padding: 1em;
    z-index: 100;
    position: relative;
    background-color: #fff;
  }
`;

export const TabsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
