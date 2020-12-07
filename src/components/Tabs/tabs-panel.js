import {
  AppstoreOutlined,
  BarsOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Radio, Space } from "antd";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { ErrorBox } from "../Common/ErrorBox";
import { FieldsButton } from "../Common/FieldsButton";
import { FiltersPane } from "../Common/FiltersPane";
import { TabsActions } from "./tabs-actions";

export const TablePanel = observer(({ views, view }) => {
  return (
    <div className="tab-panel">
      <Space size="middle">
        {/* {false && (<ViewToggle view={view}/>} */}

        {/* {false && (<DataStoreToggle view={view}/>)} */}

        <FieldsButton columns={view.targetColumns} />

        <FiltersPane
          sidebar={views.sidebarEnabled}
          viewStore={views}
          filters={Array.from(view.filters ?? [])}
        />

        <ErrorBox errors={getRoot(view).serverError} />
      </Space>

      <Space size="middle">
        <TabsActions />

        <Divider />

        <Button
          disabled={view.target === "annotations"}
          onClick={() => {
            view.root.SDK.setMode("labelstream");
          }}
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
