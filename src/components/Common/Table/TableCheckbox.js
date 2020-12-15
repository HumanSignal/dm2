import { Checkbox } from "antd";
import React from "react";
import styled from "styled-components";
import { TableCellWrapper } from "./Table.styled";

const StyledCheckbox = styled(Checkbox)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IndeterminateCheckbox = ({ checked, indeterminate, ...props }) => {
  return (
    <StyledCheckbox
      indeterminate={indeterminate && !checked}
      checked={checked}
      {...props}
    />
  );
};

export const TableCheckboxCell = ({
  enabled,
  hidden,
  checked,
  indeterminate,
  onChange,
  className,
}) => {
  return enabled ? (
    <TableCellWrapper
      width={40}
      maxWidth={40}
      className={className}
      justifyContent="center"
      onClick={(e) => e.stopPropagation()}
    >
      {!hidden && (
        <IndeterminateCheckbox
          type="checkbox"
          checked={checked ?? false}
          indeterminate={indeterminate ?? false}
          onChange={(e) => {
            onChange(e.target.checked);
          }}
        />
      )}
    </TableCellWrapper>
  ) : null;
};
