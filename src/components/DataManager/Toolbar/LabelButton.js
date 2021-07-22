import { inject } from "mobx-react";
import { Button } from "../../Common/Button/Button";
import { Interface } from "../../Common/Interface";

const injector = inject(({ store }) => {
  const { dataStore, currentView } = store;
  const totalTasks = store.project?.task_count ?? 0;
  const foundTasks = dataStore?.total ?? 0;

  return {
    store,
    canLabel: totalTasks > 0 || foundTasks > 0,
    target: currentView?.target ?? "tasks",
    selectedCount: currentView?.selectedCount,
    allSelected: currentView?.allSelected,
  };
});

export const LabelButton = injector(({ store, allSelected, selectedCount, canLabel, size, target }) => {
  const all = selectedCount === 0 || allSelected;

  return canLabel ? (
    <Interface name="labelButton">
      <Button
        look="primary"
        size={size}
        style={{ width: 160, padding: 0 }}
        disabled={target === "annotations"}
        onClick={() => store.startLabelStream()}
      >
        Label {all ? "All" : selectedCount} Task{all || selectedCount > 1 ? "s" : ''}
      </Button>
    </Interface>
  ) : null;
});
