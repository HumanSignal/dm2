
import { types, getEnv } from "mobx-state-tree";

const Fields = types
      .model("Fields", {
          
      })

const View = types
      .model("View", {
          title: types.optional(types.string, "Panel"),
          closable: types.optional(types.boolean, false),
          
          type: types.optional(types.enumeration(["list", "grid"]), "list"),
          target: types.optional(types.enumeration(["tasks", "annotations"]), "tasks"),
          
          fields: types.maybeNull(Fields),
          
          filters: types.optional(types.boolean, false)
      }).views(self => ({
          get key() { return self.title }
      })).actions(self => ({
          setType(type) {
              self.type = type;
          },

          setTarget(target) {
              self.target = target;
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
