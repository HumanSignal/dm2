import { Dropdown } from "antd";
import React from "react";

export const TableDropdown = (props) => {
  const [visible, setVisible] = React.useState(false);
  return <Dropdown {...props} visible={visible} onVisibleChange={setVisible} />;
};
