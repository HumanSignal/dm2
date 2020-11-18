import { isPrimitiveType, types } from "mobx-state-tree";
import * as FilterTypes from "../../components/Filters/types";
import { ViewColumn } from "./view_column";

export const FilterValue = types.union(
  types.string,
  types.number,
  types.boolean
);

export const FilterItemValue = types.model("FilterItemValue", {
  value: FilterValue,
  title: FilterValue,
  color: types.maybeNull(types.string),
});

export const FilterItemType = types.union({
  dispatcher(s) {
    if (isPrimitiveType(s)) {
      return FilterValue;
    } else {
      return FilterItemValue;
    }
  },
});

export const FilterValueList = types.model("FilterValueList", {
  items: types.array(FilterItemType),
});

export const FilterValueRange = types.model("FilterValueRange", {
  min: types.maybeNull(FilterValue),
  max: types.maybeNull(FilterValue),
});

export const FilterSchema = types.union({
  dispatcher(s) {
    if (!s) return types.null;

    if (s.items) {
      return FilterValueList;
    } else {
      return FilterValueRange;
    }
  },
});

export const ViewFilterType = types
  .model("ViewFilterType", {
    id: types.identifier,
    field: types.reference(ViewColumn),
    type: types.enumeration(Object.keys(FilterTypes)),
    schema: types.maybeNull(FilterSchema),
  })
  .views((self) => ({
    get defaultValue() {
      switch (self.type) {
        case "Boolean":
          return false;
        default:
          return undefined;
      }
    },
  }));
