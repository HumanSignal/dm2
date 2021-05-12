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

import { isDefined } from "../utils/utils";
import { LSFHistory } from "./lsf-history";
import { annotationToServer, taskToLSFormat } from "./lsf-utils";

const DEFAULT_INTERFACES = [
  "basic",
  "skip",
  "controls",
  "submit",
  "update",
  "predictions",
  "predictions:menu", // right menu with prediction items
  "annotations:menu", // right menu with annotation items
  "annotations:delete",
  "annotations:current",
  "annotations:tabs",
  "predictions:tabs",
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
    this.labelStream = options.isLabelStream ?? false;
    this.initialAnnotation = options.annotation;
    this.history = this.labelStream ? new LSFHistory(this) : null;

    const interfaces = [...DEFAULT_INTERFACES];

    if (this.labelStream) {
      interfaces.push("infobar");
    } else {
      interfaces.push(
        "annotations:add-new",
        "annotations:view-all",
        "infobar",
      );
    }

    const lsfProperties = {
      user: options.user,
      config: this.lsfConfig,
      task: taskToLSFormat(this.task),
      description: this.instruction,
      interfaces: interfaces,
      /* EVENTS */
      onSubmitDraft: this.onSubmitDraft,
      onLabelStudioLoad: this.onLabelStudioLoad,
      onTaskLoad: this.onTaskLoad,
      onStorageInitialized: this.onStorageInitialized,
      onSubmitAnnotation: this.onSubmitAnnotation,
      onUpdateAnnotation: this.onUpdateAnnotation,
      onDeleteAnnotation: this.onDeleteAnnotation,
      onSkipTask: this.onSkipTask,
      onGroundTruth: this.onGroundTruth,
      onEntityCreate: this.onEntityCreate,
      onEntityDelete: this.onEntityDelete,
      onSelectAnnotation: this.onSelectAnnotation,
      panels: this.datamanager.panels,
    };

    this.initLabelStudio(lsfProperties);
  }

  /** @private */
  async initLabelStudio(settings) {
    try {
      const LSF = await resolveLabelStudio();
      this.globalLSF = window.LabelStudio === LSF;
      this.lsfInstance = new LSF(this.root, settings);
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
      if (!isDefined(taskID)) {
        return tasks.loadNextTask();
      } else {
        return tasks.loadTask(taskID);
      }
    });

    /* If we're in label stream and there's no task – end the stream */
    if (this.labelStream && !newTask) {
      this.lsf.setFlags({ noTask: true });
      return;
    } else {
      // don't break the LSF - if user explores tasks after finishing labeling, show them
      this.lsf.setFlags({ noTask: false });
    }

    // Add new data from received task
    if (newTask) this.selectTask(newTask, annotationID);
  }

  selectTask(task, annotationID) {
    const needsAnnotationsMerge = task && this.task?.id === task.id;
    const annotations = needsAnnotationsMerge ? [...this.annotations] : [];

    this.task = task;

    if (needsAnnotationsMerge) {
      this.task.mergeAnnotations(annotations);
    }

    this.setLoading(false);

    const lsfTask = taskToLSFormat(task);

    this.lsf.resetState();
    this.lsf.assignTask(task);
    this.lsf.initializeStore(lsfTask);
    this.setAnnotation(annotationID);
  }

  /** @private */
  setAnnotation(annotationID) {
    const id = annotationID ? annotationID.toString() : null;
    let { annotationStore: cs } = this.lsf;
    let annotation;
    const activeDrafts = cs.annotations.map(a => a.draftId).filter(Boolean);

    if (this.task.drafts) {
      for (const draft of this.task.drafts) {
        if (activeDrafts.includes(draft.id)) continue;
        let c;
        if (draft.annotation) {
          // Annotation existed - add draft to existed annotation
          const draftAnnotationPk = String(draft.annotation);
          c = cs.annotations.find(c => c.pk === draftAnnotationPk);
          if (c) {
            c.addVersions({draft: draft.result});
            c.deleteAllRegions({ deleteReadOnly: true });
          } else {
            // that shouldn't happen
            console.error(`No annotation found for pk=${draftAnnotationPk}`);
            continue;
          }
        } else {
          // Annotation not found - create new annotation from draft
          c = cs.addAnnotation({
            draft: draft.result,
            userGenerate: true,
            createdBy: draft.created_username,
            createdAgo: draft.created_ago
          });
        }
        cs.selectAnnotation(c.id);
        c.deserializeAnnotation(draft.result);
        c.setDraftId(draft.id);
      }
    }

    const first = this.annotations[0];
    // if we have annotations created automatically, we don't need to create another one
    // automatically === created here and haven't saved yet, so they don't have pk
    // @todo because of some weird reason pk may be string uid, so check flags then
    const hasAutoAnnotations = !!first && (!first.pk || (first.userGenerate && first.sentUserGenerate === false));
    const showPredictions = this.project.show_collab_predictions === true;

    if (this.labelStream) {
      if (showPredictions && this.predictions.length > 0) {
        annotation = cs.addAnnotationFromPrediction(this.predictions[0]);
      } else {
        annotation = cs.addAnnotation({ userGenerate: true });
      }
    } else {
      if (showPredictions && this.annotations.length === 0 && this.predictions.length > 0) {
        annotation = cs.addAnnotationFromPrediction(this.predictions[0]);
      } else if (this.annotations.length > 0 && (id === "auto" || hasAutoAnnotations)) {
        annotation = { id: this.annotations[0].id };
      } else if (this.annotations.length > 0 && id) {
        annotation = this.annotations.find((c) => c.pk === id || c.id === id);
      } else {
        annotation = cs.addAnnotation({ userGenerate: true });
      }
    }


    if (annotation) {
      cs.selectAnnotation(annotation.id);
      this.datamanager.invoke("annotationSet", [annotation]);
    }
  }

  onLabelStudioLoad = async (ls) => {
    this.datamanager.invoke("labelStudioLoad", [ls]);
    this.lsf = ls;

    if (this.labelStream) {
      await this.loadTask();
    }
  };

  /** @private */
  onTaskLoad = async (...args) => {
    this.datamanager.invoke("onSelectAnnotation", args);
  };

  onStorageInitialized = async (ls) => {
    this.datamanager.invoke("onStorageInitialized", [ls]);

    if (this.task && this.labelStream === false) {
      const annotationID =
        this.initialAnnotation?.pk ?? this.task.lastAnnotation?.pk ?? this.task.lastAnnotation?.id ?? "auto";

      this.setAnnotation(annotationID);
    }
  }

  /** @private */
  onSubmitAnnotation = async () => {
    await this.submitCurrentAnnotation("submitAnnotation", async (taskID, body) => {
      return await this.datamanager.apiCall("submitAnnotation", { taskID }, { body });
    });
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

  deleteDraft = async (id) => {
    const response = await this.datamanager.apiCall("deleteDraft", {
      draftID: id,
    });
    this.task.deleteDraft(id);
    return response;
  }

  /**@private */
  onDeleteAnnotation = async (ls, annotation) => {
    const { task } = this;
    let response;

    if (annotation.userGenerate && annotation.sentUserGenerate === false) {
      if (annotation.draftId) {
        response = await this.deleteDraft(annotation.draftId);
      } else {
        response = { ok: true };
      }
    } else {
      response = await this.withinLoadingState(async () => {
        return this.datamanager.apiCall("deleteAnnotation", {
          taskID: task.id,
          annotationID: annotation.pk,
        });
      });

      // this.task.deleteAnnotation(annotation);
      this.datamanager.invoke("deleteAnnotation", [ls, annotation]);
    }

    if (response.ok) {
      const lastAnnotation =
        this.annotations[this.annotations.length - 1] ?? {};
      const annotationID = lastAnnotation.pk ?? undefined;

      this.setAnnotation(annotationID);
    }
  };

  onSubmitDraft = async (studio, annotation) => {
    const annotationDoesntExist = !annotation.pk;
    const data = { body: this.prepareData(annotation) }; // serializedAnnotation

    if (annotation.draftId > 0) {
      // draft has been already created
      return this.datamanager.apiCall("updateDraft", { draftID: annotation.draftId }, data);
    } else {
      let response;
      if (annotationDoesntExist) {
        response = await this.datamanager.apiCall("createDraftForTask", { taskID: this.task.id }, data);
      } else {
        response = await this.datamanager.apiCall(
          "createDraftForAnnotation",
          { taskID: this.task.id, annotationID: annotation.pk },
          data
        );
      }
      response?.id && annotation.setDraftId(response?.id);
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
      const result = await submit(taskID, serializedAnnotation);
      return result;
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
      draft_id: annotation.draftId,
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
    this.lsfInstance?.destroy?.();
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
