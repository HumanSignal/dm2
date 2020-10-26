/**
 * Converts the task from the server format to the format supported by the LS frontend
 * @param {import("../stores/Tasks").TaskModel} task
 * @private
 * @returns {Dict|undefined}
 */
export const convertToLSF = (task) => {
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
};

export const completionToLSF = (completion) => {
  return {
    ...completion,
    createdAgo: completion.created_ago,
    createdBy: completion.created_username,
    leadTime: completion.lead_time,
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
    id: completion.pk,
    created_ago: completion.createdAgo,
    created_username: completion.createdBy,
    created_at: "2019-08-06T19:27:29.289566Z",
    lead_time: completion.leadTime,
  };
};
