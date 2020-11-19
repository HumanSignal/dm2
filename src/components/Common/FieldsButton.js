import { CaretDownOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { observer } from "mobx-react";
import { TabFieldsMenu } from "./TabFieldsMenu";
import React from "react";

export const FieldsButton = observer(({ view }) => {
  return (
    <Dropdown overlay={TabFieldsMenu(view)} transitionName={""}>
      <Button>
        <EyeOutlined /> Fields <CaretDownOutlined />
      </Button>
    </Dropdown>
  );
});
