import { Checkbox } from "antd";
import React from "react";
import { TableCellWrapper } from "./Table.styled";

const IndeterminateCheckbox = ({ checked, indeterminate, ...props }) => {
  return (
    <Checkbox
      indeterminate={indeterminate && !checked}
      checked={checked}
      {...props}
    />
  );
};

export const TableCheckboxCell = ({
  enabled,
  checked,
  indeterminate,
  onChange,
}) => {
  return enabled ? (
    <TableCellWrapper
      width={40}
      maxWidth={40}
      justifyContent="center"
      onClick={(e) => e.stopPropagation()}
    >
      <IndeterminateCheckbox
        type="checkbox"
        checked={checked ?? false}
        indeterminate={indeterminate ?? false}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
    </TableCellWrapper>
  ) : null;
};
