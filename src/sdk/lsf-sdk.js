/** @typedef {import("../stores/Tasks").TaskModel} Task */
/** @typedef {import("label-studio").LabelStudio} LabelStudio */
/** @typedef {import("./dm-sdk").DataManager} DataManager */

/** @typedef {{
 * user: Dict
 * config: string,
 * interfaces: string[],
 * task: Task
 * labelStream: boolean,
 * interfacesModifier: function,
 * }} LSFOptions */

import { FF_DEV_1621, FF_DEV_2186, isFF } from "../utils/feature-flags";
import { isDefined } from "../utils/utils";
// import { LSFHistory } from "./lsf-history";
import { annotationToServer, taskToLSFormat } from "./lsf-utils";

const DEFAULT_INTERFACES = [
  "basic",
  "controls",
  "submit",
  "update",
  "predictions",
  "topbar",
  "predictions:menu", // right menu with prediction items
  "annotations:menu", // right menu with annotation items
  "annotations:current",
  "side-column", // entity
  "edit-history", // undo/redo
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
  // history = null;

  /** @type {boolean} */
  labelStream = false;

  /** @type {boolean} */
  isInteractivePreannotations = false;

  /** @type {function} */
  interfacesModifier = (interfaces) => interfaces;

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
    this.interfacesModifier = options.interfacesModifier;
    this.isInteractivePreannotations = options.isInteractivePreannotations ?? false;
    // this.history = this.labelStream ? new LSFHistory(this) : null;

    let interfaces = [...DEFAULT_INTERFACES];

    if (this.project.enable_empty_annotation === false) {
      interfaces.push("annotations:deny-empty");
    }

    if (this.labelStream) {
      interfaces.push("infobar");
      interfaces.push("topbar:prevnext");
      if (FF_DEV_2186 && this.project.review_settings?.require_comment_on_reject) {
        interfaces.push("comments:update");
      }
      if (this.project.show_skip_button) {
        interfaces.push("skip");
      }
    } else {
      interfaces.push(
        "infobar",
        "annotations:add-new",
        "annotations:view-all",
        "annotations:delete",
        "annotations:tabs",
        "predictions:tabs",
      );
    }

    if (this.datamanager.hasInterface('instruction')) {
      interfaces.push('instruction');
    }

    if (!this.labelStream && this.datamanager.hasInterface('groundTruth')) {
      interfaces.push('ground-truth');
    }

    if (this.datamanager.hasInterface("autoAnnotation")) {
      interfaces.push("auto-annotation");
    }
    if (this.interfacesModifier) {
      interfaces = this.interfacesModifier(interfaces, this.labelStream);
    }

    const lsfProperties = {
      user: options.user,
      config: this.lsfConfig,
      task: taskToLSFormat(this.task),
      description: this.instruction,
      interfaces,
      users: dm.store.users.map(u => u.toJSON()),
      keymap: options.keymap,
      forceAutoAnnotation: this.isInteractivePreannotations,
      forceAutoAcceptSuggestions: this.isInteractivePreannotations,
      /* EVENTS */
      onSubmitDraft: this.onSubmitDraft,
      onLabelStudioLoad: this.onLabelStudioLoad,
      onTaskLoad: this.onTaskLoad,
      onStorageInitialized: this.onStorageInitialized,
      onSubmitAnnotation: this.onSubmitAnnotation,
      onUpdateAnnotation: this.onUpdateAnnotation,
      onDeleteAnnotation: this.onDeleteAnnotation,
      onSkipTask: this.onSkipTask,
      onCancelSkippingTask: this.onCancelSkippingTask,
      onGroundTruth: this.onGroundTruth,
      onEntityCreate: this.onEntityCreate,
      onEntityDelete: this.onEntityDelete,
      onSelectAnnotation: this.onSelectAnnotation,
      onNextTask: this.onNextTask,
      onPrevTask: this.onPrevTask,
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

      const names = Array.from(this.datamanager.callbacks.keys())
        .filter(k => k.startsWith('lsf:'));

      names.forEach(name => {
        this.datamanager.getEventCallbacks(name).forEach(clb => {
          this.lsfInstance.on(name.replace(/^lsf:/, ''), clb);
        });
      });
    } catch (err) {
      console.error("Failed to initialize LabelStudio", settings);
      console.error(err);
    }
  }

  /** @private */
  async loadTask(taskID, annotationID, fromHistory = false) {
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
    if (newTask) this.selectTask(newTask, annotationID, fromHistory);
  }

  selectTask(task, annotationID, fromHistory = false) {
    const needsAnnotationsMerge = task && this.task?.id === task.id;
    const annotations = needsAnnotationsMerge ? [...this.annotations] : [];

    this.task = task;

    if (needsAnnotationsMerge) {
      this.task.mergeAnnotations(annotations);
    }

    this.loadUserLabels();

    this.setLSFTask(task, annotationID, fromHistory);
  }

  setLSFTask(task, annotationID, fromHistory) {
    this.setLoading(true);
    const lsfTask = taskToLSFormat(task);
    const isRejectedQueue = isDefined(task.default_selected_annotation);

    if (isRejectedQueue && !annotationID) {
      annotationID = task.default_selected_annotation;
    }

    this.lsf.resetState();
    this.lsf.assignTask(task);
    this.lsf.initializeStore(lsfTask);
    this.setAnnotation(annotationID, fromHistory || isRejectedQueue);
    this.setLoading(false);
  }

  /** @private */
  setAnnotation(annotationID, selectAnnotation = false) {
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
            c.history.freeze();
            console.log("Applying draft");
            c.addVersions({ draft: draft.result });
            c.deleteAllRegions({ deleteReadOnly: true });
          } else {
            // that shouldn't happen
            console.error(`No annotation found for pk=${draftAnnotationPk}`);
            continue;
          }
        } else {
          // Annotation not found - restore annotation from draft
          c = cs.addAnnotation({
            draft: draft.result,
            userGenerate: true,
            createdBy: draft.created_username,
            createdAgo: draft.created_ago,
            createdDate: draft.created_at,
          });
        }
        cs.selectAnnotation(c.id);
        c.deserializeResults(draft.result);
        c.setDraftId(draft.id);
        c.setDraftSaved(draft.created_at);
        c.history.safeUnfreeze();
      }
    }

    const first = this.annotations[0];
    // if we have annotations created automatically, we don't need to create another one
    // automatically === created here and haven't saved yet, so they don't have pk
    // @todo because of some weird reason pk may be string uid, so check flags then
    const hasAutoAnnotations = !!first && (!first.pk || (first.userGenerate && first.sentUserGenerate === false));
    const showPredictions = this.project.show_collab_predictions === true;

    if (this.labelStream) {
      if (first?.draftId) {
        // not submitted draft, most likely from previous labeling session
        annotation = first;
      } else if (isDefined(annotationID) && selectAnnotation) {
        annotation = this.annotations.find(({ pk }) => pk === annotationID);
      } else if (showPredictions && this.predictions.length > 0 && !this.isInteractivePreannotations) {
        annotation = cs.addAnnotationFromPrediction(this.predictions[0]);
      } else {
        annotation = isFF(FF_DEV_1621) ? cs.createAnnotation() : cs.addAnnotation({ userGenerate: true });
      }
    } else {
      if (this.annotations.length === 0 && this.predictions.length > 0 && !this.isInteractivePreannotations) {
        annotation = cs.addAnnotationFromPrediction(this.predictions[0]);
      } else if (this.annotations.length > 0 && id && id !== "auto") {
        annotation = this.annotations.find((c) => c.pk === id || c.id === id);
      } else if (this.annotations.length > 0 && (id === "auto" || hasAutoAnnotations)) {
        annotation = first;
      } else {
        annotation = isFF(FF_DEV_1621) ? cs.createAnnotation() : cs.addAnnotation({ userGenerate: true });
      }
    }


    if (annotation) {
      cs.selectAnnotation(annotation.id);
      this.datamanager.invoke("annotationSet", annotation);
    }
  }

  saveUserLabels = async () => {
    const body = [];
    const userLabels = this.lsf?.userLabels?.controls;

    if (!userLabels) return;

    for (const from_name in userLabels) {
      for (const label of userLabels[from_name]) {
        body.push({
          value: label.path,
          title: [from_name, JSON.stringify(label.path)].join(":"),
          from_name,
          project: this.project.id,
        });
      }
    }

    if (!body.length) return;

    await this.datamanager.apiCall("saveUserLabels", {}, { body });
  }

  async loadUserLabels() {
    if (!this.lsf?.userLabels) return;

    const userLabels = await this.datamanager.apiCall(
      "userLabelsForProject",
      { project: this.project.id, expand: "label" },
    );

    if (!userLabels) return;

    const controls = {};

    for (const result of (userLabels.results ?? [])) {
      // don't trust server's response!
      if (!result?.label?.value?.length) continue;

      const control = result.from_name;

      if (!controls[control]) controls[control] = [];
      controls[control].push(result.label.value);
    }

    this.lsf.userLabels.init(controls);
  }

  onLabelStudioLoad = async (ls) => {
    this.datamanager.invoke("labelStudioLoad", ls);
    this.lsf = ls;

    await this.loadUserLabels();

    if (this.labelStream) {
      await this.loadTask();
    }
  };

  /** @private */
  onTaskLoad = async (...args) => {
    this.datamanager.invoke("onSelectAnnotation", ...args);
  };

  onStorageInitialized = async (ls) => {
    this.datamanager.invoke("onStorageInitialized", ls);

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
  onUpdateAnnotation = async (ls, annotation, extraData) => {
    const { task } = this;
    const serializedAnnotation = this.prepareData(annotation);

    Object.assign(serializedAnnotation, extraData);

    await this.saveUserLabels();

    const result = await this.withinLoadingState(async () => {
      return this.datamanager.apiCall(
        "updateAnnotation",
        {
          taskID: task.id,
          annotationID: annotation.pk,
        },
        {
          body: serializedAnnotation,
        },
      );
    });

    this.datamanager.invoke("updateAnnotation", ls, annotation, result);

    const isRejectedQueue = isDefined(task.default_selected_annotation);

    if (isRejectedQueue) {
      // load next task if that one was updated task from rejected queue
      await this.loadTask();
    } else {
      await this.loadTask(this.task.id, annotation.pk, true);
    }
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

    task.deleteAnnotation(annotation);

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
      this.datamanager.invoke("deleteAnnotation", ls, annotation);
    }

    if (response.ok) {
      const lastAnnotation = this.annotations[this.annotations.length - 1] ?? {};
      const annotationID = lastAnnotation.pk ?? undefined;

      this.setAnnotation(annotationID);
    }
  };

  onSubmitDraft = async (studio, annotation) => {
    const annotationDoesntExist = !annotation.pk;
    const data = { body: this.prepareData(annotation, { draft: true }) }; // serializedAnnotation

    await this.saveUserLabels();

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
          data,
        );
      }
      response?.id && annotation.setDraftId(response?.id);
    }
  };

  onSkipTask = async (_, { comment } = {}) => {
    await this.submitCurrentAnnotation(
      "skipTask",
      (taskID, body) => {
        const { id, ...annotation } = body;
        const params = { taskID };
        const options = { body: annotation };

        options.body.was_cancelled = true;
        if (comment) options.body.comment = comment;

        if (id === undefined) {
          return this.datamanager.apiCall("submitAnnotation", params, options);
        } else {
          params.annotationID = id;
          return this.datamanager.apiCall("updateAnnotation", params, options);
        }
      },
      true,
    );
  };

  onCancelSkippingTask = async () => {
    const { task, currentAnnotation } = this;

    if (!isDefined(currentAnnotation) && !isDefined(currentAnnotation.pk)) {
      console.error('Annotation must be on unskip');
      return;
    }

    await this.withinLoadingState(async () => {
      currentAnnotation.pauseAutosave();
      if (currentAnnotation.draftId > 0) {
        await this.datamanager.apiCall("updateDraft", {
          draftID: currentAnnotation.draftId,
        }, {
          body: { annotation: null },
        });
      } else {
        const annotationData = { body: this.prepareData(currentAnnotation) };

        await this.datamanager.apiCall("createDraftForTask", {
          taskID: this.task.id,
        }, annotationData);
      }
      await this.datamanager.apiCall("deleteAnnotation", {
        taskID: task.id,
        annotationID: currentAnnotation.pk,
      });
    });
    await this.loadTask(task.id);
    this.datamanager.invoke("cancelSkippingTask");
  };

  // Proxy events that are unused by DM integration
  onEntityCreate = (...args) => this.datamanager.invoke("onEntityCreate", ...args);
  onEntityDelete = (...args) => this.datamanager.invoke("onEntityDelete", ...args);
  onSelectAnnotation = (prevAnnotation, nextAnnotation) => {
    this.datamanager.invoke("onSelectAnnotation", prevAnnotation, nextAnnotation, this);
  }


  onNextTask = (nextTaskId, nextAnnotationId) => {
    console.log(nextTaskId, nextAnnotationId);

    this.loadTask(nextTaskId, nextAnnotationId, true);
  }
  onPrevTask = (prevTaskId, prevAnnotationId) => {
    console.log(prevTaskId, prevAnnotationId);

    this.loadTask(prevTaskId, prevAnnotationId, true);
  }
  async submitCurrentAnnotation(eventName, submit, includeId = false, loadNext = true) {
    const { taskID, currentAnnotation } = this;
    const serializedAnnotation = this.prepareData(currentAnnotation, { includeId });

    this.setLoading(true);

    await this.saveUserLabels();

    const result = await this.withinLoadingState(async () => {
      const result = await submit(taskID, serializedAnnotation);

      return result;
    });

    if (result && result.id !== undefined) {
      const annotationId = result.id.toString();

      currentAnnotation.updatePersonalKey(annotationId);

      const eventData = annotationToServer(currentAnnotation);

      this.datamanager.invoke(eventName, this.lsf, eventData, result);

      // this.history?.add(taskID, currentAnnotation.pk);
    }

    this.setLoading(false);

    if (!loadNext || this.datamanager.isExplorer) {
      await this.loadTask(taskID, currentAnnotation.pk, true);
    } else {
      await this.loadTask();
    }
  }

  /** @private */
  prepareData(annotation, { includeId, draft } = {}) {
    const userGenerate =
      !annotation.userGenerate || annotation.sentUserGenerate;

    const result = {
      // task execution time, always summed up with previous values
      lead_time: (new Date() - annotation.loadedDate) / 1000 + Number(annotation.leadTime ?? 0),
      // don't serialize annotations twice for drafts
      result: draft ? annotation.versions.draft : annotation.serializeAnnotation(),
      draft_id: annotation.draftId,
      parent_prediction: annotation.parent_prediction,
      parent_annotation: annotation.parent_annotation,
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

  get taskHistory() {
    return this.lsf.annotationStore.taskHistory;
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
