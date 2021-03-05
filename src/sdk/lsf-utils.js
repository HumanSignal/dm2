/**
 * Converts the task from the server format to the
 * format supported by the LS frontend
 * @param {import("../stores/Tasks").TaskModel} task
 * @private
 */
export const taskToLSFormat = (task) => {
  if (!task) return;

  const result = {
    annotation: [],
    predictions: [],
    ...task,
    createdAt: task.createdAt,
    isLabeled: task.is_labeled,
  };

  if (task.annotations) {
    result.annotations = task.annotations.map(annotationToLSF);
  }

  if (task.predictions) {
    result.predictions = task.predictions.map(predictionToLSF);
  }

  return result;
};

export const annotationToLSF = (annotation) => {
  return {
    ...annotation,
    createdAgo: annotation.created_ago,
    createdBy: annotation.created_username,
    leadTime: annotation.lead_time,
    skipped: annotation.was_cancelled,
  };
};

export const predictionToLSF = (prediction) => {
  return {
    ...prediction,
    createdAgo: prediction.created_ago,
    createdBy: prediction.created_by,
  };
};

export const annotationToServer = (annotation) => {
  return {
    ...annotation,
    id: annotation.pk,
    created_ago: annotation.createdAgo,
    created_username: annotation.createdBy,
    created_at: new Date().toISOString(),
    lead_time: annotation.leadTime,
  };
};

export const getAnnotationSnapshot = (c) => ({
  id: c.id,
  pk: c.pk,
  result: c.serializeAnnotation(),
  leadTime: c.leadTime,
  userGenerate: !!c.userGenerate,
  sentUserGenerate: !!c.sentUserGenerate,
});
