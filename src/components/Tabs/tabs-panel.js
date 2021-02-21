import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { Radio, Space } from "antd";
import { inject, observer } from "mobx-react";
import React from "react";
import {
  FaMinus,
  FaPlus,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { Button } from "../Common/Button/Button";
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
    <Space style={{ fontSize: 12 }}>
      Order
      <Button.Group>
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
          className="flex-button"
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
          className="flex-button"
          icon={<FaMinus size="12" color="#595959" />}
          onClick={() => setGridWidth(width - 1)}
          disabled={width === 3}
        />
        <Button
          size={size}
          className="flex-button"
          icon={<FaPlus size="12" color="#595959" />}
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
    const { links } = store.SDK;

    return (
      <div className="tab-panel">
        <Space size="large">
          <DataStoreToggle size={toolbarSize} view={view} />

          <ViewToggle size={toolbarSize} />

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

          {links.import && (
            <Button
              size={toolbarSize}
              className="flex-button"
              onClick={() => (window.location.href = links.import)}
            >
              Import
            </Button>
          )}

          {links.export && (
            <Button
              size={toolbarSize}
              className="flex-button"
              onClick={() => (window.location.href = links.export)}
            >
              Export
            </Button>
          )}

          {!labelingDisabled && (
            <Button
              primary
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
    <Radio.Group
      size={size}
      value={view.type}
      onChange={(e) => view.setType(e.target.value)}
      style={{ whiteSpace: "nowrap" }}
    >
      <Radio.Button value="list">
        <BarsOutlined />
      </Radio.Button>
      <Radio.Button value="grid">
        <AppstoreOutlined />
      </Radio.Button>
    </Radio.Group>
  );
});

const SelectedItems = inject(({ store }) => ({
  hasSelected: store.currentView?.selected?.hasSelected ?? false,
}))(({ hasSelected }) => hasSelected && <TabsActions size="small" />);

const DataStoreToggle = viewInjector(({ view, size }) => {
  return (
    <Radio.Group
      value={view.target}
      size={size}
      onChange={(e) => view.setTarget(e.target.value)}
    >
      <Radio.Button value="tasks">Tasks</Radio.Button>
      <Radio.Button value="annotations" disabled>
        Annotations
      </Radio.Button>
    </Radio.Group>
  );
});
