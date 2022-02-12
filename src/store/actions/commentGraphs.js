import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CREATE_COMMENT_GRAPH = define('CREATE_COMMENT_GRAPH');

export function createGraphCommentRequest(requestData) {
  return CREATE_COMMENT_GRAPH.request(() => Api.createCommentGraph(requestData));
}

export const GET_GRAPH_COMMENTS = define('GET_GRAPH_COMMENTS');

export function getGraphCommentsRequest(requestData) {
  return GET_GRAPH_COMMENTS.request(() => Api.graphComments(requestData));
}

export const SET_COMMENT_PARENT = define('SET_COMMENT_PARENT');

export function setGraphCommentParent(parent) {
  return {
    type: SET_COMMENT_PARENT,
    payload: parent,
  };
}

export const DELETE_GRAPH_COMMENT = define('DELETE_GRAPH_COMMENT');

export function deleteGraphComment(id, graphId) {
  return DELETE_GRAPH_COMMENT.request(() => Api.deleteGraphComment(id, graphId));
}
