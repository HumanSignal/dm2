import { getParent, getRoot, types } from "mobx-state-tree";
import { toStudlyCaps } from "strman";
import * as Filters from "../../components/Filters/types";
import * as CellViews from "../../components/Table/CellViews";
import { debounce } from "../../utils/debounce";
import { isDefined } from "../../utils/utils";
import {
  FilterValueRange,
  FilterValueType,
  TabFilterType
} from "./tab_filter_type";

const operatorNames = Array.from(
  new Set(
    [].concat(...Object.values(Filters).map((f) => f.map((op) => op.key)))
  )
);

const Operators = types.enumeration(operatorNames);

const getOperatorDefaultValue = (operator) => {
  if (operatorNames.includes(operator)) {
    switch (operator) {
      default:
        return null;

      case "empty":
        return false;
    }
  }

  return null;
};

export const TabFilter = types
  .model("TabFilter", {
    filter: types.reference(TabFilterType),
    operator: types.maybeNull(Operators),
    value: types.maybeNull(FilterValueType),
  })
  .views((self) => ({
    get field() {
      return self.filter.field;
    },

    get schema() {
      return self.filter.schema;
    },

    /** @returns {import("./tab").View} */
    get view() {
      return getParent(getParent(self));
    },

    get component() {
      return Filters[self.filter.currentType] ?? Filters.String;
    },

    get componentValueType() {
      return self.component?.find(({ key }) => key === self.operator)
        ?.valueType;
    },

    get target() {
      return self.filter.field.target;
    },

    get type() {
      return self.field.currentType;
    },

    get isValidFilter() {
      const { currentValue: value } = self;

      if (!isDefined(value)) {
        return false;
      } else if (FilterValueRange.is(value)) {
        return isDefined(value.min) && isDefined(value.max);
      }

      return true;
    },

    get currentValue() {
      if (self.filter.schema === null) {
        return self.value;
      } else {
        return self.value?.value ?? self.value ?? null;
      }
    },

    get cellView() {
      const col = self.filter.field;
      return CellViews[col.type] ?? CellViews[toStudlyCaps(col.alias)];
    }
  }))
  .actions((self) => ({
    afterAttach() {
      if (self.value === null) {
        self.setDefaultValue();
      }
      if (self.operator === null) {
        self.setOperator(self.component[0].key);
      }
    },

    setFilter(value) {
      if (!isDefined(value)) return;

      const previousFilterType = self.filter.currentType;
      self.filter = value;

      if (previousFilterType !== self.filter.currentType) {
        self.setDefaultValue();
      }

      self.setOperator(self.component[0].key);
      self.save();
    },

    setOperator(operator) {
      const previousValueType = self.componentValueType;
      self.operator = operator;

      if (previousValueType !== self.componentValueType) {
        self.setDefaultValue();
      }

      self.save();
    },

    setValue(newValue) {
      self.value = newValue;
      // let resultValue = newValue;

      // if (hasProperties(newValue, ['items'])) {
      //   resultValue = FilterValueList.create(newValue);
      // } else if (hasProperties(newValue, ['min', 'max'])) {
      //   resultValue = FilterValueRange.create(newValue);
      // }

      // self.value = resultValue;
    },

    delete() {
      self.view.deleteFilter(self);
    },

    save() {
      if (self.isValidFilter) {
        getRoot(self)?.unsetSelection();
        self.view?.clearSelection();
        self.view?.save({ interaction: "filter" });
      }
    },

    setDefaultValue() {
      self.setValue(
        getOperatorDefaultValue(self.operator) ?? self.filter.defaultValue
      );
    },

    setValueDelayed(value) {
      self.setValue(value);
      setTimeout(self.saveDelayed);
    },

    saveDelayed: debounce(() => {
      self.save();
    }, 300),
  })).preProcessSnapshot((sn) => {
    return {...sn, value: sn.value ?? null};
  });
