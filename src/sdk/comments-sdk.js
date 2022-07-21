
export class CommentsSdk {
  constructor(lsf, dm) {
    this.lsf = lsf;
    this.dm = dm;
    this.bindEventHandlers();
  }

  bindEventHandlers() {
    this.lsf.on("comments:create", this.createComment);
    this.lsf.on("comments:update", this.updateComment);
    this.lsf.on("comments:list", this.listComments);
  }

  createComment = async (comment) => {
    console.log({ createComment: comment });

    const { $meta: _, ...newComment } = await this.dm.apiCall("createComment", undefined, {
      body: {
        annotation: comment.annotation,
        is_resolved: comment.is_resolved,
        text: comment.text,
      },
    });

    return newComment;
  }

  // @todo enable with ability to update comments for resolve/unresolve
  updateComment = async (comment) => {
    console.log({ updateComment: comment });

    // const res = await this.dm.apiCall("updateComment", {

    // });
  }

  listComments = async (params) => {
    const res = await this.dm.apiCall("comments", {
      annotation: params.annotation,
    });

    return res;  
  }
}

