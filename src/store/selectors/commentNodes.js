import { createSelector } from 'reselect';

export const getCommentNode = (state) => state.commentNodes;

export const getNodeComments = createSelector(
  getCommentNode,
  (items) => items.nodeComments,
);

export const getNodeCommentParent = createSelector(
  getCommentNode,
  (items) => items.nodeCommentParent,
);

export const getNodeCommentsCount = createSelector(
  getCommentNode,
  (items) => {
    let { length } = items.nodeComments;
    items.nodeComments.forEach((comment) => {
      length += comment.children?.length;
    });
    return length;
  },
);
export const getCommentCount = createSelector(
  getCommentNode,
  (items) => items.commentsCount,
);
