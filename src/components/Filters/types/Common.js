import React from "react";
import { FilterDropdown } from "../FilterDropdown";

export const Common = [
  {
    key: "empty",
    label: "is empty",
    input: (props) => (
      <FilterDropdown
        defaultValue={props.value ?? false}
        onChange={(value) => props.onChange(undefined, value)}
        items={[
          { value: true, label: "yes" },
          { value: false, label: "no" },
        ]}
      />
    ),
  },
];
