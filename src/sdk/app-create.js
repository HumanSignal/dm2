/** @typedef {{
 * views?: any[]
 * }} AppOptions */

import { configureStore } from '@reduxjs/toolkit';
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { App } from "../components/App/App";
import { reducers } from '../store';
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
    const dataStore = DataStores[target].create?.(columns);
    if (dataStore) registerModel(`${target}Store`, dataStore);
  });

  /** temporary solution until we'll have annotations */
  registerModel("annotationsStore", DataStores.annotations?.create());
};

/**
 * Create DM React app
 * @param {HTMLElement} rootNode
 * @param {import("./dm-sdk").DataManager} datamanager
 * @returns {Promise<AppStore>}
 */
export const createApp = async (rootNode, datamanager) => {
  const response = await datamanager.api.columns();
  const columns = response.columns ?? (Array.isArray(response) ? response : []);

  const reduxStore = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      thunk: {
        extraArgument: { API: datamanager.api }
      }
    })
  });

  createDynamicModels(columns);

  const appStore = AppStore.create({
    viewsStore: {
      views: [],
      columnsRaw: columns,
    },
    mode: datamanager.mode,
    showPreviews: datamanager.showPreviews,
  });

  appStore._sdk = datamanager;
  appStore.fetchData();

  window.DM = appStore;

  ReactDOM.render((
    <Provider store={reduxStore}>
      <App app={appStore} />
    </Provider>
  ), rootNode);

  return appStore;
};
