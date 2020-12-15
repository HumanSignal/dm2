import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import React from "react";

export const Spinner = ({ ...props }) => {
  return <Spin {...props} indicator={<LoadingOutlined />} />;
};
