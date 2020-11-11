import { getParent, types } from "mobx-state-tree";
import * as Filters from "../../components/Filters/types";
import { debounce } from "../../utils/debounce";
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

    /** @returns {import("./view").View} */
    get view() {
      return getParent(getParent(self));
    },

    get component() {
      return Filters[self.filter.type];
    },

    get componentValueType() {
      return self.component?.find(({ key }) => key === self.operator)
        ?.valueType;
    },

    get target() {
      return self.filter.field.target;
    },
  }))
  .actions((self) => ({
    setFilter(value) {
      self.filter = value;
      self.setOperator(self.component[0].key);
    },

    setOperator(operator) {
      const valueType = self.componentValueType;
      self.operator = operator;

      if (valueType !== self.componentValueType) {
        self.setValue(null);
      }

      self.save();
    },

    setValue(value) {
      self.value = value;
    },

    delete() {
      self.view.deleteFilter(self);
    },

    save() {
      if (self.value) {
        self.view.save();
      }
    },

    setValueDelayed: debounce((value) => {
      self.setValue(value);
      self.view.save();
    }, 300),
  }));
