
import { types, getEnv } from "mobx-state-tree";
import FilterMap from "../utils/FilterMap";

const Field = types
      .model("Fields", {
          title: "",
          accessor: "",
          
          enabled: true,
          canToggle: false,
          
          source: types.optional(types.enumeration(["tasks", "annotations", "inputs"]), "tasks"),

          
      }).views(self => ({
          get key() { return self.source + "_" + self.title },
          get filterClass() { return FilterMap.findClass(self) },
          get filterType() { return FilterMap.findType(self) }
      }))

const View = types
      .model("View", {
          title: "Panel",
          closable: false,
          
          type: types.optional(types.enumeration(["list", "grid"]), "list"),
          target: types.optional(types.enumeration(["tasks", "annotations"]), "tasks"),
          
          fields: types.array(Field),
          
          filters: false
      }).views(self => ({
          get key() { return self.title },

          fieldsSource(source) {
              return self.fields.filter(f => f.source === source);
          },

          // get fields formatted as columns structure for react-table
          get fieldsAsColumns() {
              const lst = (self.target === "tasks") ?
                    self.fields.filter(f => f.source !== 'annotations') :
                    self.fields.filter(f => f.source !== 'tasks') ;

              return lst.map(f => {
                  const cols = {
                      Header: f.title,
                      accessor: f.accessor,
                      disableFilters: true
                  }

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

          toggleFilters() {
              self.filters = ! self.filters;
          } 
      }))

const ViewsStore = types
      .model("ViewsStore", {
          views: types.array(View),
      }).views(self => ({
          get all() {
              return self.views;
          }
      }));

export default types
    .model("dmAppStore", {
        viewsStore: types.optional(ViewsStore, {
            views: []            
        }),        
    })
