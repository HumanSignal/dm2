import { observer } from "mobx-react";
import React, { useCallback, useMemo } from "react";
import { Elem } from "../../../utils/bem";
import { FilterDropdown } from "../FilterDropdown";
import * as FilterInputs from "../types";
import { Common } from "../types/Common";

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
    const types = useMemo(() => {
      const filterTypes = FilterInputs[filter.filter.currentType] ?? FilterInputs.String;
      return [...filterTypes, ...Common];
    }, [filter, operator]);

    const selected = useMemo(() => {
      if (operator) {
        const selectedOperator = types.find((t) => t.key === operator);
        return selectedOperator;
      } else {
        const type = types[0];
        filter.setOperator(type.key);
        return type;
      }
    }, [operator, types, filter]);

    const onChange = useCallback((value) => {
      filter.setValueDelayed(value);
    }, [filter]);

    const Input = selected.input;

    return (
      <>
        <Elem block="filter-line" name="column" mix="operation">
          <FilterDropdown
            placeholder="Condition"
            value={filter.operator}
            disabled={types.length === 1}
            items={types.map(({ key, label }) => ({ value: key, label }))}
            onChange={(selectedKey) => filter.setOperator(selectedKey)}
          />
        </Elem>
        <Elem block="filter-line" name="column" mix="value">
          <Input
            {...field}
            key={filter.filter.id}
            schema={filter.schema}
            value={value}
            onChange={onChange}
          />
        </Elem>
      </>
    );
  }
);
