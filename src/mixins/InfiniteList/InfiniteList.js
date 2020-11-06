import { flow, getParent, getRoot, types } from "mobx-state-tree";

const MixinBase = types
  .model("InfiniteListMixin", {
    page: types.optional(types.integer, 1),
    pageSize: types.optional(types.integer, 120),
    total: types.optional(types.integer, 0),
    loading: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get API() {
      return getRoot(self).API;
    },
  }))
  .actions((self) => ({
    setSelected(val) {
      self.selected = val;
    },

    unsetTask() {
      self.selected = undefined;
    },

    setList({ list, total, reload }) {
      if (list.length > 0) {
        const newEntity = list.map((t) => ({
          ...t,
          source: JSON.stringify(t),
        }));

        self.total = total;

        if (reload) self.data = [];
        self.list.push(...newEntity);

        return true;
      }

      return false;
    },
  }));

export const InfiniteList = (modelName, { listItemType, apiMethod }) => {
  const model = types
    .model(modelName, {
      list: types.optional(types.array(listItemType), []),
      selected: types.maybeNull(listItemType),
    })
    .actions((self) => ({
      updateItem(itemID, patch) {
        let item = self.list.find((t) => t.id === itemID);

        if (item) {
          console.log(`Updating existing item [${self.type}#${itemID}]`, item);
          item.update(patch);
        } else {
          item = listItemType.create(patch);
          self.list.push(item);
        }

        return item;
      },

      fetch: flow(function* ({ reload = false } = {}) {
        self.loading = true;

        if (reload) self.page = 1;

        const data = yield self.API[apiMethod]({
          page: self.page,
          page_size: self.pageSize,
          tabID: getParent(self).id,
        });

        const loaded = self.setList({
          list: data[apiMethod],
          total: data.total,
          reload,
        });

        if (loaded) self.page += 1;

        self.loading = false;
      }),

      reload: flow(function* () {
        yield self.fetch({ reload: true });
      }),
    }));

  return types.compose(MixinBase, model);
};
