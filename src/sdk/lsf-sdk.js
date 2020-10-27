/** @typedef {import("../stores/Tasks").TaskModel} Task */
/** @typedef {import("label-studio").LabelStudio} LabelStudio */
/** @typedef {import("./dm-sdk").DataManager} DataManager */
/** @typedef {{
 * user: Dict
 * config: string,
 * interfaces: string[],
 * task: Task
 * }} LSFOptions */

import { LabelStudio } from "label-studio";
import { completionToServer, taskToLSFormat } from "./lsf-utils";

const DEFAULT_INTERFACES = [
  "basic",
  "panel", // undo, redo, reset panel
  "controls", // all control buttons: skip, submit, update
  "submit", // submit button on controls
  "update", // update button on controls
  "predictions",
  "predictions:menu", // right menu with prediction items
  "completions:menu", // right menu with completion items
  "completions:add-new",
  "completions:delete",
  "side-column", // entity
  "skip",
];

export class LSFWrapper {
  /** @type {HTMLElement} */
  root = null;

  /** @type {DataManager} */
  datamanager = null;

  /** @type {Task} */
  task = null;

  /** @type {LabelStudio} */
  lsf = null;

  /**
   *
   * @param {DataManager} dm
   * @param {HTMLElement} element
   * @param {LSFOptions} options
   */
  constructor(dm, element, options) {
    console.log("Initializing LabelStudio");

    this.datamanager = dm;
    this.root = element;
    this.task = options.task;

    const lsfSettings = {
      user: options.user,
      task: taskToLSFormat(this.task),
      config: this.projectConfig,
      interfaces: this.buildInterfaces(options.interfaces),
    };

    this.lsf = new LabelStudio(this.root, {
      ...lsfSettings,
      onSubmitCompletion: this.onSubmitCompletion,
      onTaskLoad: this.onTaskLoad,
      onUpdateCompletion: this.onUpdateCompletion,
      onDeleteCompletion: this.onDeleteCompletion,
      onSkipTask: this.onSkipTask,
      onGroundTruth: this.onGroundTruth,
      onLabelStudioLoad: this.onLabelStudioLoad,
    });
  }

  /** @private */
  async loadTask(taskID, completionID) {
    if (!this.lsf)
      return console.error("Make sure that LSF was properly initialized");

    if (!taskID) console.info("Load next task");

    this.setLoading(true);
    const tasks = this.datamanager.store.tasksStore;
    const newTask = await tasks.loadTask(taskID);

    this.task = newTask;

    /**
     * Add new data from received task
     */
    this.reset();
    this.setTask(newTask);
    this.setCompletion(completionID);

    this.setLoading(false);
    // this.lsf.onTaskLoad(this.lsf, this.lsf.task);
  }

  /** @private */
  reset() {
    this.lsf.resetState();
  }

  /** @private */
  setTask(task) {
    console.log("The store is being re-initiailized", { task });
    this.lsf.assignTask(task);
    this.lsf.initializeStore(taskToLSFormat(task));
  }

  /** @private */
  setCompletion(id) {
    let { completionStore: cs } = this.lsf;
    let completion;

    console.log({
      id,
      completions: this.completions,
      l: this.completions.length,
    });

    if (this.predictions.length > 0) {
      console.log("Added from prediction");
      completion = cs.addCompletionFromPrediction(this.predictions[0]);
    } else if (this.completions.length > 0 && id !== undefined) {
      console.log("Existing ID taken");
      // we are on history item, take completion id from history
      completion = { id };
    } else {
      console.log("Completion generated");
      completion = cs.addCompletion({ userGenerate: true });
    }

    if (completion.id) cs.selectCompletion(completion.id);
  }

  /** @private */
  buildInterfaces(interfaces) {
    return interfaces ? interfaces : DEFAULT_INTERFACES;
  }

  /** @private */
  onSubmitCompletion = async (ls, completion) => {
    this.setLoading(true);

    const body = this.prepareData(completion);

    const result = await this.datamanager.api.submitCompletion(
      {
        taskID: this.task.id,
      },
      { body }
    );

    if (result && result.id) {
      completion.updatePersonalKey(result.id.toString());
      this.datamanager.invoke(
        "submitCompletion",
        ls,
        completionToServer(completion),
        result
      );
      this.addHistory(ls, ls.task.id, result.id);
    }

    await this.loadTask(this.task.id);

    this.setLoading(false);
  };

  /** @private */
  onUpdateCompletion = async (ls, completion) => {
    this.setLoading(true);

    const result = await this.datamanager.api.updateCompletion(
      {
        taskID: this.task.id,
        completionID: completion.id,
      },
      {
        body: this.prepareData(completion),
      }
    );

    this.datamanager.invoke("updateCompletion", ls, completion, result);

    console.log({
      taskID: this.task.id,
      completionID: this.currentCompletion.id,
    });
    await this.loadTask(this.task.id, this.currentCompletion.id);

    this.setLoading(false);
  };

  /** @private */
  addHistory() {}

  /** @private */
  prepareData(completion, includeId) {
    const result = {
      lead_time: (new Date() - completion.loadedDate) / 1000, // task execution time
      result: completion.serializeCompletion(),
    };

    if (includeId) {
      result.id = parseInt(completion.id);
    }

    return result;
  }

  /** @private */
  setLoading(loading) {
    this.lsf.setFlags({ loading });
  }

  get currentCompletion() {
    return this.lsf.completionStore.selected;
  }

  get completions() {
    return this.lsf.completionStore.completions;
  }

  get predictions() {
    return this.lsf.completionStore.predictions;
  }

  get projectConfig() {
    return this.datamanager.store.project.label_config_line;
  }
}
