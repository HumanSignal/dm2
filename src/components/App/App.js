import { observer, Provider } from "mobx-react";
import React, { useEffect } from "react";
import { batch, shallowEqual, useDispatch, useSelector } from "react-redux";
import { SDKProvider } from "../../providers/SDKProvider";
import { projectActions, projectSelector } from "../../store/slices/project";
import { taskActions } from "../../store/slices/tasks";
import { Block, Elem } from "../../utils/bem";
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
  const dispatch = useDispatch();
  const project = useSelector(projectSelector, shallowEqual);

  useEffect(() => {
    batch(() => {
      dispatch(projectActions.fetch(app.SDK.projectId))
        .then((result) => {
          console.log(result);
          if (result.meta.fullfilled) {
            dispatch(taskActions.fetch(49));
          }
        });
    });
  }, []);

  console.log({project});

  return (
    <ErrorBoundary>
      <Provider store={app}>
        <SDKProvider sdk={app.SDK}>
          <Block name="root" mod={{ mode: app.SDK.mode }}>
            {app.crashed ? (
              <Block name="crash">
                <Elem name="header">Oops...</Elem>
                <Elem name="description">
                  Project has been deleted or not yet created.
                </Elem>
              </Block>
            ) : app.loading ? (
              <Block name="app-loader">
                <Spinner size="large" />
              </Block>
            ) : app.isLabeling ? (
              <Labeling />
            ) : (
              <DataManager />
            )}
            <Block name={"offscreen-lsf"} />
          </Block>
        </SDKProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export const App = observer(AppComponent);
