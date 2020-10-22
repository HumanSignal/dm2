import {
  destroy,
  getParent,
  getRoot,
  getSnapshot,
  types,
} from "mobx-state-tree";
import fields, { labelingFields } from "../data/fields";
import { guidGenerator } from "../utils/random";
import {
  BetweenNumberFilter,
  NumberFilter,
  StringFilter,
} from "./FiltersStore";

export const Field = types
  .model("Fields", {
    field: types.string,

    enabled: true,
    canToggle: false,

    source: types.optional(
      types.enumeration(["tasks", "annotations", "inputs"]),
      "tasks"
    ),

    filterState: types.maybeNull(
      types.union(
        { eager: false },
        StringFilter,
        NumberFilter,
        BetweenNumberFilter
      )
    ),
  })
  .views((self) => ({
    get key() {
      return self.source + "_" + self.field;
    },
  }))
  .actions((self) => ({
    toggle() {
      self.enabled = !self.enabled;
    },
  }));

export const View = types
  .model("View", {
    id: types.optional(types.identifier, () => {
      return guidGenerator(5);
    }),

    title: "Tasks",

    type: types.optional(types.enumeration(["list", "grid"]), "list"),
    target: types.optional(
      types.enumeration(["tasks", "annotations"]),
      "tasks"
    ),

    fields: types.array(Field),

    enableFilters: false,
    renameMode: false,
  })
  .views((self) => ({
    get key() {
      return self.id;
    },

    get root() {
      return getRoot(self);
    },

    get parent() {
      return getParent(getParent(self));
    },

    get dataFields() {
      return self.fields
        .filter((f) => f.source === "inputs")
        .map((f) => f.field);
    },

    get hasDataFields() {
      return self.dataFields.length > 0;
    },

    fieldsSource(source) {
      return self.fields.filter((f) => f.source === source);
    },

    // get fields formatted as columns structure for react-table
    get fieldsAsColumns() {
      let lst;
      // if (self.root.mode === "label") lst = self.fields.filter(f => f.source === 'label');
      // else
      if (self.target === "tasks")
        lst = self.fields.filter((f) => f.source !== "annotations");
      else lst = self.fields.filter((f) => f.source !== "tasks");

      return lst
        .filter(
          (f) =>
            f.enabled &&
            (self.root.mode !== "label" ||
              labelingFields.includes(f.field) ||
              f.source === "inputs")
        )
        .map((f) => {
          const field = fields(f.field);
          const { id, accessor, Cell, filterClass, filterType } = field;

          const cols = {
            Header: field.title,
            accessor,
            disableFilters: true,
            _filterState: f.filterState,
          };

          if (Cell) cols.Cell = Cell;
          if (id) cols.id = id;

          if (self.enableFilters === true) {
            if (filterClass !== undefined) cols["Filter"] = filterClass;

            if (filterType !== undefined) cols["filter"] = filterType;

            if (filterType || filterClass) cols["disableFilters"] = false;
          }

          return cols;
        });
    },
  }))
  .actions((self) => ({
    setType(type) {
      self.type = type;
    },

    setTarget(target) {
      self.target = target;
    },

    setTitle(title) {
      self.title = title;
    },

    setRenameMode(mode) {
      self.renameMode = mode;
    },

    toggleFilters() {
      self.enableFilters = !self.enableFilters;
    },

    afterAttach() {
      if (!self.hasDataFields) {
        // create data fields if they were not initialized
        const fields = self.root.tasksStore.getDataFields();

        self.fields = [
          ...self.fields,
          ...fields.map((f) => {
            return Field.create({
              field: f,
              canToggle: true,
              enabled: false,
              source: "inputs",
              filterState: { stringValue: "" },
            });
          }),
        ];
      }
    },
  }));

export const ViewsStore = types
  .model("ViewsStore", {
    selected: types.safeReference(View),
    views: types.array(View),
  })
  .views((self) => ({
    get all() {
      return self.views;
    },

    get canClose() {
      return self.all.length > 1;
    },
  }))
  .actions((self) => ({
    setSelected(view) {
      self.selected = view;
    },

    deleteView(view) {
      let needsNewSelected = false;
      if (self.selected === view) needsNewSelected = true;

      destroy(view);

      if (needsNewSelected) self.setSelected(self.views[0]);
    },

    addView() {
      const dupView = getSnapshot(self.views[0]);
      const newView = View.create({
        fields: dupView.fields,
      });

      self.views.push(newView);
      self.setSelected(newView);

      return newView;
    },

    duplicateView(view) {
      const dupView = getSnapshot(view);
      const newView = View.create({
        ...dupView,
        id: guidGenerator(5),
        title: dupView.title + " copy",
      });

      self.views.push(newView);
      self.setSelected(self.views[self.views.length - 1]);
    },

    afterCreate() {
      if (!self.selected) {
        self.setSelected(self.views[0]);
      }
    },
  }));
