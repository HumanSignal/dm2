import { getRoot, isPrimitiveType, types } from "mobx-state-tree";
import { TabColumn, ViewColumnType } from "./tab_column";

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

export const FilterValueList = types
  .model("FilterValueList", {
    items: types.array(FilterItemType),
  })
  .views((self) => ({
    get value() {
      return Array.from(self.items);
    },
  }));

export const FilterValueRange = types
  .model("FilterValueRange", {
    min: types.maybeNull(FilterValue),
    max: types.maybeNull(FilterValue),
  })
  .views((self) => ({
    get value() {
      return { min: self.min, max: self.max };
    },
  }));

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

export const TabFilterType = types
  .model("TabFilterType", {
    id: types.identifier,
    field: types.reference(TabColumn),
    type: ViewColumnType,
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

    get currentType () {
      const view = getRoot(self).currentView;
      const viewColumnDisplayType = view.columnsDisplayType?.get?.(self.field.id);
      return viewColumnDisplayType ?? self.field.type;
    },
  }));
