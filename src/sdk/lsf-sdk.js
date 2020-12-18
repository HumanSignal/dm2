/** @typedef {import("../stores/Tasks").TaskModel} Task */
/** @typedef {import("label-studio").LabelStudio} LabelStudio */
/** @typedef {import("./dm-sdk").DataManager} DataManager */
/** @typedef {{
 * user: Dict
 * config: string,
 * interfaces: string[],
 * task: Task
 * }} LSFOptions */

import { LabelStudio as ModuleLSF } from "label-studio";
import { LSFHistory } from "./lsf-history";
import { completionToServer, taskToLSFormat } from "./lsf-utils";

const DEFAULT_INTERFACES = [
  "basic",
  "skip",
  "predictions",
  "predictions:menu", // right menu with prediction items
  "completions:menu", // right menu with completion items
  "completions:add-new",
  "completions:delete",
  "side-column", // entity
];

export class LSFWrapper {
  /** @type {HTMLElement} */
  root = null;

  /** @type {DataManager} */
  datamanager = null;

  /** @type {Task} */
  task = null;

  /** @type {Completion} */
  initialCompletion = null;

  /** @type {LabelStudio} */
  lsf = null;

  /** @type {LSFHistory} */
  history = null;

  /**
   *
   * @param {DataManager} dm
   * @param {HTMLElement} element
   * @param {LSFOptions} options
   */
  constructor(dm, element, options) {
    this.datamanager = dm;
    this.root = element;
    this.task = options.task;
    this.initialCompletion = options.completion;
    this.history = this.datamanager.isLabelStream ? new LSFHistory(this) : null;

    const lsfProperties = {
      user: options.user,
      config: this.lsfConfig,
      task: taskToLSFormat(this.task),
      description: this.instructions,
      interfaces: DEFAULT_INTERFACES,
      /* EVENTS */
      onLabelStudioLoad: this.onLabelStudioLoad,
      onTaskLoad: this.onTaskLoad,
      onSubmitCompletion: this.onSubmitCompletion,
      onUpdateCompletion: this.onUpdateCompletion,
      onDeleteCompletion: this.onDeleteCompletion,
      onSkipTask: this.onSkipTask,
      onGroundTruth: this.onGroundTruth,
    };

    try {
      const LSF = window.LabelStudio ?? ModuleLSF;
      this.globalLSF = window.LabelStudio === LSF;
      new LSF(this.root, lsfProperties);
    } catch (err) {
      console.error("Failed to initialize LabelStudio", lsfProperties);
      console.error(err);
    }
  }

  /** @private */
  async loadTask(taskID, completionID) {
    if (!this.lsf)
      return console.error("Make sure that LSF was properly initialized");

    if (taskID === undefined) console.info("Load next task");
    else console.info(`Reloading task ${taskID}`);

    const tasks = this.datamanager.store.taskStore;
    const newTask = await this.withinLoadingState(async () => {
      return tasks.loadTask(taskID);
    });
    const needsCompletionsMerge = newTask && this.task?.id === newTask.id;
    const completions = needsCompletionsMerge ? [...this.completions] : [];

    this.task = newTask;

    /* If we're in label stream and there's no task – end the stream */
    if (taskID === undefined && !newTask) {
      this.lsf.setFlags({ noTask: true });
      return;
    }

    if (completions.length) {
      this.task.mergeCompletions(completions);
    }

    /**
     * Add new data from received task
     */
    if (newTask) {
      this.setLoading(false);
      this.setTask(newTask);
      this.setCompletion(completionID);
    }
  }

  /** @private */
  setTask(task) {
    this.lsf.resetState();
    this.lsf.assignTask(task);
    this.lsf.initializeStore(taskToLSFormat(task));
  }

  /** @private */
  setCompletion(completionID) {
    const id = completionID ? completionID.toString() : null;
    let { completionStore: cs } = this.lsf;
    let completion;

    if (this.predictions.length > 0) {
      completion = cs.addCompletionFromPrediction(this.predictions[0]);
    } else if (this.completions.length) {
      completion =
        id !== null
          ? this.completions.find((c) => c.pk === id || c.id === id)
          : this.completions[0];
    } else {
      completion = cs.addCompletion({ userGenerate: true });
    }

    if (completion.id) cs.selectCompletion(completion.id);

    this.datamanager.invoke("completionSet", [completion]);
  }

  onLabelStudioLoad = async (ls) => {
    this.datamanager.invoke("labelStudioLoad", [ls]);

    this.lsf = ls;

    if (this.datamanager.mode === "labelstream") {
      await this.loadTask();
    } else if (this.task) {
      const completionID =
        this.initialCompletion?.pk ?? this.task.lastCompletion?.pk;

      await this.loadTask(this.task.id, completionID);
    }
  };

  /** @private */
  onSubmitCompletion = async (ls, completion) => {
    await this.submitCurrentCompletion("submitCompletion", (taskID, body) =>
      this.datamanager.apiCall("submitCompletion", { taskID }, { body })
    );
  };

  /** @private */
  onUpdateCompletion = async (ls, completion) => {
    const { task } = this;
    const serializedCompletion = this.prepareData(completion);

    const result = await this.withinLoadingState(async () => {
      return this.datamanager.apiCall(
        "updateCompletion",
        {
          taskID: task.id,
          completionID: completion.pk,
        },
        {
          body: serializedCompletion,
        }
      );
    });

    this.datamanager.invoke("updateCompletion", [ls, completion, result]);

    await this.loadTask(this.task.id, completion.pk);
  };

  /**@private */
  onDeleteCompletion = async (ls, completion) => {
    const { task } = this;
    let response;

    if (completion.userGenerate && completion.sentUserGenerate === false) {
      response = { ok: true };
    } else {
      response = await this.withinLoadingState(async () => {
        return this.datamanager.apiCall("deleteCompletion", {
          taskID: task.id,
          completionID: completion.pk,
        });
      });
    }

    this.task.deleteCompletion(completion);
    this.datamanager.invoke("deleteCompletion", [ls, completion]);

    if (response.ok) {
      const lastCompletion =
        this.completions[this.completions.length - 1] ?? {};
      const completionID = lastCompletion.pk ?? lastCompletion.id ?? undefined;

      await this.loadTask(task.id, completionID);

      if (this.completions.length === 0) this.setCompletion(null);
    }
  };

  onSkipTask = async () => {
    await this.submitCurrentCompletion(
      "skipTask",
      (taskID, body) => {
        const { id, ...completion } = body;
        const params = { taskID, was_cancelled: 1 };
        const options = { body: completion };

        if (id !== undefined) params.completionID = id;

        return this.datamanager.apiCall("skipTask", params, options);
      },
      true
    );
  };

  async submitCurrentCompletion(eventName, submit, includeID = false) {
    const { taskID, currentCompletion } = this;
    const serializedCompletion = this.prepareData(currentCompletion, includeID);

    this.setLoading(true);
    const result = await this.withinLoadingState(async () => {
      return submit(taskID, serializedCompletion);
    });

    if (result && result.id !== undefined) {
      currentCompletion.updatePersonalKey(result.id.toString());

      const eventData = completionToServer(currentCompletion);
      this.datamanager.invoke(eventName, [this.lsf, eventData, result]);

      this.history?.add(taskID, currentCompletion.pk);
    }
    this.setLoading(false);

    if (this.datamanager.isExplorer) {
      console.log(`Reload task ${taskID} as DataManager is in Explorer mode`);
      await this.loadTask(taskID, currentCompletion.pk);
    } else {
      console.log(`Load next task as DataManager is in LabelStream mode`);
      await this.loadTask();
    }
  }

  /** @private */
  prepareData(completion, includeId) {
    const result = {
      lead_time: (new Date() - completion.loadedDate) / 1000, // task execution time
      result: completion.serializeCompletion(),
    };

    if (
      includeId &&
      (!completion.userGenerate || completion.sentUserGenerate)
    ) {
      result.id = parseInt(completion.pk);
    }

    return result;
  }

  /** @private */
  setLoading(isLoading) {
    this.lsf.setFlags({ isLoading });
  }

  async withinLoadingState(callback) {
    let result;

    this.setLoading(true);
    if (callback) {
      result = await callback.call(this);
    }
    this.setLoading(false);

    return result;
  }

  get taskID() {
    return this.task.id;
  }

  get currentCompletion() {
    try {
      return this.lsf.completionStore.selected;
    } catch {
      console.trace("Something went wrong when accessing current completion");
      return null;
    }
  }

  get completions() {
    return this.lsf.completionStore.completions;
  }

  get predictions() {
    return this.lsf.completionStore.predictions;
  }

  /** @returns {string|null} */
  get lsfConfig() {
    return this.project.label_config_line;
  }

  /** @returns {Dict} */
  get project() {
    return this.datamanager.store.project;
  }

  /** @returns {string|null} */
  get instructions() {
    return (this.project.instruction ?? "").trim() || null;
  }
}
