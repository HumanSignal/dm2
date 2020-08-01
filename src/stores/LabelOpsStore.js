
import { types, getParentOfType, getRoot } from "mobx-state-tree";

// import Utilities from "../utils";

const OpStore = types
      .model("Op", {
          id: types.number,
          
          // lf: types.maybeNull(types.string),
          lopFactor: types.maybeNull(types.string),
          lopLabel: types.maybeNull(types.string),
          
          conflicts: types.maybeNull(types.number),
          coverage: types.maybeNull(types.number),
          
          type: types.enumeration(["current", "previous"]),
          source: types.optional(types.enumeration(["labeling", "heartex", "user"]), "labeling"),
          
          selected: types.optional(types.boolean, false)
      })
      .actions(self => ({
          applyLabelOp() {
              const promise = self.parent.predictOps();
              promise.then((res) => {
                  const ls = self.root.tasksStore.getLSF();
                      
                  if (ls && "predictions" in res) {
                      const p = res["predictions"][0];
                      if ("result" in p) {                                                    
                          const result = p["result"];
                          result.forEach(r => r['lop_id'] = self.id);
                          
                          const c = ls.completionStore.selected;

                          // take current result
                          const currentResult = c.serializeCompletion();
                          const nextResult = result;

                          // console.log(result);
                          // console.log(nextResult);
                          
                          c.deleteAllRegions();
                          c.names.get('text').needsUpdate();
                          
                          c.deserializeCompletion(nextResult);
                          
                          if (nextResult.length)
                              c.names.get('text').needsUpdate();
                      }
                  }
              });
          },
          
          unapplyLabelOp() {
              // if you unselect LOP then we need to remove all the
              // regions create by that LOP
              const ls = self.root.tasksStore.getLSF();
              if (ls) {
                  const c = ls.completionStore.selected;
                  if (c) {
                      const rs = c.regionStore;
                      const regions = rs.filterByLOP(self.id);
                      if (regions && regions.length) {
                          regions.forEach(r => {
                              r.deleteRegion();
                          });

                          const nextResult = c.serializeCompletion();
                          c.deleteAllRegions();                          
                          c.names.get('text').needsUpdate();

                          c.deserializeCompletion(nextResult);
                          
                          if (nextResult.length)
                              c.names.get('text').needsUpdate();
                      }
                  }
              }
          },
          
          toggleSelected() {
              self.selected = ! self.selected;

              self.parent.applyOps();
              
              // if (self.selected)
              //     self.applyLabelOp();                
              // else
              //     self.unapplyLabelOp();              
          }
      }))
      .views(self => ({
          get parent() {
              return getParentOfType(self, LabelOpsStore);
          },

          get root() {
              return getRoot(self);
          }
      }));

const LabelOpsStore = types
  .model("LabelOps", {
      id: types.maybeNull(types.number),
      operations: types.array(OpStore)
  })
      .views(self => ({
          get root() {
              return getRoot(self);
          },
          
          get allSelected() {
              return self.operations.filter(op => op.selected === true);
          },
          
      get previousOps() {
          return self.operations.filter(op => op.type === "previous");
      },

      get currentOps() {
          return self.operations.filter(op => op.type === "current");
      },

      get previousSelectedNum() {
          return self.previousOps.filter(op => op.selected === true).length;
      },

      get currentSelectedNum() {
          return self.currentOps.filter(op => op.selected === true).length;
      },
  })).actions(self => ({
      reset() {
          self.operations = [];
      },

      applyOps() {
          const promise = self.predictOps();
          promise.then((res) => {
              const ls = self.root.tasksStore.getLSF();

              if (ls) {
                  const c = ls.completionStore.selected;

                  // remove all previous lop generated regions
                  const rs = c.regionStore;
                  const regions = rs.filterByLOPGenerated();

                  if (regions && regions.length)
                      regions.forEach(r => r.deleteRegion());

                  if ("predictions" in res &&
                      "result" in res["predictions"][0]
                  ) {
                      const result = res["predictions"][0]["result"];
                      result.forEach(r => r['lop_generated'] = true);
                      
                      // take current result
                      const currentResult = c.serializeCompletion();
                      const nextResult = [...currentResult, ...result];
                      
                      c.deleteAllRegions();
                      c.names.get('text').needsUpdate();
                          
                      c.deserializeCompletion(nextResult);
                          
                      if (nextResult.length)
                          c.names.get('text').needsUpdate();
                  }
              }
          });
      },
      
      async _loadOps(task) {
          if (! task)
              task = self.root.tasksStore.getTask();
          
          const response = await window.fetch(`/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  data: task['data']                  
              })
          });
          
          return await response.json();
      },

      loadOps(task) {
          self.reset();
          
          const promise = self._loadOps(task);
          promise.then((res) => {
              if ("predictions" in res) {
                  const p = res["predictions"][0];
                  if ("lops" in p) {
                      p["lops"].forEach(lop => self.addOp(lop));
                  }
              }
          });          
      },
      
      async predictOps() {
          const task = self.root.tasksStore.getTask();
          const response = await window.fetch(`/predict`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  data: task['data'],
                  selected_lops: self.allSelected.map(op => op.id)
              })
          });
          
          return await response.json();
      },
      
      addOp(op) {
          const opObj = OpStore.create({
              id: op.id,
              conflicts: op.coverage,
              coverage: op.coverage,
              lopFactor: op.factor,
              lopLabel: op.label,
              source: op.source,
              type: op.type,

              // all prev ops are selected by default
              selected: (op.type === "previous")
          });
          
          self.operations.push(opObj);
          
          return opObj;
      }
  }));

export default LabelOpsStore;
