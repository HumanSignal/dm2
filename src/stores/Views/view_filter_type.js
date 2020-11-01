import { types } from "mobx-state-tree";
import * as FilterTypes from "../../components/Filters/types";
import { CustomJSON } from "../types";

export const ViewFilterType = types.model("ViewFilterType", {
  field: types.string,
  filter: types.enumeration(Object.keys(FilterTypes)),
  value: CustomJSON,
});
