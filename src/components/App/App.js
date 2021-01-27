import { observer, Provider } from "mobx-react";
import React from "react";
import { Spinner } from "../Common/Spinner";
import { Labeling } from "../Label/Label";
import { DMTabs } from "../Tabs/tabs";
import { Styles } from "./App.styles";

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
 * @param {{app: import("../../stores/AppStore").AppStore} param0
 */
const AppComponent = ({ app }) => {
  // make full screen for label stream
  const rootStyle =
    app.SDK.mode === "labelstream"
      ? {
          position: "absolute",
          width: "100%",
          top: 0,
          zIndex: 1000,
        }
      : null;

  return (
    <ErrorBoundary>
      <Provider store={app}>
        <Styles fullScreen={app.isLabeling} style={rootStyle}>
          {app.loading ? (
            <div className="app-loader">
              <Spinner size="large" />
            </div>
          ) : app.isLabeling ? (
            <Labeling />
          ) : (
            <DMTabs />
          )}
        </Styles>
      </Provider>
    </ErrorBoundary>
  );
};

export const App = observer(AppComponent);
