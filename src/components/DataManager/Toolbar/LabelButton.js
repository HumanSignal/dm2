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
    selectedCount: currentView?.selectedLength
  };
});

export const LabelButton = injector(({store, selectedCount, canLabel, size, target}) => {
  return canLabel ? (
    <Interface name="labelButton">
      <Button
        look="primary"
        size={size}
        disabled={target === "annotations"}
        onClick={() => store.startLabelStream()}
        style={{width: 105}}
      >
        Label {selectedCount ? selectedCount : null}
      </Button>
    </Interface>
  ) : null;
});
