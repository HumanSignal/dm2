
import { types, getEnv, getParent, clone, getSnapshot, destroy } from "mobx-state-tree";
import FilterMap from "../utils/FilterMap";
import { guidGenerator } from "../utils/random";
import fields from "../data/fields";

const Field = types
      .model("Fields", {
          field: types.string,
          
          enabled: true,
          canToggle: false,
          
          source: types.optional(types.enumeration(["tasks", "annotations", "inputs"]), "tasks"),

          
      }).views(self => ({
          get key() { return self.source + "_" + self.title },
          get filterClass() { return FilterMap.findClass(self) },
          get filterType() { return FilterMap.findType(self) }
      }))
      .actions(self => ({
          toggle () {
              self.enabled = !self.enabled;
          },
      }))

const View = types
      .model("View", {
          id: types.optional(types.identifier, () => { return guidGenerator(5) }),
          
          title: "Tasks",
          
          type: types.optional(types.enumeration(["list", "grid"]), "list"),
          target: types.optional(types.enumeration(["tasks", "annotations"]), "tasks"),
          
          fields: types.array(Field),
          
          filters: false,
          renameMode: false,
      }).views(self => ({
          get key() { return self.id },

          get parent() { return getParent(getParent(self)) },
          
          fieldsSource(source) {
              return self.fields.filter(f => f.source === source);
          },

          // get fields formatted as columns structure for react-table
          get fieldsAsColumns() {
              const lst = (self.target === "tasks") ?
                    self.fields.filter(f => f.source !== 'annotations') :
                    self.fields.filter(f => f.source !== 'tasks') ;

              return lst.filter(f => f.enabled).map(f => {
                  const field = fields[f.field];
                  const { accessor, Cell } = field;
                  const cols = {
                      Header: field.title,
                      accessor,
                      disableFilters: true
                  }

                  if (Cell) cols.Cell = Cell;

                  if (self.filters === true) {
                      if (f.filterClass)
                          cols["Filter"] = f.filterClass;
                      
                      if (f.filterType) 
                          cols["filter"] = f.filterType

                      if (f.filterType || f.filterClass)
                          cols["disableFilters"] = false;
                  }

                  return cols;
              })
          }
      })).actions(self => ({
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
              self.filters = ! self.filters;
          },
      }))

const ViewsStore = types
      .model("ViewsStore", {
          selected: types.safeReference(View),
          views: types.array(View),
      }).views(self => ({
          get all() {
              return self.views;
          },

          get canClose() {
              return self.all.length > 1;
          }
      })).actions(self => ({
          setSelected(view) {
              self.selected = view;
          },

          deleteView(view) {
              let needsNewSelected = false;
              if (self.selected === view)
                  needsNewSelected = true;
              
              destroy(view);
              
              if (needsNewSelected)
                  self.setSelected(self.views[0]);              
          },

          addView() {
              const dupView = getSnapshot(self.views[0]);
              const newView = View.create({
                  fields: dupView.fields
              });

              self.views.push(newView);

              return newView;
          },
          
          duplicateView(view) {
              const dupView = getSnapshot(view);
              const newView = View.create({
                  ...dupView,
                  id: guidGenerator(5),
                  title: dupView.title + " copy"
              });
              
              self.views.push(newView);

              self.setSelected(self.views[self.views.length - 1]);
          },

          afterCreate() {
              if (! self.selected) {
                  self.setSelected(self.views[0]);
              }
          }
    }));

export default types
    .model("dmAppStore", {
        viewsStore: types.optional(ViewsStore, {
            views: []            
        }),        
    })
