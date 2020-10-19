/** @global LSF */

/**
 * @typedef {{
 * root: HTMLElement,
 * api: import("../utils/api-proxy").APIProxyOptions,
 * settings: Dict<any>,
 * }} DMConfig
 */

import { APIProxy } from "../utils/api-proxy";
import { createApp } from "./app-create";

export class DataManager {
  /** @type {HTMLElement} */
  root = null;

  /** @type {APIProxy} */
  api = null;

  /** @type {LabelStudio} */
  lsf = null;

  /** @type {Dict} */
  settings = {};

  /** @type {DataManagerApp} */
  dataManager = null;

  /**
   * Constructor
   * @param {DMConfig} config
   */
  constructor(config) {
    this.root = config.root;
    this.api = new APIProxy(config.api);
    this.settings = config.settings;

    this.initApp();
  }

  initApp() {
    this.dataManager = createApp(this.root, {
      api: this.api,
      ...this.settings,
    });
  }
}
