import React from "react";
import { FilterDropdown } from "./FilterDropdown";
import * as FilterInputs from "./types";

/** @typedef {{
 * type: keyof typeof FilterInputs,
 * width: number
 * }} FieldConfig */

/**
 *
 * @param {{field: FieldConfig}} param0
 */
export const FilterInput = ({ field }) => {
  const type = FilterInputs[field.type];
  const [selected, setSelected] = React.useState(type[0]);
  const Input = selected.input;

  return (
    <>
      <div className="filter-line__column">
        <FilterDropdown
          width={field.width}
          placeholder="Condition"
          defaultValue={selected.key}
          items={type.map(({ key, label }) => ({ value: key, label }))}
          onChange={(selectedKey) => {
            setSelected(type.find(({ key }) => key === selectedKey));
          }}
        />
      </div>
      <div className="filter-line__column">
        <Input key={selected.key} {...field} />
      </div>
    </>
  );
};
