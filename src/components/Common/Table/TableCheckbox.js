import { Checkbox } from "antd";
import React from "react";
import styled from "styled-components";

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
  hidden,
  checked,
  indeterminate,
  onChange,
  className,
}) => {
  return (
    <IndeterminateCheckbox
      type="checkbox"
      checked={checked ?? false}
      indeterminate={indeterminate ?? false}
      onChange={(e) => {
        onChange(e.target.checked);
      }}
    />
  );
};
