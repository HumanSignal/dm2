import { APIAnnotation, APIPrediction, APITask, LSFAnnotation, LSFTaskData } from "../types/Task";
import { FF_DEV_2186, FF_DEV_2887, isFF } from "../utils/feature-flags";

/**
 * Converts the task from the server format to the
 * format supported by the LS frontend
 * @param {import("../stores/Tasks").TaskModel} task
 * @private
 */
export const taskToLSFormat = (task: APITask): LSFTaskData | void => {
  if (!task) return;

  const result: LSFTaskData = {
    ...task,
    annotations: [],
    predictions: [],
    createdAt: task.created_at,
    // isLabeled: task.is_labeled, // @todo why?
  };

  if (task.annotations) {
    result.annotations = task.annotations.map(annotationToLSF);
  }

  if (task.predictions) {
    result.predictions = task.predictions.map(predictionToLSF);
  }

  return result;
};

export const annotationToLSF = (annotation: APIAnnotation) => {
  return {
    ...annotation,
    id: undefined,
    pk: String(annotation.id),
    createdAgo: annotation.created_ago,
    createdBy: annotation.created_username,
    createdDate: annotation.created_at,
    leadTime: annotation.lead_time ?? 0,
    skipped: annotation.was_cancelled ?? false,
  };
};

export const predictionToLSF = (prediction: APIPrediction) => {
  return {
    ...prediction,
    id: undefined,
    pk: String(prediction.id),
    createdAgo: prediction.created_ago,
    createdBy: prediction.model_version?.trim() ?? "",
    createdDate: prediction.created_at,
  };
};

export const annotationToServer = (annotation: LSFAnnotation): APIAnnotation => {
  return {
    ...annotation,
    id: Number(annotation.pk),
    created_ago: annotation.createdAgo,
    created_username: annotation.createdBy,
    created_at: new Date().toISOString(),
    lead_time: annotation.leadTime,
  };
};

export const getAnnotationSnapshot = (c: LSFAnnotation) => ({
  id: c.id,
  pk: c.pk,
  result: c.serializeAnnotation(),
  leadTime: c.leadTime,
  userGenerate: !!c.userGenerate,
  sentUserGenerate: !!c.sentUserGenerate,
});

export const adjacentTaskIds = (filteredOrderedList: { id: number }[], currentId?: number) => {
  const thisTaskInView = filteredOrderedList.findIndex((task) => task.id === currentId);

  if (thisTaskInView < 0) return { prevTaskId: undefined, nextTaskId: undefined };
  return {
    prevTaskId: filteredOrderedList[thisTaskInView - 1]?.id,
    nextTaskId: filteredOrderedList[thisTaskInView + 1]?.id,
  };
};

export const DEFAULT_INTERFACES = [
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

export const findInterfaces = (
  project: {
    enable_empty_annotation: boolean;
    show_skip_button: any;
    review_settings?: { require_comment_on_reject: boolean };
  },
  labelStream: any,
  datamanager: { hasInterface: (arg: string) => any },
  role: string,
  shouldLoadNext: () => any,
  interfacesModifier?: (arg0: string[], arg1: any) => string[],
) => {
  let interfaces = [...DEFAULT_INTERFACES];

  if (project.enable_empty_annotation === false) {
    interfaces.push("annotations:deny-empty");
  }

  if (labelStream) {
    interfaces.push("infobar");
    interfaces.push("topbar:prev-next-history");
    if (FF_DEV_2186 && project.review_settings?.require_comment_on_reject) {
      interfaces.push("comments:update");
    }
    if (project.show_skip_button) {
      interfaces.push("skip");
    }
  } else {
    interfaces.push(
      "infobar",
      "annotations:delete",
      "annotations:tabs",
      "predictions:tabs",
    );
  }

  if (datamanager.hasInterface("instruction")) {
    interfaces.push("instruction");
  }

  if (!labelStream && datamanager.hasInterface("groundTruth")) {
    interfaces.push("ground-truth");
  }

  if (datamanager.hasInterface("autoAnnotation")) {
    interfaces.push("auto-annotation");
  }
  if (interfacesModifier) {
    interfaces = interfacesModifier(interfaces, labelStream);
  }
  if (isFF(FF_DEV_2887)) {
    interfaces.push("annotations:comments");
  }

  if (role) {
    if (role === "REVIEWER") {
      interfaces.push("annotations:view-all");
      interfaces.push("annotations:add-new", "annotations:view-all");
    }
    else if (
      (role === "ADMIN" || role === "MANAGER" || role === "OWNER") &&
      !labelStream
    ) {
      interfaces.push("annotations:add-new", "annotations:view-all");
    }
  } else interfaces.push("annotations:add-new", "annotations:view-all");

  if (!shouldLoadNext()) {
    interfaces = interfaces.filter((item) => {
      return !["topbar:prev-next-history", "skip"].includes(item);
    });
  }
  return interfaces;
};