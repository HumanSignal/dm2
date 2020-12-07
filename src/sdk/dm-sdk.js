/** @global LSF */

/**
 * @typedef {{
 *  hiddenColumns?: {
 *    labeling?: string[],
 *    explore?: string[],
 *  },
 *  visibleColumns?: {
 *    labeling?: string[],
 *    explore?: string[],
 *  }
 * }} TableConfig
 */

/**
 * @typedef {{
 * root: HTMLElement,
 * apiGateway: string | URL,
 * apiEndpoints: import("../utils/api-proxy").Endpoints,
 * apiMockDisabled: boolean,
 * settings: Dict<any>,
 * labelStudio: Dict<any>,
 * env: "development" | "production",
 * mode: "labelstream" | "explorer",
 * table: TableConfig,
 * }} DMConfig
 */

import { APIProxy } from "../utils/api-proxy";
import { APIConfig } from "./api-config";
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
  env = "development";

  /** @type {"explorer" | "labelstream"} */
  mode = "explorer";

  /** @type {TableConfig} */
  tableConfig = {};

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
    this.api = new APIProxy(
      this.apiConfig({
        apiGateway: config.apiGateway,
        apiEndpoints: config.apiEndpoints,
        apiMockDisabled: config.apiMockDisabled,
      })
    );
    this.settings = config.settings;
    this.labelStudioOptions = config.labelStudio;
    this.env = config.env ?? process.env.NODE_ENV ?? this.env;
    this.mode = config.mode ?? this.mode;
    this.tableConfig = config.table ?? {};

    this.initApp();
  }

  get isExplorer() {
    return this.mode === "explorer";
  }

  get isLabelStream() {
    return this.mode === "labelstream";
  }

  apiConfig({ apiGateway, apiEndpoints, apiMockDisabled }) {
    const config = APIConfig;

    APIConfig.gateway = apiGateway ?? APIConfig.gateway;
    APIConfig.mockDisabled = apiMockDisabled;

    Object.assign(APIConfig.endpoints, apiEndpoints ?? {});

    console.log({ apiGateway, apiEndpoints, apiMockDisabled });
    console.log({ config });

    return config;
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
   *
   * @param {"explorer" | "labelstream"} mode
   */
  async setMode(mode) {
    if (mode === "labelstream") {
      await this.lsf.loadTask();
    }

    this.mode = mode;
    this.store.setMode(mode);
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
  async initApp() {
    this.store = await createApp(this.root, this);
  }

  /**
   * Initialize LSF or use already initialized instance.
   * Render LSF interface and load task for labeling.
   * @param {HTMLElement} element Root element LSF will be rendered into
   * @param {import("../stores/Tasks").TaskModel} task
   */
  startLabeling(element) {
    const [task, completion] = [
      this.store.taskStore.selected,
      this.store.annotationStore.selected,
    ];

    if (!this.lsf) {
      this.lsf = new LSFWrapper(this, element, {
        ...this.labelStudioOptions,
        task,
        completion,
      });

      return;
    }

    if (this.lsf.task !== task || completion !== undefined) {
      const completionID = completion?.id ?? task.lastCompletion?.id;
      this.lsf.loadTask(task.id, completionID);
    }
  }

  destroyLSF() {
    this.lsf.resetLabelStudio();
    this.lsf = undefined;
  }
}
