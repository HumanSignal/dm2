/** @typedef {import("../stores/Tasks").TaskModel} Task */
/** @typedef {import("label-studio").LabelStudio} LabelStudio */
/** @typedef {import("./dm-sdk").DataManager} DataManager */

/** @typedef {{
 * user: Dict
 * config: string,
 * interfaces: string[],
 * task: Task
 * labelStream: boolean,
 * }} LSFOptions */

import { unmountComponentAtNode } from "react-dom";
import { LSFHistory } from "./lsf-history";
import { annotationToServer, taskToLSFormat } from "./lsf-utils";

const DEFAULT_INTERFACES = [
  "basic",
  "skip",
  "predictions",
  "predictions:menu", // right menu with prediction items
  "annotations:menu", // right menu with annotation items
  "annotations:add-new",
  "annotations:delete",
  "side-column", // entity
];

let LabelStudioDM;

const resolveLabelStudio = async () => {
  if (LabelStudioDM) {
    return LabelStudioDM;
  } else if (window.LabelStudio) {
    return (LabelStudioDM = window.LabelStudio);
  }
};

export class LSFWrapper {
  /** @type {HTMLElement} */
  root = null;

  /** @type {DataManager} */
  datamanager = null;

  /** @type {Task} */
  task = null;

  /** @type {Annotation} */
  initialAnnotation = null;

  /** @type {LabelStudio} */
  lsf = null;

  /** @type {LSFHistory} */
  history = null;

  /** @type {boolean} */
  labelStream = false;

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
    this.labelStream = options.labelStream ?? false;
    this.initialAnnotation = options.annotation;
    this.history = this.datamanager.isLabelStream ? new LSFHistory(this) : null;

    const lsfProperties = {
      user: options.user,
      config: this.lsfConfig,
      task: taskToLSFormat(this.task),
      description: this.instruction,
      interfaces: DEFAULT_INTERFACES,
      /* EVENTS */
      onLabelStudioLoad: this.onLabelStudioLoad,
      onTaskLoad: this.onTaskLoad,
      onSubmitAnnotation: this.onSubmitAnnotation,
      onUpdateAnnotation: this.onUpdateAnnotation,
      onDeleteAnnotation: this.onDeleteAnnotation,
      onSkipTask: this.onSkipTask,
      onGroundTruth: this.onGroundTruth,
      onEntityCreate: this.onEntityCreate,
      onEntityDelete: this.onEntityDelete,
      onSelectAnnotation: this.onSelectAnnotation,
    };

    this.initLabelStudio(lsfProperties);
  }

  /** @private */
  async initLabelStudio(settings) {
    try {
      const LSF = await resolveLabelStudio();
      this.globalLSF = window.LabelStudio === LSF;
      new LSF(this.root, settings);
    } catch (err) {
      console.error("Failed to initialize LabelStudio", settings);
      console.error(err);
    }
  }

  /** @private */
  async loadTask(taskID, annotationID) {
    if (!this.lsf) {
      return console.error("Make sure that LSF was properly initialized");
    }

    const tasks = this.datamanager.store.taskStore;
    const newTask = await this.withinLoadingState(async () => {
      return tasks.loadTask(taskID);
    });
    const needsAnnotationsMerge = newTask && this.task?.id === newTask.id;
    const annotations = needsAnnotationsMerge ? [...this.annotations] : [];

    this.task = newTask;

    /* If we're in label stream and there's no task – end the stream */
    if (taskID === undefined && !newTask) {
      this.lsf.setFlags({ noTask: true });
      return;
    } else {
      // don't break the LSF - if user explores tasks after finishing labeling, show them
      this.lsf.setFlags({ noTask: false });
    }

    if (annotations.length) {
      this.task.mergeAnnotations(annotations);
    }

    /**
     * Add new data from received task
     */
    if (newTask) {
      this.setLoading(false);
      this.setTask(newTask);
      this.setAnnotation(annotationID);
    }
  }

  /** @private */
  setTask(task) {
    this.lsf.resetState();
    this.lsf.assignTask(task);
    this.lsf.initializeStore(taskToLSFormat(task));
  }

  /** @private */
  setAnnotation(annotationID) {
    const id = annotationID ? annotationID.toString() : null;
    let { annotationStore: cs } = this.lsf;
    let annotation;

    const first = this.annotations[0];
    // if we have annotations created automatically, we don't need to create another one
    // automatically === created here and haven't saved yet, so they don't have pk
    // @todo because of some weird reason pk may be string uid, so check flags then
    const haveAutoAnnotations = !!first && (!first.pk || (first.userGenerate && first.sentUserGenerate === false));

    if (this.predictions.length > 0 && this.labelStream) {
      annotation = cs.addAnnotationFromPrediction(this.predictions[0]);
    } else if (this.annotations.length > 0 && (id === "auto" || haveAutoAnnotations)) {
      annotation = { id: this.annotations[0].id };
    } else if (this.annotations.length > 0 && id) {
      annotation = this.annotations.find((c) => c.pk === id || c.id === id);
    } else {
      annotation = cs.addAnnotation({ userGenerate: true });
    }

    if (annotation) {
      cs.selectAnnotation(annotation.id);
      this.datamanager.invoke("annotationSet", [annotation]);
    }
  }

  onLabelStudioLoad = async (ls) => {
    this.datamanager.invoke("labelStudioLoad", [ls]);

    this.lsf = ls;

    if (this.datamanager.mode === "labelstream") {
      await this.loadTask();
    } else if (this.task) {
      const annotationID =
        this.initialAnnotation?.pk ?? this.task.lastAnnotation?.pk ?? "auto";

      await this.loadTask(this.task.id, annotationID);
    }
  };

  /** @private */
  onTaskLoad = async (...args) => {
    this.datamanager.invoke("onSelectAnnotation", args);
  };

  /** @private */
  onSubmitAnnotation = async (ls, annotation) => {
    await this.submitCurrentAnnotation("submitAnnotation", (taskID, body) =>
      this.datamanager.apiCall("submitAnnotation", { taskID }, { body })
    );
  };

  /** @private */
  onUpdateAnnotation = async (ls, annotation) => {
    const { task } = this;
    const serializedAnnotation = this.prepareData(annotation);

    const result = await this.withinLoadingState(async () => {
      return this.datamanager.apiCall(
        "updateAnnotation",
        {
          taskID: task.id,
          annotationID: annotation.pk,
        },
        {
          body: serializedAnnotation,
        }
      );
    });

    this.datamanager.invoke("updateAnnotation", [ls, annotation, result]);

    await this.loadTask(this.task.id, annotation.pk);
  };

  /**@private */
  onDeleteAnnotation = async (ls, annotation) => {
    const { task } = this;
    let response;

    if (annotation.userGenerate && annotation.sentUserGenerate === false) {
      response = { ok: true };
    } else {
      response = await this.withinLoadingState(async () => {
        return this.datamanager.apiCall("deleteAnnotation", {
          taskID: task.id,
          annotationID: annotation.pk,
        });
      });

      this.task.deleteAnnotation(annotation);
      this.datamanager.invoke("deleteAnnotation", [ls, annotation]);
    }

    if (response.ok) {
      const lastAnnotation =
        this.annotations[this.annotations.length - 1] ?? {};
      const annotationID = lastAnnotation.pk ?? undefined;

      await this.loadTask(task.id, annotationID);
    }
  };

  onSkipTask = async () => {
    await this.submitCurrentAnnotation(
      "skipTask",
      (taskID, body) => {
        const { id, ...annotation } = body;
        const params = { taskID, was_cancelled: 1 };
        const options = { body: annotation };

        if (id !== undefined) params.annotationID = id;

        return this.datamanager.apiCall("skipTask", params, options);
      },
      true
    );
  };

  // Proxy events that are unused by DM integration
  onEntityCreate = (...args) => this.datamanager.invoke("onEntityCreate", args);
  onEntityDelete = (...args) => this.datamanager.invoke("onEntityDelete", args);
  onSelectAnnotation = (...args) =>
    this.datamanager.invoke("onSelectAnnotation", args);

  async submitCurrentAnnotation(eventName, submit, includeID = false) {
    const { taskID, currentAnnotation } = this;
    const serializedAnnotation = this.prepareData(currentAnnotation, includeID);

    this.setLoading(true);
    const result = await this.withinLoadingState(async () => {
      return submit(taskID, serializedAnnotation);
    });

    if (result && result.id !== undefined) {
      currentAnnotation.updatePersonalKey(result.id.toString());

      const eventData = annotationToServer(currentAnnotation);
      this.datamanager.invoke(eventName, [this.lsf, eventData, result]);

      this.history?.add(taskID, currentAnnotation.pk);
    }
    this.setLoading(false);

    if (this.datamanager.isExplorer) {
      await this.loadTask(taskID, currentAnnotation.pk);
    } else {
      await this.loadTask();
    }
  }

  /** @private */
  prepareData(annotation, includeId) {
    const userGenerate =
      !annotation.userGenerate || annotation.sentUserGenerate;

    const result = {
      lead_time: (new Date() - annotation.loadedDate) / 1000, // task execution time
      result: annotation.serializeAnnotation(),
    };

    if (includeId && userGenerate) {
      result.id = parseInt(annotation.pk);
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

  destroy() {
    unmountComponentAtNode(this.root);
  }

  get taskID() {
    return this.task.id;
  }

  get currentAnnotation() {
    try {
      return this.lsf.annotationStore.selected;
    } catch {
      return null;
    }
  }

  get annotations() {
    return this.lsf.annotationStore.annotations;
  }

  get predictions() {
    return this.lsf.annotationStore.predictions;
  }

  /** @returns {string|null} */
  get lsfConfig() {
    return this.datamanager.store.labelingConfig;
  }

  /** @returns {Dict} */
  get project() {
    return this.datamanager.store.project;
  }

  /** @returns {string|null} */
  get instruction() {
    return (this.project.instruction ?? this.project.expert_instruction ?? "").trim() || null;
  }
}
