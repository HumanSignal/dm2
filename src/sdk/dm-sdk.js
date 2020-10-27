/** @global LSF */

/**
 * @typedef {{
 * root: HTMLElement,
 * api: import("../utils/api-proxy").APIProxyOptions,
 * settings: Dict<any>,
 * labelStudio: Dict<any>
 * mode: "development" | "production"
 * }} DMConfig
 */

import { APIProxy } from "../utils/api-proxy";
import { createApp } from "./app-create";
import { LSFWrapper } from "./lsf-sdk";

export class DataManager {
  /** @type {HTMLElement} */
  root = null;

  /** @type {APIProxy} */
  api = null;

  /** @type {import("./lsf-sdk").LSFWrapper} */
  lsf = null;

  /** @type {Dict} */
  settings = {};

  /** @type {import("../stores/AppStore").AppStore} */
  store = null;

  /** @type {Dict<any>} */
  labelStudioOptions = {};

  /** @type {"development" | "production"} */
  mode = "development";

  /**
   * @private
   * @type {Map<String, Set<Function>>}
   */
  callbacks = new Map();

  /**
   * Constructor
   * @param {DMConfig} config
   */
  constructor(config) {
    this.root = config.root;
    this.api = new APIProxy(config.api);
    this.settings = config.settings;
    this.labelStudioOptions = config.labelStudio;
    this.mode = config.mode ?? process.env.NODE_ENV;

    this.initApp();
  }

  /**
   * Assign an event handler
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    const events = this.getEventCallbacks(eventName);
    events.add(callback);
    this.callbacks.set(eventName, events);
  }

  /**
   * Remove an event handler
   * If no callback provided, all assigned callbacks will be removed
   * @param {string} eventName
   * @param {Function?} callback
   */
  off(eventName, callback) {
    const events = this.getEventCallbacks(eventName);
    if (callback) {
      events.delete(callback);
    } else {
      events.clear();
    }
  }

  /**
   * Invoke handlers assigned to an event
   * @param {string} eventName
   * @param {any[]} args
   */
  async invoke(eventName, args) {
    this.getEventCallbacks(eventName).forEach((callback) =>
      callback.apply(this, args)
    );
  }

  /**
   * Get callbacks set for a particular event
   * @param {string} eventName
   */
  getEventCallbacks(eventName) {
    return this.callbacks.get(eventName) ?? new Set();
  }

  /** @private */
  initApp() {
    this.store = createApp(this.root, this);
  }

  /**
   * Initialize LSF or use already initialized instance.
   * Render LSF interface and load task for labeling.
   * @param {HTMLElement} element Root element LSF will be rendered into
   * @param {import("../stores/Tasks").TaskModel} task
   */
  startLabeling(element, task) {
    if (!this.lsf) {
      this.lsf = new LSFWrapper(this, element, {
        ...this.labelStudioOptions,
        task,
      });
      this.lsf.setCompletion();

      return;
    }

    console.log({ task: task.toJSON() });
    const completionID = task.lastCompletion?.id;
    this.lsf.loadTask(task.id, completionID);
  }

  destroyLSF() {
    this.lsf.reset();
    this.lsf = undefined;
  }
}
