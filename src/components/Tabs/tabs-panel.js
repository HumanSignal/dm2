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
import {
  FaDownload,
  FaMinus,
  FaPlus,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUpload,
} from "react-icons/fa";
import styled from "styled-components";
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

const StyledButton = styled(Button)`
  --icon-color: #595959;

  &:hover {
    --icon-color: currentColor;
  }

  svg {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition-delay: 0ms;
  }
`;

const OrderButton = observer(({ ordering, size, view }) => {
  return (
    <Space>
      <ButtonGroup>
        <FieldsButton
          size={size}
          style={{ minWidth: 105, textAlign: "left" }}
          title={
            ordering ? (
              <>
                Order by <b>{ordering.column?.title}</b>
              </>
            ) : (
              "Select order"
            )
          }
          onClick={(col) => view.setOrdering(col.id)}
          onReset={() => view.setOrdering(null)}
          resetTitle="Default"
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

        <Button
          className="flex-button"
          style={{ color: "#595959" }}
          disabled={!!ordering === false}
          icon={ordering?.desc ? <FaSortAmountUp /> : <FaSortAmountDown />}
          onClick={() => view.setOrdering(ordering?.field)}
        />
      </ButtonGroup>
    </Space>
  );
});

const GridWidthButton = observer(({ view, gridWidth }) => {
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
    <Space>
      Columns: {width}
      <ButtonGroup>
        <Button
          className="flex-button"
          icon={<FaMinus />}
          onClick={() => setGridWidth(width - 1)}
          disabled={width === 3}
        />
        <Button
          className="flex-button"
          icon={<FaPlus />}
          onClick={() => setGridWidth(width + 1)}
          disabled={width === 10}
        />
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

          {view.type === "grid" && (
            <GridWidthButton view={view} gridWidth={view.gridWidth} />
          )}

          {loading && <Spinner size="small" />}

          <ErrorBox />
        </Space>

        <Space>
          {<SelectedItems />}

          <Button
            className="flex-button"
            icon={<FaUpload style={{ marginRight: 10 }} />}
            onClick={() => (window.location.href = "/import")}
          >
            Import
          </Button>

          <Button
            className="flex-button"
            icon={<FaDownload style={{ marginRight: 10 }} />}
            onClick={() => (window.location.href = "/export")}
          >
            Export
          </Button>

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
      style={{ whiteSpace: "nowrap" }}
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
