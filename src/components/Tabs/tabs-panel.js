import {
  AppstoreOutlined,
  BarsOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Radio, Space, Spin } from "antd";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { ErrorBox } from "../Common/ErrorBox";
import { FieldsButton } from "../Common/FieldsButton";
import { FiltersPane } from "../Common/FiltersPane";
import { TabsActions } from "./tabs-actions";

export const TablePanel = observer(({ views, view }) => {
  const toolbarSize = "middle";

  return (
    <div className="tab-panel">
      <Space>
        <ViewToggle view={view} />

        {/* {false && (<DataStoreToggle view={view}/>)} */}

        <FieldsButton size={toolbarSize} columns={view.targetColumns} />

        <FiltersPane
          size={toolbarSize}
          viewStore={views}
          sidebar={views.sidebarEnabled}
          filters={Array.from(view.filters ?? [])}
        />

        {view.dataStore.loading && (
          <Spin indicator={<LoadingOutlined />} size="small" />
        )}

        <ErrorBox errors={getRoot(view).serverError} />
      </Space>

      <Space>
        {view.selected.hasSelected && (
          <>
            <TabsActions size="small" />
            <Divider type="vertical" />
          </>
        )}

        <Button
          type="primary"
          size={toolbarSize}
          disabled={view.target === "annotations"}
          onClick={() => view.labelAll()}
        >
          <PlayCircleOutlined />
          Label All
        </Button>
      </Space>
    </div>
  );
});

const ViewToggle = observer(({ view }) => {
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

const DataStoreToggle = observer(({ view }) => {
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
