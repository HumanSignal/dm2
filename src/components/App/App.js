import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { observer, Provider } from "mobx-react";
import React from "react";
import { Labeling } from "../Label/Label";
import { TabsWrapper } from "../Tabs/tabs";
import { Styles } from "./App.styles";

/** @typedef {import("../../stores/AppStore").AppStore} AppStore */

class ErrorBoundary extends React.Component {
  state = {
    error: null,
  };

  componentDidCatch(error) {
    this.setState({ error });
  }

  render() {
    return this.state.error ? (
      <div className="error">{this.state.error}</div>
    ) : (
      this.props.children
    );
  }
}

/**
 * Main Component
 * @param {{app: AppStore} param0
 */
const AppComponent = ({ app }) => {
  return (
    <ErrorBoundary>
      <Provider store={app}>
        <Styles fullScreen={app.isLabeling}>
          {app.loading ? (
            <div className="app-loader">
              <Spin indicator={<LoadingOutlined />} size="large" />
            </div>
          ) : app.isLabeling ? (
            <Labeling />
          ) : (
            <TabsWrapper />
          )}
        </Styles>
      </Provider>
    </ErrorBoundary>
  );
};

export const App = observer(AppComponent);
