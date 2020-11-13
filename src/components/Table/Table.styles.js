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
      box-shadow: 0 0 0 1px #f0f0f0 inset;

      &-body {
        flex: 1;
        height: 100%;
      }

      &-head {
        flex: 0;
        z-index: 10;
        position: sticky;
        background-color: #fafafa;
        box-shadow: 0 -0.5px 0 0.5px #f0f0f0 inset;
      }

      &-row {
        display: flex;
        z-index: 1;
      }

      &-body &-row {
        height: 100px;
      }

      &-row.selected {
        z-index: 100;
        background-color: #deefff;
      }

      &-row:not(.selected).highlighted::after {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        content: "";
        z-index: 100;
        position: absolute;
        pointer-events: none;
        box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.8) inset;
      }

      &-header {
        font-weight: 500;
      }

      &-cell,
      &-header {
        flex: 1;
        display: flex;
        padding: 10px;
        min-width: 50px;
        overflow: hidden;
        align-items: center;
        box-sizing: border-box;
        border-collapse: collapse;
        box-shadow: 0.5px 0.5px 0 0.5px #f0f0f0 inset;
      }

      .selected &-cell {
        box-shadow: 0.5px 0.5px 0 0.5px #deefff inset;
      }
    }
  }

  .data-variable {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__orderable {
      cursor: pointer;
    }
  }
`;
