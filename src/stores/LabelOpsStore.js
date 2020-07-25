
import { types, getParent } from "mobx-state-tree";

// import Utilities from "../utils";

const OpStore = types
      .model("Op", {

          // "conflicts": 0, 
          // "coverage": 0, 
          // "factor": "[would...Feature Request]", 
          // "id": 0, 
          // "label": "Feature Request", 
          // "type": "generic"
          
          lf: types.maybeNull(types.string),
          lopFactor: types.maybeNull(types.string),
          lopLabel: types.maybeNull(types.string),

          conflict: types.maybeNull(types.number),
          coverage: types.maybeNull(types.number),

          type: types.enumeration(["current", "previous"]),
          source: types.optional(types.enumeration(["labeling", "heartex", "user"]), "labeling"),

          selected: types.optional(types.boolean, false)
      })
      .actions(self => ({
          async applyLabelOp() {
              const data = {
                  "tasks": [
                      {
                          "data": {
                              "body": "It would be great"
                          },
                      }
                  ],

                  "label_config": "<View>  <TextArea name=\"lops\" toName=\"text\" cols=\"2\"/>  <Choices name=\"selection\" toName=\"text\" showInline=\"true\" choice=\"multiple\">    <Choice value=\"#1\"/>    <Choice value=\"#2\"/>    <Choice value=\"#3\"/>    <Choice value=\"#4\"/>    <Choice value=\"#5\"/>    <Choice value=\"#6\"/>    <Choice value=\"#7\"/>    <Choice value=\"#8\"/>    <Choice value=\"#9\"/>  </Choices>  <Labels name=\"label\" toName=\"text\">    <Label value=\"Feature Request\" background=\"red\"/>    <Label value=\"Issue\" background=\"blue\"/>    <Label value=\"Question\" background=\"orange\"/>  </Labels>  <Text name=\"text\" value=\"$body\"/></View>",
                  // "selected_lops": [0, 1, 2]
              };
              
              const url = 'http://localhost/predict';
              const res = await fetch(url, {
                  method: 'POST',
                   headers: {
                       'Content-Type': 'application/json'
                       // 'Content-Type': 'application/x-www-form-urlencoded',
                   },
                  redirect: 'follow', // manual, *follow, error
                  referrerPolicy: 'no-referrer', // no-referrer, *client
                  body: JSON.stringify(data)
              });

              return await res.json(); 
          },

          unapplyLabelOp() {

          },
          
          toggleSelected() {
              if (! self.selected) {
                  const ops = self.applyLabelOp();
                  console.log(ops);
              } else
                  self.unapplyLabelOp();

              self.selected = ! self.selected;
          }
      }))
      .views(self => ({
          
      }));

const LabelOpsStore = types
  .model("LabelOps", {
      id: types.maybeNull(types.number),
      operations: types.array(OpStore)
  })
  .views(self => ({
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
  }));

export default LabelOpsStore;
