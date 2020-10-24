/** @typedef {{
 * user: Dict
 * config: string,
 * interfaces: string[],
 * task: Dict
 * }} LSFOptions */

import { LabelStudio } from "label-studio";

export class LSFWrapper {
  /** @type {HTMLElement} */
  root = null;

  /** @type {import("./dm-sdk").DataManager} */
  datamanager = null;

  /**
   *
   * @param {LSFOptions} options
   */
  constructor(dm, element, options) {
    console.log("Initializing LabelStudio");

    this.datamanager = dm;
    this.root = element;

    const lsfSettings = {
      user: options.user,
      task: this.convertTask(options.task),
      config: options.config,
      interfaces: this.buildInterfaces(options.interfaces),
    };

    console.log({ lsfSettings, options });
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

  reset() {
    this.lsf.resetState();
  }

  setTask(task) {
    this.lsf.assignTask(task);
    this.lsf.initializeStore(task);
  }

  setCompletion(id) {
    let { completionStore } = this.lsf;
    let completion;

    if (completionStore.predictions.length > 0) {
      completion = this.lsf.completionStore.addCompletionFromPrediction(
        completionStore.predictions[0]
      );
    } else if (this.lsf.completionStore.completions.length > 0 && id) {
      // we are on history item, take completion id from history
      completion = { id };
    } else {
      completion = this.lsf.completionStore.addCompletion({
        userGenerate: true,
      });
    }

    if (completion.id) completionStore.selectCompletion(completion.id);
  }

  async loadTask(task, completionID) {
    if (!this.lsf)
      return console.error("Make sure that LSF was properly initialized");

    this.lsf.setFlags({ isLoading: true });

    const updatedTask = this.convertTask(await task.updateFromServer());
    console.log({ updatedTask });

    /**
     * Add new data from received task
     */
    this.reset();
    this.setTask(updatedTask);
    this.setCompletion(completionID);

    this.lsf.setFlags({ isLoading: false });
    // this.lsf.onTaskLoad(this.lsf, this.lsf.task);
  }

  /** @private */
  buildInterfaces(interfaces) {
    return interfaces
      ? interfaces
      : [
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
  }

  /**
   * Converts the task from the server format to the format supported by the LS frontend
   * @param {import("../stores/Tasks").TaskModel} task
   * @private
   * @returns {Dict|undefined}
   */
  convertTask(task) {
    if (!task) return;

    const result = {
      completion: [],
      predictions: [],
      ...task,
      createdAt: task.createdAt,
      isLabeled: task.is_labeled,
    };

    if (task.completions) {
      result.completions = task.completions.map((completion) => ({
        ...completion,
        createdAgo: completion.created_ago,
        createdBy: completion.created_username,
        leadTime: completion.lead_time,
      }));
    }

    if (task.predictions) {
      result.predictions = task.predictions.map((prediction) => ({
        ...prediction,
        createdAgo: prediction.created_ago,
        createdBy: prediction.created_by,
      }));
    }

    return result;
  }
}
