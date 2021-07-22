import { types } from "mobx-state-tree";

const ActionDialog = types.model("ActionDialog", {
  text: types.string,
  type: types.enumeration(["confirm", "prompt"]),
});

export const Action = types.model("Action", {
  id: types.identifier,
  dialog: types.maybeNull(ActionDialog),
  order: types.integer,
  permissions: types.string,
  title: types.string,
}).volatile(() => ({
  caller: null,
}));
