import { observer } from "mobx-react";
import React from "react";
import { FilterDropdown } from "./FilterDropdown";
import * as FilterInputs from "./types";
import { Common } from "./types/Common";

/** @typedef {{
 * type: keyof typeof FilterInputs,
 * width: number
 * }} FieldConfig */

/**
 *
 * @param {{field: FieldConfig}} param0
 */
export const FilterOperation = observer(
  ({ filter, field, value, operator }) => {
    const types = React.useMemo(() => {
      const filterTypes = FilterInputs[field.type] ?? FilterInputs.String;
      return [...filterTypes, ...Common];
    }, [field, operator]);

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

    const onChange = (value) => {
      filter.setValue(value);
      filter.saveDelayed();
    };

    return (
      <>
        <div className="filter-line__column filter-line__operation">
          <FilterDropdown
            placeholder="Condition"
            value={filter.operator}
            disabled={types.length === 1}
            items={types.map(({ key, label }) => ({ value: key, label }))}
            onChange={(selectedKey) => filter.setOperator(selectedKey)}
          />
        </div>
        <div className="filter-line__column filter-line__value">
          <Input
            key={filter.filter.id}
            {...field}
            schema={filter.schema}
            value={value}
            onChange={onChange}
          />
        </div>
      </>
    );
  }
);
