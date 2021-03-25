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
 * polling: boolean,
 * apiGateway: string | URL,
 * apiEndpoints: import("../utils/api-proxy").Endpoints,
 * apiMockDisabled: boolean,
 * apiHeaders?: Dict<string>,
 * settings: Dict<any>,
 * labelStudio: Dict<any>,
 * env: "development" | "production",
 * mode: "labelstream" | "explorer",
 * table: TableConfig,
 * links: Dict<string|null>,
 * showPreviews: boolean,
 * projectId: number,
 * interfaces: Dict<boolean>
 * }} DMConfig
 */

import { unmountComponentAtNode } from "react-dom";
import { APIProxy } from "../utils/api-proxy";
import { objectToMap } from "../utils/helpers";
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

  /** @type {Dict<string|null>} */
  links = {
    import: "/import",
    export: "/export",
    settings: "./settings",
  };

  /**
   * @private
   * @type {Map<String, Set<Function>>}
   */
  callbacks = new Map();

  /** @type {Number} */
  apiVersion = 1;

  /** @type {boolean} */
  showPreviews = false;

  /** @type {boolean} */
  polling = true;

  /** @type {boolean} */
  started = false;

  /** @type {Map<string, boolean>} */
  interfaces = objectToMap({
    import: true,
    export: true,
    labelButton: true,
    backButton: true,
  });

  /**
   * Constructor
   * @param {DMConfig} config
   */
  constructor(config) {
    this.root = config.root;
    this.projectId = config.projectId;
    this.settings = config.settings;
    this.labelStudioOptions = config.labelStudio;
    this.env = config.env ?? process.env.NODE_ENV ?? this.env;
    this.mode = config.mode ?? this.mode;
    this.tableConfig = config.table ?? {};
    this.apiVersion = config?.apiVersion ?? 1;
    this.links = Object.assign(this.links, config.links ?? {});
    this.showPreviews = config.showPreviews ?? false;
    this.polling = config.polling;
    this.interfaces = objectToMap({
      ...Object.fromEntries(this.interfaces),
      ...config.interfaces,
    });

    this.api = new APIProxy(
      this.apiConfig({
        apiGateway: config.apiGateway,
        apiEndpoints: config.apiEndpoints,
        apiMockDisabled: config.apiMockDisabled,
        apiSharedParams: config.apiSharedParams,
        apiHeaders: config.apiHeaders,
      })
    );

    this.initApp();
  }

  get isExplorer() {
    return this.mode === "labeling";
  }

  get isLabelStream() {
    return this.mode === "labelstream";
  }

  get projectId() {
    return (this._projectId = this._projectId ?? this.root.dataset?.projectId);
  }

  set projectId(value) {
    this._projectId = value;
  }

  apiConfig({
    apiGateway,
    apiEndpoints,
    apiMockDisabled,
    apiSharedParams,
    apiHeaders,
  }) {
    const config = Object.assign({}, APIConfig);

    config.gateway = apiGateway ?? config.gateway;
    config.mockDisabled = apiMockDisabled;
    config.commonHeaders = apiHeaders;

    Object.assign(config.endpoints, apiEndpoints ?? {});
    Object.assign(config, {
      sharedParams: {
        project: this.projectId,
        ...(apiSharedParams ?? {}),
      },
    });

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
   * Check if an event has at least one handler
   * @param {string} eventName Name of the event to check
   */
  hasHandler(eventName) {
    return this.getEventCallbacks(eventName).size > 0;
  }

  /**
   * Check if interface is enabled
   * @param {string} name Name of the interface
   */
  interfaceEnabled(name) {
    return this.interfaces.get(name) === true;
  }

  /**
   *
   * @param {"explorer" | "labelstream"} mode
   */
  async setMode(mode) {
    const modeChanged = mode !== this.mode;
    this.mode = mode;
    this.store.setMode(mode);

    if (modeChanged) this.invoke('modeChanged', [this.mode]);
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
    this.invoke('ready', [this]);
  }

  /**
   * Initialize LSF or use already initialized instance.
   * Render LSF interface and load task for labeling.
   * @param {HTMLElement} element Root element LSF will be rendered into
   * @param {import("../stores/Tasks").TaskModel} task
   */
  async startLabeling(element) {
    let [task, annotation] = [
      this.store.taskStore.selected,
      this.store.annotationStore.selected,
    ];

    // do nothing if the task is already selected
    if (this.lsf?.task && task && this.lsf.task.id === task.id) {
      return;
    }

    let labelStream = this.mode === "labelstream";

    // Load task if there's no selected one
    if (!task) {
      task = await this.store.taskStore.loadTask();
    }

    if (!this.lsf) {
      this.lsf = new LSFWrapper(this, element, {
        ...this.labelStudioOptions,
        task,
        annotation,
        labelStream,
      });

      return;
    }

    if (
      !labelStream &&
      this.lsf &&
      (this.lsf.task?.id !== task?.id || annotation !== undefined)
    ) {
      const annotationID = annotation?.id ?? task.lastAnnotation?.id;
      this.lsf.loadTask(task.id, annotationID);
    }
  }

  destroyLSF() {
    this.lsf = undefined;
  }

  destroy() {
    if (this.store) this.store.destroy?.();
    unmountComponentAtNode(this.root);
    this.callbacks.forEach((callbacks) => callbacks.clear());
    this.callbacks.clear();
  }

  reload() {
    this.destroy();
    this.initApp();
  }

  async apiCall(...args) {
    return this.store.apiCall(...args);
  }
}
