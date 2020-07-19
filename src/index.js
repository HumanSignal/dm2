import React from "react";
import ReactDOM from "react-dom";

import AppStore from "./stores/AppStore";
import App from "./components/App";

import views from "./data/views";
import data from './data/tasks.json';
import config from './data/config';

import "./index.scss";

const app = AppStore.create({
    viewsStore: {  views: window.LS_VIEWS || views }
    
});

app._data = window.LS_DATA || data;
app._config = window.LS_CONFIG || config;
app._mode = window.LS_MODE || 'dev';

ReactDOM.render(<App app={app} />, document.getElementById("app"));
