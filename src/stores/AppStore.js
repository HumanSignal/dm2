
import { types, getEnv, getParent, clone, getSnapshot, destroy, getRoot } from "mobx-state-tree";
import { guidGenerator } from "../utils/random";
import fields from "../data/fields";

import { StringFilter, NumberFilter, 
    BetweenNumberFilter } from "./FiltersStore";

const Field = types
      .model("Fields", {
          field: types.string,
          
          enabled: true,
          canToggle: false,
          
          source: types.optional(types.enumeration(["tasks", "annotations", "inputs"]), "tasks"),
          
          filterState: types.maybeNull(types.union({ eager: false }, StringFilter, NumberFilter, BetweenNumberFilter))
      }).views(self => ({
          get key() { return self.source + "_" + self.title },
      }))
      .actions(self => ({
          toggle() {
              self.enabled = !self.enabled;
          },
      }));

const View = types
      .model("View", {
          id: types.optional(types.identifier, () => { return guidGenerator(5) }),
          
          title: "Tasks",
          
          type: types.optional(types.enumeration(["list", "grid"]), "list"),
          target: types.optional(types.enumeration(["tasks", "annotations"]), "tasks"),
          
          fields: types.array(Field),
          
          enableFilters: false,
          renameMode: false,
      }).views(self => ({
          get key() { return self.id },

          get root() { return getRoot(self) },
          
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
                  const { accessor, Cell, filterClass, filterType } = field;
                  const cols = {
                      Header: field.title,
                      accessor,
                      disableFilters: true,
                      _filterState: f.filterState
                  };

                  if (Cell) cols.Cell = Cell;

                  if (self.enableFilters === true) {
                      if (filterClass !== undefined)
                          cols["Filter"] = filterClass;
                      
                      if (filterType !== undefined) 
                          cols["filter"] = filterType

                      if (filterType || filterClass)
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
              self.enableFilters = ! self.enableFilters;
          },
      }))

const ViewsStore = types
      .model("ViewsStore", {
          selected: types.safeReference(View),
          views: types.array(View),
          
          labelingView: types.maybeNull(View)
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

          updateLabelingView() {
              const dupView = getSnapshot(self.selected);
              const fields = dupView.fields.slice(0,2);
              
              self.labelingView = View.create({
                  ...dupView,
                  id: guidGenerator(5),
                  fields: fields
              });
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
              self.setSelected(newView);
              
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
        mode: types.optional(types.enumeration(["dm", "label"]), "dm"),
        
        viewsStore: types.optional(ViewsStore, {
            views: []            
        }),        
    }).actions(self => ({
        setMode(mode) {
            self.mode = mode;
            
            if (mode === "label")
                self.viewsStore.updateLabelingView();            
        }
    }));
