import { inject, observer } from "mobx-react";
import React from "react";
import {
  FaCaretDown,
  FaColumns,
  FaMinus,
  FaPlus,
  FaSortAmountDown,
  FaSortAmountUp,
  FaThLarge,
  FaThList
} from "react-icons/fa";
import { cn } from "../../../utils/bem";
import { Button } from "../../Common/Button/Button";
import { ErrorBox } from "../../Common/ErrorBox";
import { FieldsButton } from "../../Common/FieldsButton";
import { FiltersPane } from "../../Common/FiltersPane";
import { Icon } from "../../Common/Icon/Icon";
import { RadioGroup } from "../../Common/RadioGroup/RadioGroup";
import { ExportButton, ImportButton } from "../../Common/SDKButtons";
import { Space } from "../../Common/Space/Space";
import { Spinner } from "../../Common/Spinner";
import { Tooltip } from "../../Common/Tooltip/Tooltip";
import { TabsActions } from "../TabsActions";
import "./TabPanel.styl";

const injector = inject(({ store }) => {
  const { dataStore, currentView } = store;
  const totalTasks = store.project?.task_count ?? 0;
  const foundTasks = dataStore?.total ?? 0;

  return {
    store,
    labelingDisabled: totalTasks === 0 || foundTasks === 0,
    selectedItems: currentView?.selected,
    loading: dataStore?.loading || currentView?.locked,
    target: currentView?.target ?? "tasks",
    sidebarEnabled: store.viewsStore?.sidebarEnabled ?? false,
    ordering: currentView?.currentOrder,
    view: currentView,
  };
});

const OrderButton = observer(({ ordering, size, view }) => {
  return (
    <Space style={{ fontSize: 12 }}>
      Order
      <Button.Group collapsed>
        <FieldsButton
          size={size}
          style={{ minWidth: 85, textAlign: "left" }}
          title={ordering ? ordering.column?.title : "not set"}
          onClick={(col) => view.setOrdering(col.id)}
          onReset={() => view.setOrdering(null)}
          resetTitle="Default"
          selected={ordering?.field}
          wrapper={({ column, children }) => (
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              {children}

              <div
                style={{
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {column?.icon}
              </div>
            </Space>
          )}
        />

        <Button
          size={size}
          style={{ color: "#595959" }}
          disabled={!!ordering === false}
          icon={ordering?.desc ? <FaSortAmountUp /> : <FaSortAmountDown />}
          onClick={() => view.setOrdering(ordering?.field)}
        />
      </Button.Group>
    </Space>
  );
});

const GridWidthButton = observer(({ view, gridWidth, size }) => {
  const [width, setWidth] = React.useState(gridWidth);

  const setGridWidth = React.useCallback(
    (width) => {
      const newWidth = Math.max(3, Math.min(width, 10));
      setWidth(newWidth);
      view.setGridWidth(newWidth);
    },
    [view]
  );

  return (
    <Space style={{ fontSize: 12 }}>
      Columns: {width}
      <Button.Group>
        <Button
          size={size}
          icon={<Icon icon={FaMinus} size="12" color="#595959" />}
          onClick={() => setGridWidth(width - 1)}
          disabled={width === 3}
        />
        <Button
          size={size}
          icon={<Icon icon={FaPlus} size="12" color="#595959" />}
          onClick={() => setGridWidth(width + 1)}
          disabled={width === 10}
        />
      </Button.Group>
    </Space>
  );
});

export const TablePanel = injector(
  ({ store, view, labelingDisabled, loading, target, ordering }) => {
    const toolbarSize = "small";

    return (
      <div className={cn("tab-panel")}>
        <Space size="large">
          {/* <DataStoreToggle size={toolbarSize} view={view} /> */}

          <ViewToggle size={toolbarSize} />

          <FieldsButton
            wrapper={FieldsButton.Checkbox}
            icon={<Icon icon={FaColumns} />}
            trailingIcon={<Icon icon={FaCaretDown} />}
            title={"Fields"}
            size={toolbarSize}
          />

          <FiltersPane size={toolbarSize} />

          <OrderButton view={view} ordering={ordering} size={toolbarSize} />

          {view.type === "grid" && (
            <GridWidthButton
              view={view}
              gridWidth={view.gridWidth}
              size={toolbarSize}
            />
          )}

          {loading && <Spinner size="small" />}

          <ErrorBox />
        </Space>

        <Space>
          {<SelectedItems />}

          {store.SDK.interfaceEnabled("import") && (
            <ImportButton size={toolbarSize}>Import</ImportButton>
          )}

          {store.SDK.interfaceEnabled("export") && (
            <ExportButton size={toolbarSize}>Export</ExportButton>
          )}

          {!labelingDisabled && store.SDK.interfaceEnabled("labelButton") && (
            <Button
              look="primary"
              size={toolbarSize}
              disabled={target === "annotations"}
              onClick={() => store.startLabeling()}
            >
              Label
            </Button>
          )}
        </Space>
      </div>
    );
  }
);

const viewInjector = inject(({ store }) => ({
  view: store.currentView,
}));

const ViewToggle = viewInjector(({ view, size }) => {
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
});

const SelectedItems = inject(({ store }) => ({
  hasSelected: store.currentView?.selected?.hasSelected ?? false,
}))(({ hasSelected }) => hasSelected && <TabsActions size="small" />);

// const DataStoreToggle = viewInjector(({ view, size }) => {
//   return (
//     <RadioGroup
//       value={view.target}
//       size={size}
//       onChange={(e) => view.setTarget(e.target.value)}
//     >
//       <RadioGroup.Button value="tasks">Tasks</RadioGroup.Button>
//       <RadioGroup.Button value="annotations" disabled>
//         Annotations
//       </RadioGroup.Button>
//     </RadioGroup>
//   );
// });
