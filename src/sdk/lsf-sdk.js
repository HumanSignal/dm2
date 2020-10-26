/** @typedef {{
 * user: Dict
 * config: string,
 * interfaces: string[],
 * task: Dict
 * }} LSFOptions */

import { LabelStudio } from "label-studio";
import { getRoot } from "mobx-state-tree";
import { completionToServer, convertToLSF } from "./lsf-utils";

export class LSFWrapper {
  /** @type {HTMLElement} */
  root = null;

  /** @type {import("./dm-sdk").DataManager} */
  datamanager = null;

  task = null;

  /**
   *
   * @param {LSFOptions} options
   */
  constructor(dm, element, options) {
    console.log("Initializing LabelStudio");

    this.datamanager = dm;
    this.root = element;
    this.task = options.task;

    const lsfSettings = {
      user: options.user,
      task: convertToLSF(this.task),
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

  async loadTask(task, completionID) {
    if (!this.lsf)
      return console.error("Make sure that LSF was properly initialized");

    this.lsf.setFlags({ isLoading: true });
    this.task = task;

    const tasks = getRoot(task).tasksStore;
    const updatedTask = convertToLSF(await tasks.loadTask(completionID));

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

  reset() {
    this.lsf.resetState();
  }

  setTask(task) {
    this.lsf.assignTask(task);
    this.lsf.initializeStore(task);
  }

  setCompletion(id) {
    let {
      completionStore,
      completionStore: { completions, predictions },
    } = this.lsf;

    let completion;

    if (predictions.length > 0) {
      completion = completionStore.addCompletionFromPrediction(predictions[0]);
    } else if (completions.length > 0 && id) {
      // we are on history item, take completion id from history
      completion = { id };
    } else {
      completion = completionStore.addCompletion({ userGenerate: true });
    }

    if (completion.id) completionStore.selectCompletion(completion.id);
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

  onSubmitCompletion = async (ls, completion) => {
    this.lsf.setFlags({ isLoading: true });

    const result = await this.datamanager.api.submitCompletion({
      data: { id: this.task.id },
      body: this.prepareData(completion),
    });

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

    if (!this.task) await this.loadTask(ls);

    ls.setFlags({ isLoading: false });
  };

  prepareData(completion, includeId) {
    const result = {
      lead_time: (new Date() - completion.loadedDate) / 1000, // task execution time
      result: completion.serializeCompletion(),
    };

    if (includeId) {
      result.id = parseInt(completion.id);
    }

    return JSON.stringify(result);
  }
}
