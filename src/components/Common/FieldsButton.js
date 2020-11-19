import { CaretDownOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { observer } from "mobx-react";
import React from "react";
import { TabFieldsMenu } from "./TabFieldsMenu";

export const FieldsButton = observer(({ view, size }) => {
  return (
    <Dropdown overlay={TabFieldsMenu(view)} transitionName={""}>
      <Button size={size}>
        <EyeOutlined /> Fields <CaretDownOutlined />
      </Button>
    </Dropdown>
  );
});
