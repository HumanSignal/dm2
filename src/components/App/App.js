import { observer, Provider } from "mobx-react";
import React from "react";
import DmLabel from "../Label";
import { TabsWrapper } from "../Tabs/tabs";
import Styles from "./App.styles";
import "./index.scss";

const App = observer(({ app }) => {
  return (
    <Provider store={app}>
      <Styles>{app.tasksStore.task ? <DmLabel /> : <TabsWrapper />}</Styles>
    </Provider>
  );
});

export default App;
