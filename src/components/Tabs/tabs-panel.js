import {
  AppstoreOutlined,
  BarsOutlined,
  CaretDownOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu, Radio, Space } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { VscListFilter } from "react-icons/vsc";
import { Filters } from "../Filters/Filters";
import TabFieldsMenu from "./tab-fields-menu";

const actionsMenu = (
  <Menu onClick={() => {}}>
    <Menu.Item key="1">Delete</Menu.Item>
  </Menu>
);

const FiltersButton = ({ onClick, active }) => {
  return (
    <Button onClick={onClick} type={active ? "primary" : "default"}>
      <VscListFilter style={{ marginBottom: -2, marginRight: 7 }} />
      Filters
    </Button>
  );
};

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

        <Dropdown overlay={TabFieldsMenu(view)} transitionName={""}>
          <Button>
            <EyeOutlined /> Fields <CaretDownOutlined />
          </Button>
        </Dropdown>

        {views.sidebarEnabled ? (
          <FiltersButton
            onClick={() => views.toggleSidebar()}
            active={view.filtersApplied}
          />
        ) : (
          <Dropdown overlay={<Filters />} trigger="click">
            <FiltersButton active={view.filtersApplied} />
          </Dropdown>
        )}
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
