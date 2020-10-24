import { destroy, getSnapshot, types } from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";
import { View } from "./view";

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
