import { observer, Provider } from "mobx-react";
import React from "react";
import DmTabs from "../DM";
import DmLabel from "../Label";
import Styles from "./App.styles";
import "./index.scss";

const App = observer(({ app }) => {
  return (
    <Provider store={app}>
      <Styles>{app.mode === "dm" ? <DmTabs /> : <DmLabel />}</Styles>
    </Provider>
  );
});

export default App;
