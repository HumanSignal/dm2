/** @typedef {{
 * views?: any[]
 * }} AppOptions */

import React from "react";
import ReactDOM from "react-dom";
import { App } from "../components/App/App";
import { AppStore } from "../stores/AppStore";
import * as DataStores from "../stores/DataStores";
import { registerModel } from "../stores/DynamicModel";

const createDynamicModels = (columns) => {
  const grouppedColumns = columns.reduce((res, column) => {
    res.set(column.target, res.get(column.target) ?? []);
    res.get(column.target).push(column);
    return res;
  }, new Map());

  grouppedColumns.forEach((columns, target) => {
    console.log({ target, columns });
    const dataStore = DataStores[target].create?.(columns);
    if (dataStore) registerModel(`${target}Store`, dataStore);
  });
};

/**
 * Create DM React app
 * @param {HTMLElement} rootNode
 * @param {import("./dm-sdk").DataManager} datamanager
 * @returns {Promise<AppStore>}
 */
export const createApp = async (rootNode, datamanager) => {
  console.log(`DataManager is loading in ${datamanager.mode} mode`);
  const { columns } = await datamanager.api.columns();

  createDynamicModels(columns);

  const appStore = AppStore.create({
    viewsStore: { views: [], columnsRaw: columns },
    mode: datamanager.mode,
  });

  appStore._sdk = datamanager;
  appStore.fetchData();

  window.DM = appStore;

  ReactDOM.render(<App app={appStore} />, rootNode);

  return appStore;
};
