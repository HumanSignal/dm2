import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { observer, Provider } from "mobx-react";
import React from "react";
import { Labeling } from "../Label/Label";
import { TabsWrapper } from "../Tabs/tabs";
import Styles from "./App.styles";
import "./index.scss";

/** @typedef {import("../../stores/AppStore").AppStore} AppStore */

/**
 * Main Component
 * @param {{app: AppStore} param0
 */
const AppComponent = ({ app }) => {
  return (
    <Provider store={app}>
      <Styles fullScreen={app.isLabeling}>
        {app.loading ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin indicator={<LoadingOutlined />} size="large" />
          </div>
        ) : app.isLabeling ? (
          <Labeling />
        ) : (
          <TabsWrapper />
        )}
      </Styles>
    </Provider>
  );
};

export const App = observer(AppComponent);