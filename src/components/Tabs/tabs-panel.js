import {
  AppstoreOutlined,
  BarsOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Radio, Space } from "antd";
import { inject } from "mobx-react";
import React from "react";
import { ErrorBox } from "../Common/ErrorBox";
import { FieldsButton } from "../Common/FieldsButton";
import { FiltersPane } from "../Common/FiltersPane";
import { Spinner } from "../Common/Spinner";
import { TabsActions } from "./tabs-actions";

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
  };
});

export const TablePanel = injector(
  ({ store, labelingDisabled, loading, target }) => {
    const toolbarSize = "middle";

    return (
      <div className="tab-panel">
        <Space>
          <ViewToggle />

          {/* {false && (<DataStoreToggle view={view}/>)} */}

          <FieldsButton size={toolbarSize} />

          <FiltersPane size={toolbarSize} />

          {loading && <Spinner size="small" />}

          <ErrorBox />
        </Space>

        <Space>
          {<SelectedItems />}

          {!labelingDisabled && (
            <Button
              type="primary"
              size={toolbarSize}
              disabled={target === "annotations"}
              onClick={() => store.startLabeling()}
            >
              <PlayCircleOutlined />
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

const ViewToggle = viewInjector(({ view }) => {
  return (
    <Radio.Group
      value={view.type}
      onChange={(e) => view.setType(e.target.value)}
    >
      <Radio.Button value="list">
        <BarsOutlined /> List
      </Radio.Button>
      <Radio.Button value="grid">
        <AppstoreOutlined /> Grid
      </Radio.Button>
    </Radio.Group>
  );
});

const SelectedItems = inject(({ store }) => ({
  hasSelected: store.currentView?.selected?.hasSelected ?? false,
}))(
  ({ hasSelected }) =>
    hasSelected && (
      <>
        <TabsActions size="small" />
        <Divider type="vertical" />
      </>
    )
);

const DataStoreToggle = viewInjector(({ view }) => {
  return (
    <Radio.Group
      value={view.target}
      onChange={(e) => view.setTarget(e.target.value)}
    >
      <Radio.Button value="tasks">Tasks</Radio.Button>
      <Radio.Button value="annotations">Annotations</Radio.Button>
    </Radio.Group>
  );
});
