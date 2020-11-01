import { types } from "mobx-state-tree";
import { ViewFilterType } from "./view_filter_type";

export const ViewFilter = types.model("ViewFilter", {
  filter: types.reference(ViewFilterType),
});
