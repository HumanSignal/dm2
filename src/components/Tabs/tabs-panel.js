import {
  AppstoreOutlined,
  BarsOutlined,
  CaretDownOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Radio, Space } from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import { inject, observer } from "mobx-react";
import React from "react";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
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
    ordering: currentView?.currentOrder,
    view: currentView,
  };
});

const OrderButton = observer(({ ordering, size, view }) => {
  return (
    <Space style={{ marginLeft: 20 }}>
      Order
      <ButtonGroup>
        <FieldsButton
          size={size}
          style={{ minWidth: 105, textAlign: "left" }}
          title={ordering ? ordering.column?.title : "ID"}
          onClick={(col) => view.setOrdering(col.id)}
          filter={(col) => col.canOrder}
          selected={ordering?.field}
          wrapper={({ column, children }) => (
            <Space>
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
              {children}
            </Space>
          )}
        />

        {ordering && (
          <Button
            className="flex-button"
            icon={ordering?.desc ? <FaSortAmountUp /> : <FaSortAmountDown />}
            onClick={() => view.setOrdering(ordering?.field)}
          />
        )}
      </ButtonGroup>
    </Space>
  );
});

export const TablePanel = injector(
  ({ store, view, labelingDisabled, loading, target, ordering }) => {
    const toolbarSize = "middle";

    return (
      <div className="tab-panel">
        <Space>
          <ViewToggle />

          {/* {false && (<DataStoreToggle view={view}/>)} */}

          <FieldsButton
            size={toolbarSize}
            wrapper={FieldsButton.Checkbox}
            icon={<EyeOutlined />}
            trailingIcon={<CaretDownOutlined />}
            title={"Fields"}
          />

          <FiltersPane size={toolbarSize} />

          <OrderButton view={view} ordering={ordering} size={toolbarSize} />

          {loading && <Spinner size="small" />}

          <ErrorBox />
        </Space>

        <Space>
          {<SelectedItems />}

          <Button href="/import">Import</Button>

          <Button href="/export">Export</Button>

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
