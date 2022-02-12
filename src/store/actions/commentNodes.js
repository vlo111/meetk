import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CREATE_COMMENT_NODE = define('CREATE_COMMENT_NODE');

export function createNodeCommentRequest(requestData) {
  return CREATE_COMMENT_NODE.request(() => Api.createCommentNode(requestData));
}

export const GET_NODE_COMMENTS = define('GET_NODE_COMMENTS');

export function getNodeCommentsRequest(requestData) {
  return GET_NODE_COMMENTS.request(() => Api.nodeComments(requestData));
}

export const SET_COMMENT_PARENT = define('SET_COMMENT_PARENT');

export function setNodeCommentParent(parent) {
  return {
    type: SET_COMMENT_PARENT,
    payload: parent,
  };
}

export const DELETE_NODE_COMMENT = define('DELETE_NODE_COMMENT');

export function deleteNodeComment(id, graphId) {
  return DELETE_NODE_COMMENT.request(() => Api.deleteNodeComment(id, graphId));
}

export const COMMENT_COUNT = define('COMMENT_COUNT');

export function getActionsCountRequest(id, nodeId) {
  return COMMENT_COUNT.request(() => Api.getActionsNodeCount(id, nodeId));
}
