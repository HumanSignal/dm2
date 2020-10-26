import {
  AppstoreOutlined,
  BarsOutlined,
  CaretDownOutlined,
  EyeOutlined,
  FilterOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu, Radio, Space } from "antd";
import { observer } from "mobx-react";
import React from "react";
import FieldsMenu from "../FieldsMenu";

const actionsMenu = (
  <Menu onClick={() => {}}>
    <Menu.Item key="1">Delete</Menu.Item>
  </Menu>
);

export const TablePanel = observer(({ item }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "1em",
        marginBottom: "1em",
      }}
    >
      <Space size="middle">
        <Radio.Group
          value={item.type}
          onChange={(e) => item.setType(e.target.value)}
        >
          <Radio.Button value="list">
            <BarsOutlined /> List
          </Radio.Button>
          <Radio.Button value="grid">
            <AppstoreOutlined /> Grid
          </Radio.Button>
        </Radio.Group>

        <Radio.Group
          value={item.target}
          onChange={(e) => item.setTarget(e.target.value)}
        >
          <Radio.Button value="tasks">Tasks</Radio.Button>
          <Radio.Button value="annotations">Annotations</Radio.Button>
        </Radio.Group>

        <Dropdown overlay={<FieldsMenu item={item} />}>
          <Button>
            <EyeOutlined /> Fields <CaretDownOutlined />
          </Button>
        </Dropdown>

        <Button
          type={item.enableFilters ? "primary" : ""}
          onClick={() => item.toggleFilters()}
        >
          <FilterOutlined /> Filters{" "}
        </Button>
      </Space>

      <Space size="middle">
        <Button
          disabled={item.target === "annotations"}
          onClick={() => item.root.setMode("label")}
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
