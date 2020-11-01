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
  const labeling = app.isLabelStreamMode || app.tasksStore.task !== undefined;
  const { loading } = app;
  return (
    <Provider store={app}>
      <Styles fullScreen={labeling}>
        {loading ? (
          <div>Loading...</div>
        ) : labeling ? (
          <Labeling />
        ) : (
          <TabsWrapper />
        )}
      </Styles>
    </Provider>
  );
};

export const App = observer(AppComponent);
