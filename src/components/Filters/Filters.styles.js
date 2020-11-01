import styled from "styled-components";

export const FiltersStyles = styled.div`
  padding: 10px;
  margin-top: 10px;
  min-width: 400px;
  border-radius: 3px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

  .filter-line {
    display: flex;
    align-items: center;

    &__remove {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__settings {
      flex: 1;
      display: flex;
      align-items: center;
    }

    &__column:not(:last-child) {
      margin-right: 5px;
    }
  }

  .filter-line + .filter-line {
    margin-top: 10px;
  }

  .filters {
    &__settings {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }

    &__actions {
      margin-top: 10px;
    }
  }
`;
