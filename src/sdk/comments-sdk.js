import { FF_DEV_3034, isFF } from "../utils/feature-flags";

export class CommentsSdk {
  constructor(lsf, dm) {
    this.lsf = lsf;
    this.dm = dm;
    this.bindEventHandlers();
  }

  bindEventHandlers() {
    [
      'comments:create',
      'comments:update',
      'comments:list',
    ].forEach((evt) => this.lsf.off(evt));

    this.lsf.on("comments:create", this.createComment);
    this.lsf.on("comments:update", this.updateComment);
    this.lsf.on("comments:list", this.listComments);
  }

  createComment = async (comment) => {
    const body = {
      is_resolved: comment.is_resolved,
      text: comment.text,
    };

    if (comment.annotation) {
      body.annotation = comment.annotation;
    } else if(isFF(FF_DEV_3034) && comment.draft) {
      body.draft =  comment.draft;
    }
    const { $meta: _, ...newComment } = await this.dm.apiCall("createComment", undefined, {
      body,
    });

    return newComment;
  }

  // @todo enable with ability to update comments for resolve/unresolve
  updateComment = async (comment) => {
    if (!comment.id || comment.id < 0) return; // Don't allow an update with an incorrect id

    const res = await this.dm.apiCall("updateComment", { id: comment.id }, {  body: comment });

    return res;
  }

  listComments = async (params) => {
    const listParams = {
      ordering: params.ordering || "-id",
    };

    if (params.annotation) {
      listParams.annotation = params.annotation;
    } else if (isFF(FF_DEV_3034) && params.draft) {
      listParams.draft = params.draft;
    } else {
      return [];
    }

    const res = await this.dm.apiCall("listComments", listParams);

    return res;  
  }
}

