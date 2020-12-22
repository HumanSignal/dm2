import { flow, getRoot, types } from "mobx-state-tree";

const MixinBase = types
  .model("InfiniteListMixin", {
    page: types.optional(types.integer, 0),
    pageSize: types.optional(types.integer, 30),
    total: types.optional(types.integer, 0),
    loading: false,
    loadingItem: false,
    loadingItems: types.optional(types.array(types.number), []),
  })
  .views((self) => ({
    get API() {
      return self.root.API;
    },

    get root() {
      return getRoot(self);
    },

    get totalPages() {
      return Math.round(self.total / self.pageSize);
    },

    get hasNextPage() {
      return self.totalPages > self.page;
    },

    get isLoading() {
      return self.loadingItem || self.loadingItems.length > 0;
    },

    itemIsLoading(id) {
      return self.loadingItems.includes(id);
    },
  }))
  .actions((self) => ({
    setSelected(val) {
      let selected;
      if (typeof val === "number") {
        selected = self.list.find((t) => t.id === val);
      } else {
        selected = val;
      }

      self.selected = selected;
      self.highlighted = selected;
    },

    unset({ withHightlight = false } = {}) {
      self.selected = undefined;
      if (withHightlight) self.highlighted = undefined;
    },

    setList({ list, total, reload }) {
      const newEntity = list.map((t) => ({
        ...t,
        source: JSON.stringify(t),
      }));

      self.total = total;

      if (reload) self.list = [];
      self.list.push(...newEntity);
    },

    setLoading(id) {
      if (id !== undefined) {
        self.loadingItems.push(id);
      } else {
        self.loadingItem = true;
      }
    },

    finishLoading(id) {
      if (id !== undefined) {
        self.loadingItems = self.loadingItems.filter((item) => item !== id);
      } else {
        self.loadingItem = false;
      }
    },

    clear() {
      self.list = [];
      self.page = 0;
      self.total = 0;
    },
  }));

export const InfiniteList = (
  modelName,
  { listItemType, apiMethod, properties }
) => {
  const model = types
    .model(modelName, {
      ...(properties ?? {}),
      list: types.optional(types.array(listItemType), []),
      selected: types.maybeNull(types.safeReference(listItemType)),
      highlighted: types.maybeNull(types.safeReference(listItemType)),
    })
    .actions((self) => ({
      updateItem(itemID, patch) {
        let item = self.list.find((t) => t.id === itemID);

        if (item) {
          console.log(`Updating existing item [${self.type}#${itemID}]`, item);
          item.update(patch);
        } else {
          item = listItemType.create(patch);
          console.log(`Created item [${self.type}#${itemID}]`, item);
          self.list.push(item);
        }

        return item;
      },

      fetch: flow(function* ({ reload = false, interaction } = {}) {
        if (self.loading) return;

        let selected, highlighted;
        self.loading = true;

        if (reload) {
          selected = self.selected?.id;
          highlighted = self.highlighted?.id;

          self.page = 0;
          self.selected = null;
          self.highlighted = null;
        }

        self.page++;

        const params = {
          page: self.page,
          page_size: self.pageSize,
          tabID: getRoot(self).viewsStore.selected.id,
        };

        if (interaction) Object.assign(params, { interaction });

        const data = yield getRoot(self).apiCall(apiMethod, params);

        const { total, [apiMethod]: list } = data;

        if (list) self.setList({ total, list, reload });

        self.postProcessData?.(data);

        if (selected) self.selected = selected;
        if (highlighted) self.highlighted = highlighted;

        self.loading = false;
      }),

      reload: flow(function* ({ interaction } = {}) {
        yield self.fetch({ reload: true, interaction });
      }),
    }));

  return types.compose(MixinBase, model);
};
