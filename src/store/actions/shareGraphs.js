import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CREATE_SHARE_GRAPH = define('CREATE_SHARE_GRAPH');

export function createGraphRequest(requestData) {
  return CREATE_SHARE_GRAPH.request(() => Api.createShareGraph(requestData));
}

export const UPDATE_SHARE_GRAPH = define('UPDATE_SHARE_GRAPH');

export function updateGraphRequest(id, requestData) {
  return UPDATE_SHARE_GRAPH.request(() => Api.updateShareGraph(id, requestData));
}

export const DELETE_SHARE_GRAPH = define('DELETE_SHARE_GRAPH');

export function deleteGraphRequest(id, requestData) {
  return DELETE_SHARE_GRAPH.request(() => Api.deleteShareGraph(id, requestData));
}

export const LIST_SHARE_GRAPH = define('LIST_SHARE_GRAPH');

export function listGraphRequest(requestData) {
  return LIST_SHARE_GRAPH.request(() => Api.listShareGraph(requestData));
}

export const USER_SHARE_GRAPH = define('USER_SHARE_GRAPH');

export function userGraphRequest(requestData) {
  return USER_SHARE_GRAPH.request(() => Api.userGraph(requestData));
}

export const UPDATE_SHARE_GRAPH_STATUS = define('UPDATE_SHARE_GRAPH_STATUS');

export function updateShareGraphStatusRequest(requestData) {
  return UPDATE_SHARE_GRAPH_STATUS.request(() => Api.updateShareGraphStatus(requestData));
}

export const GRAPH_SHARED_USERS = define('GRAPH_SHARED_USERS');

export function graphUsersRequest(requestData) {
  return GRAPH_SHARED_USERS.request(() => Api.graphUsers(requestData));
}

export const SEARCH_GRAPH_LIST = define('SEARCH_GRAPH_LIST');

export function searchGraphsListRequest(page = 1, requestData = {}) {
  return SEARCH_GRAPH_LIST.request(() => Api.searchGraphsList(page, requestData)).takeLatest();
}
