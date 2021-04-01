import { inject, observer } from "mobx-react";
import { FaThLarge, FaThList } from "react-icons/fa";
import { Icon } from "../../Common/Icon/Icon";
import { RadioGroup } from "../../Common/RadioGroup/RadioGroup";
import { Tooltip } from "../../Common/Tooltip/Tooltip";

const viewInjector = inject(({ store }) => ({
  view: store.currentView,
}));

export const ViewToggle = viewInjector(observer(({ view, size }) => {
  return (
    <>
      <RadioGroup
        size={size}
        value={view.type}
        onChange={(e) => view.setType(e.target.value)}
      >
        <RadioGroup.Button value="list">
          <Tooltip title="List view">
            <Icon icon={FaThList} />
          </Tooltip>
        </RadioGroup.Button>
        <RadioGroup.Button value="grid">
          <Tooltip title="Grid view">
            <Icon icon={FaThLarge} />
          </Tooltip>
        </RadioGroup.Button>
      </RadioGroup>
    </>
  );
}));

export const DataStoreToggle = viewInjector(({ view, size }) => {
  return (
    <RadioGroup
      value={view.target}
      size={size}
      onChange={(e) => view.setTarget(e.target.value)}
    >
      <RadioGroup.Button value="tasks">
        Tasks
      </RadioGroup.Button>
      <RadioGroup.Button value="annotations" disabled>
        Annotations
      </RadioGroup.Button>
    </RadioGroup>
  );
});
