import {
  AppstoreOutlined,
  BarsOutlined,
  CaretDownOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu, Radio, Space } from "antd";
import { observer } from "mobx-react";
import { getRoot } from "mobx-state-tree";
import React from "react";
import { ErrorBox } from "../Common/ErrorBox";
import { FieldsButton } from "../Common/FieldsButton";
import { FiltersPane } from "../Common/FiltersPane";

const actionsMenu = (
  <Menu onClick={() => {}}>
    <Menu.Item key="1">Delete</Menu.Item>
  </Menu>
);

export const TablePanel = observer(({ views, view }) => {
  return (
    <div className="tab-panel">
      <Space size="middle">
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

        <Radio.Group
          value={view.target}
          onChange={(e) => view.setTarget(e.target.value)}
        >
          <Radio.Button value="tasks">Tasks</Radio.Button>
          <Radio.Button value="annotations">Annotations</Radio.Button>
        </Radio.Group>

        <FieldsButton view={view} />

        <FiltersPane sidebar={views.sidebarEnabled} viewStore={views} />

        <ErrorBox errors={getRoot(view).serverError} />
      </Space>

      <Space size="middle">
        <Button
          disabled={view.target === "annotations"}
          onClick={() => view.root.setMode("label")}
        >
          <PlayCircleOutlined />
          Label All
        </Button>
        <Dropdown overlay={actionsMenu}>
          <Button>
            Actions <CaretDownOutlined />
          </Button>
        </Dropdown>
      </Space>
    </div>
  );
});
