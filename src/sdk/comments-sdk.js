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

    // @todo replace when the api can fetch this in a more performant way.
    const users = this.lsf.store.users;

    const missingUserIds = res.map((c) =>
      !users.some(u => +u.id === +c.created_by) ? c.created_by : null,
    )
      .reduce((ids, id) => !id || ids.includes(id) ? ids : [id, ...ids], []);

    // if user not found, fetch the info and put into users list.
    const fetchedUsers = await Promise.all(missingUserIds.map(async (pk) => {
      const { id, email, username, first_name, last_name, avatar, initials } = await this.dm.apiCall("user", {
        pk,
      });

      return { id, email, username, first_name, last_name, avatar, initials };
    }));

    if (fetchedUsers.length) {
      this.lsf.store.mergeUsers(fetchedUsers);
    }

    return res;  
  }
}

