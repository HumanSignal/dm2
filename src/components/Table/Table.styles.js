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
      padding-top: 10px;
    }

    &__table {
      flex: 1;
      height: 100%;
      overflow: auto;

      & > table {
        width: 100%;
      }
    }
  }
`;
