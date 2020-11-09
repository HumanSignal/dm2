import styled from "styled-components";

export const TableStyles = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  flex-direction: column;

  .dm-content {
    &__statusbar {
      display: flex;
      align-items: center;
      padding: 10px 0;
    }

    &__table {
      flex: 1;
      display: flex;
      height: 100%;
      width: 100%;
      flex-direction: column;
      box-shadow: 0.5px 0.5px 0 0.5px #f0f0f0 inset;

      &-body {
        flex: 1;
        height: 100%;
      }

      &-head {
        flex: 0;
        background-color: #fafafa;
        font-weight: bold;
      }

      &-row {
        display: flex;
      }

      &-body &-row {
        height: 100px;
      }

      &-cell,
      &-header {
        flex: 1;
        display: flex;
        align-items: center;
        padding: 10px;
        box-sizing: border-box;
        border-collapse: collapse;
        box-shadow: 0.5px 0.5px 0 0.5px #f0f0f0 inset;
      }
    }
  }
`;
