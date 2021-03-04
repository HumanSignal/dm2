import { flow, getRoot, types } from "mobx-state-tree";
import { guidGenerator } from "../../utils/random";

const listIncludes = (list, id) => {
  const index =
    id !== undefined
      ? Array.from(list).findIndex((item) => item.id === id)
      : -1;
  return index >= 0;
};

const MixinBase = types
  .model("InfiniteListMixin", {
    page: types.optional(types.integer, 0),
    pageSize: types.optional(types.integer, 30),
    total: types.optional(types.integer, 0),
    loading: false,
    loadingItem: false,
    loadingItems: types.optional(types.array(types.number), []),
    updated: guidGenerator(),
  })
  .views((self) => ({
    get API() {
      return self.root.API;
    },

    get root() {
      return getRoot(self);
    },

    get totalPages() {
      return Math.ceil(self.total / self.pageSize);
    },

    get hasNextPage() {
      return self.page !== self.totalPages;
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

      if (selected) {
        self.selected = selected;
        self.highlighted = selected;
      }
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

      newEntity.forEach((n) => {
        const index = self.list.findIndex((i) => i.id === n.id);
        if (index >= 0) {
          self.list.splice(index, 1);
        }
      });

      if (reload) {
        self.list = [...newEntity];
      } else {
        self.list.push(...newEntity);
      }
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
      self.highlighted = undefined;
      self.list = [];
      self.page = 0;
      self.total = 0;
    },
  }));

export const DataStore = (
  modelName,
  { listItemType, apiMethod, properties }
) => {
  const model = types
    .model(modelName, {
      ...(properties ?? {}),
      list: types.optional(types.array(listItemType), []),
      selected: types.maybeNull(
        types.late(() => types.reference(listItemType))
      ),
      highlighted: types.maybeNull(
        types.late(() => types.reference(listItemType))
      ),
    })
    .actions((self) => ({
      updateItem(itemID, patch) {
        let item = self.list.find((t) => t.id === itemID);

        if (item) {
          item.update(patch);
        } else {
          item = listItemType.create(patch);
          self.list.push(item);
        }

        return item;
      },

      fetch: flow(function* ({ reload = false, interaction } = {}) {
        if (self.loading) return;

        self.loading = true;

        if (reload) self.page = 0;
        self.page++;

        const params = {
          page: self.page,
          page_size: self.pageSize,
          tabID: getRoot(self).viewsStore.selected.id,
        };

        if (interaction) Object.assign(params, { interaction });

        const [selectedID, highlightedID] = [
          self.selected?.id,
          self.highlighted?.id,
        ];

        const data = yield getRoot(self).apiCall(apiMethod, params);
        const { total, [apiMethod]: list } = data;

        if (list) self.setList({ total, list, reload });

        if (!listIncludes(self.list, selectedID)) {
          self.selected = null;
        }

        if (!listIncludes(self.list, highlightedID)) {
          self.highlighted = null;
        }

        self.postProcessData?.(data);

        self.loading = false;
      }),

      reload: flow(function* ({ interaction } = {}) {
        yield self.fetch({ reload: true, interaction });
      }),

      focusPrev() {
        const index = Math.max(0, self.list.indexOf(self.highlighted) - 1);
        self.highlighted = self.list[index];
        self.updated = guidGenerator();
      },

      focusNext() {
        const index = Math.min(
          self.list.length - 1,
          self.list.indexOf(self.highlighted) + 1
        );
        self.highlighted = self.list[index];
        self.updated = guidGenerator();
      },
    }));

  return types.compose(MixinBase, model);
};
