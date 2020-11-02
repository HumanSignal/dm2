import { types } from "mobx-state-tree";
import * as Filters from "../../components/Filters/types";
import {
  FilterValue,
  FilterValueRange,
  ViewFilterType,
} from "./view_filter_type";

const operatorNames = Array.from(
  new Set(
    [].concat(...Object.values(Filters).map((f) => f.map((op) => op.key)))
  )
);

console.log({ operatorNames });

const Operators = types.enumeration(operatorNames);

export const ViewFilter = types
  .model("ViewFilter", {
    filter: types.reference(ViewFilterType),
    value: types.maybeNull(
      types.union(FilterValue, FilterValueRange, types.array(FilterValue))
    ),
    operator: types.maybeNull(types.optional(Operators, "equal")),
  })
  .views((self) => ({
    get field() {
      return self.filter.field;
    },

    get schema() {
      return self.filter.schema;
    },
  }))
  .actions((self) => ({
    setFilter(value) {
      self.value = null;
      self.operator = null;
      self.filter = value;
    },
    setOperator(operator) {
      self.operator = operator;
      self.value = null;
      console.log("Operator updated");
    },
    setValue(value) {
      self.value = value;
      console.log(`Value updated: ${self.value}`);
    },
  }));
