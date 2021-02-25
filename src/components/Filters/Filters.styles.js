import React from "react";
import styled from "styled-components";

const Wrapper = ({ className, children, ...rest }) => {
  return (
    <div className={className} {...rest}>
      {children({ className })}
    </div>
  );
};

export const FiltersStyles = styled(Wrapper)`
  padding-top: 10px;
  background-color: white;

  &.filters {
    position: relative;
  }

  &:not(.filters__sidebar) {
    min-width: 400px;
    border-radius: 2px;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  }

  &.filters__sidebar {
    width: 100%;

    .filter-line {
      padding-right: 10px;
      padding-left: 10px;
      align-items: stretch;

      .ant-divider {
        margin: 0;
        height: 24px;
      }

      &__field {
        width: 100%;
      }

      &__settings {
        flex-direction: column;
      }

      &__remove {
        height: 56px;
      }

      &__group {
        flex: 1;
        padding: 2px 0;
        width: 100%;
      }
    }
  }

  .filters {
    &__actions {
      display: flex;
      margin-top: 10px;
      padding: 0 10px 10px;
      justify-content: space-between;
    }

    &__empty {
      padding: 0 10px;
      font-size: 14px;
      color: #585858;
    }

    &__selector {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .filters__selector__tag.ant-tag,
  .ant-select-selector .filters__selector__tag.ant-tag {
    font-size: 11px;
    padding: 0 2px;
    font-weight: 300;
    margin: 0 0 0 7px;
    height: 16px;
    display: flex;
    align-items: center;
    flex: 0;
  }
`;
