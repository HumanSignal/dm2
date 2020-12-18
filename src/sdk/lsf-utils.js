/**
 * Converts the task from the server format to the
 * format supported by the LS frontend
 * @param {import("../stores/Tasks").TaskModel} task
 * @private
 */
export const taskToLSFormat = (task) => {
  if (!task) return;

  const result = {
    completion: [],
    predictions: [],
    ...task,
    createdAt: task.createdAt,
    isLabeled: task.is_labeled,
  };

  if (task.completions) {
    result.completions = task.completions.map(completionToLSF);
  }

  if (task.predictions) {
    result.predictions = task.predictions.map(predictionToLSF);
  }

  return result;
};

export const completionToLSF = (completion) => {
  return {
    ...completion,
    createdAgo: completion.created_ago,
    createdBy: completion.created_username,
    leadTime: completion.lead_time,
    skipped: completion.was_cancelled,
  };
};

export const predictionToLSF = (prediction) => {
  return {
    ...prediction,
    createdAgo: prediction.created_ago,
    createdBy: prediction.created_by,
  };
};

export const completionToServer = (completion) => {
  return {
    ...completion,
    id: completion.pk,
    created_ago: completion.createdAgo,
    created_username: completion.createdBy,
    created_at: new Date().toISOString(),
    lead_time: completion.leadTime,
  };
};

export const getCompletionSnapshot = (c) => ({
  id: c.id,
  pk: c.pk,
  result: c.serializeCompletion(),
  leadTime: c.leadTime,
  userGenerate: !!c.userGenerate,
  sentUserGenerate: !!c.sentUserGenerate,
});
