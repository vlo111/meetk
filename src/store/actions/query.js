import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CREATE_GRAPH_QUERY = define('CREATE_GRAPH_QUERY');

export function createGraphQueryRequest(requestData) {
  return CREATE_GRAPH_QUERY.request(() => Api.createGraphQuery(requestData));
}

export const GET_GRAPH_QUERY = define('GET_GRAPH_QUERY');

export function getGraphQueryRequest(graphId) {
  return GET_GRAPH_QUERY.request(() => Api.getGraphQuery(graphId));
}
export const GET_GRAPH_QUERY_DATA = define('GET_GRAPH_QUERY_DATA');

export function getGraphQueryDataRequest(id, graphId) {
  return GET_GRAPH_QUERY_DATA.request(() => Api.getGraphQueryData(id, graphId));
}
export const DELETE_GRAPH_QUERY = define('DELETE_GRAPH_QUERY');

export function deleteGraphQueryRequest(id) {
  return DELETE_GRAPH_QUERY.request(() => Api.deleteGraphQuery(id));
}

export const UPDATE_GRAPH_QUERY = define('UPDATE_GRAPH_QUERY');

export function updateGraphQueryRequest(id, title, description) {
  return UPDATE_GRAPH_QUERY.request(() => Api.updateGraphQuery(id, title, description));
}
