// Switch to page navigation
export const FF_DEV_1470 = "ff_front_dev_1470_dm_pagination_010422_short";

// Ask for comment during update in label stream
export const FF_DEV_2186 = "ff_front_dev_2186_comments_for_update";

// Comments for annotation editor
export const FF_DEV_2887 = "fflag-feat-dev-2887-comments-ui-editor-short";

export const FF_DEV_2536 = "fflag_feat_front_dev-2536_comment_notifications_short";

// Outliner + Details
export const FF_DEV_1170 = "ff_front_1170_outliner_030222_short";

export const FF_DEV_3034 = "fflag-feat-dev-3034-comments-with-drafts-short";

// Customize flags
const flags = {};

function getFeatureFlags() {
  return Object.assign(window.APP_SETTINGS?.feature_flags || {}, flags);
}

export function isFF(id) {
  const featureFlags = getFeatureFlags();

  if (id in featureFlags) {
    return featureFlags[id] === true;
  }
  else {
    return window.APP_SETTINGS?.feature_flags_default_value === true;
  }
}
