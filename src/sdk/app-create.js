/** @typedef {{
 * views?: any[]
 * }} AppOptions */

import React from "react";
import ReactDOM from "react-dom";
import App from "../components/App/App";
import AppStore from "../stores/AppStore";

/**
 * Create DM React app
 * @param {HTMLElement} rootNode
 * @param {AppOptions} options
 */
export const createApp = (
  rootNode,
  { api, config, views, data, mode } = {}
) => {
  console.log(views);
  const appStore = AppStore.create({
    viewsStore: { views: views },
  });

  appStore.tasksStore.setData(data);

  appStore._api = api;
  appStore._config = config;
  appStore._mode = mode || process.env.NODE_ENV;

  window.DM = appStore;

  const component = ReactDOM.render(<App app={appStore} />, rootNode);

  return { appStore, component };
};
