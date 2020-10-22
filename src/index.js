// import React from "react";
// import ReactDOM from "react-dom";
// import App from "./components/App/App";
// import config from './data/config';
// import data from './data/tasks.json';
// import views from "./data/views";
// import "./index.scss";
// import AppStore from "./stores/AppStore";

// const app = AppStore.create({
//     viewsStore: {  views: window.LS_VIEWS || views }
// });

// app.tasksStore.setData(window.LS_DATA || data)

// app._config = window.LS_CONFIG || config;
// app._mode = window.LS_MODE || 'dev';

// window.DM = app;

// ReactDOM.render(<App app={app} />, document.getElementById("app"));

import config from "./data/config";
import data from "./data/tasks.json";
import { DataManager } from "./sdk";

/** @param {import('./sdk/dm').DMConfig} config */
const DM = (config) => new DataManager(config);

if (process.env.NODE_ENV === "development" && !process.env.BUILD_MODULE) {
  DM({
    root: document.getElementById("app"),
    api: {
      gateway: "/api",
      endpoints: {
        tasks: {
          path: "/tasks",
          mock(url, request) {
            const { page, page_size } = request.data;
            const offset = (page - 1) * page_size;
            return data.slice(offset, page_size);
          },
        },
        completions: {
          path: "/tasks/:id/completions",
          method: "post",
          mock() {
            return data[0].completions;
          },
        },
        cancel: "/cancel",
        projects: "/projects",
        next: "/next",
        expertInstructions: "/expert_instruction",
      },
    },
    settings: {
      config,
    },
  });
}

export default DM;
