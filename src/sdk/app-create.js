/** @typedef {{
 * views?: any[]
 * }} AppOptions */

import React from "react";
import ReactDOM from "react-dom";
import { App } from "../components/App/App";
import { AppStore } from "../stores/AppStore";

/**
 * Create DM React app
 * @param {HTMLElement} rootNode
 * @param {import("./dm-sdk").DataManager} datamanager
 * @returns {Promise<AppStore>}
 */
export const createApp = async (rootNode, datamanager) => {
  console.log(`DataManager is loading in ${datamanager.mode} mode`);
  const appStore = AppStore.create({
    viewsStore: { views: [] },
    mode: datamanager.mode,
  });

  appStore._sdk = datamanager;
  appStore.fetchData();

  window.DM = appStore;

  ReactDOM.render(<App app={appStore} />, rootNode);

  return appStore;
};
