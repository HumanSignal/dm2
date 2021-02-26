import { observer, Provider } from "mobx-react";
import React from "react";
import { cn } from "../../utils/bem";
import { Spinner } from "../Common/Spinner";
import { DataManager } from "../DataManager/DataManager";
import { Labeling } from "../Label/Label";
import "./App.styl";

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
  return (
    <ErrorBoundary>
      <Provider store={app}>
        <div className={cn("root").mod({ mode: app.SDK.mode })}>
          {app.loading ? (
            <div className={cn("app-loader")}>
              <Spinner size="large" />
            </div>
          ) : app.isLabeling ? (
            <Labeling />
          ) : (
            <DataManager />
          )}
          <div className={cn("offscreen-lsf")}></div>
        </div>
      </Provider>
    </ErrorBoundary>
  );
};

export const App = observer(AppComponent);
