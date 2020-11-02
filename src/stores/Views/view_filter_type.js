import { types } from "mobx-state-tree";
import * as FilterTypes from "../../components/Filters/types";
import { ViewColumn } from "./view_column";

export const FilterValue = types.union(types.string, types.number);

export const FilterValueList = types.model("FilterValueList", {
  items: types.array(FilterValue),
});

export const FilterValueRange = types.model("FilterValueRange", {
  min: FilterValue,
  max: FilterValue,
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

export const ViewFilterType = types.model("ViewFilterType", {
  id: types.identifier,
  field: types.reference(ViewColumn),
  type: types.enumeration(Object.keys(FilterTypes)),
  schema: types.maybeNull(FilterSchema),
});
