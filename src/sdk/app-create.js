/** @typedef {{
 * views?: any[]
 * }} AppOptions */

import React from "react";
import ReactDOM from "react-dom";
import App from "../components/App/App";
import views from "../data/views";
import AppStore from "../stores/AppStore";

/**
 * Create DM React app
 * @param {HTMLElement} rootNode
 * @param {import("./dm").DataManager} dataManager
 */
export const createApp = (rootNode, dataManager) => {
  const appStore = AppStore.create({
    viewsStore: { views: views },
  });

  appStore._sdk = dataManager;

  window.DM = appStore;

  const component = ReactDOM.render(<App app={appStore} />, rootNode);

  return { appStore, component };
};
