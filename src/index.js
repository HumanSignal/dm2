import React from "react";
import ReactDOM from "react-dom";

import AppStore from "./stores/AppStore";
import App from "./components/App";
import views from "./data/views";

import "./index.scss";

const app = AppStore.create({ viewsStore: { views } });

ReactDOM.render(<App app={app} />, document.getElementById("app"));
