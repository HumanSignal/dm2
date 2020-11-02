import { observer } from "mobx-react";
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
export const FilterInput = observer(({ filter, field, value, operator }) => {
  console.log({ field, filter, value, operator });

  const types = React.useMemo(() => FilterInputs[field.type], [field]);

  const selected = React.useMemo(() => {
    if (operator) {
      return types.find((t) => t.key === operator);
    } else {
      const type = types[0];
      filter.setOperator(type.key);
      return type;
    }
  }, [operator, types, filter]);

  const Input = selected.input;

  return (
    <>
      <div className="filter-line__column">
        <FilterDropdown
          width={field.width ?? 90}
          placeholder="Condition"
          defaultValue={filter.operator}
          items={types.map(({ key, label }) => ({ value: key, label }))}
          onChange={(selectedKey) => filter.setOperator(selectedKey)}
        />
      </div>
      <div className="filter-line__column">
        <Input
          key={filter.filter.id}
          {...field}
          schema={filter.schema}
          value={value}
          onChange={(e, value) => {
            filter.setValue(value);
          }}
        />
      </div>
    </>
  );
});
