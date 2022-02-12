import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const CONVERT_GRAPH = define('CONVERT_GRAPH');

export function convertGraphRequest(type, requestData) {
  return CONVERT_GRAPH.request(() => Api.convertToGraph(type, requestData));
}

export const CONVERT_NODE_GRAPH = define('CONVERT_NODE_GRAPH');

export function convertNodeRequest(type, requestData) {
  return CONVERT_NODE_GRAPH.request(() => Api.convertToNode(type, requestData));
}

export const CREATE_GRAPH = define('CREATE_GRAPH');

export function createGraphRequest(requestData) {
  return CREATE_GRAPH.request(() => Api.createGraph(requestData));
}

export const UPDATE_GRAPH = define('UPDATE_GRAPH');

export function updateGraphRequest(id, requestData) {
  return UPDATE_GRAPH.request(() => Api.updateGraph(id, requestData));
}

export const UPDATE_GRAPH_DATA = define('UPDATE_GRAPH_DATA');

export function updateGraphDataRequest(id, requestData) {
  return UPDATE_GRAPH_DATA.request(() => Api.updateGraphData(id, requestData));
}

export const DELETE_GRAPH = define('DELETE_GRAPH');

export function deleteGraphRequest(id) {
  return DELETE_GRAPH.request(() => Api.deleteGraph(id));
}

export const UPDATE_GRAPH_THUMBNAIL = define('UPDATE_GRAPH_THUMBNAIL');

export function updateGraphThumbnailRequest(id, svg, size, byUser = false) {
  return UPDATE_GRAPH_THUMBNAIL.request(() => Api.updateGraphThumbnail(id, svg, size, byUser));
}

export const GET_GRAPHS_LIST = define('GET_GRAPHS_LIST');

export function getGraphsListRequest(page = 1, requestData = {}) {
  return GET_GRAPHS_LIST.request(() => Api.getGraphsList(page, requestData)).takeLatest();
}

export const GET_GRAPHS_SHAREGRAPHS_COUNT = define('GET_GRAPHS_SHAREGRAPHS_COUNT');

export function getGraphsAndSharegraphsCount(id) {
  return GET_GRAPHS_SHAREGRAPHS_COUNT.request(() => Api.getCountGraphs(id)).takeLatest();
}

export const GET_NODES_LIST = define('GET_NODES_LIST');

export function getGraphNodesRequest(page = 1, requestData = {}) {
  return GET_NODES_LIST.request(() => Api.getGraphNodes(page, requestData)).takeLatest();
}
export const GET_NODES_LIST_DATA = define('GET_NODES_LIST_DATA');

export function getGraphNodesDataRequest(requestData = {}) {
  return GET_NODES_LIST_DATA.request(() => Api.getGraphNodesData(requestData)).takeLatest();
}

export const GET_SINGLE_GRAPH = define('GET_SINGLE_GRAPH');

export function getSingleGraphRequest(graphId, params) {
  return GET_SINGLE_GRAPH.request(() => Api.getSingleGraph(graphId, params));
}

export const GET_ALL_TABS = define('GET_ALL_TABS');

export function getAllTabsRequest(graphId) {
  return GET_ALL_TABS.request(() => Api.getAllTabs(graphId));
}

export const GET_GRAPH_INFO = define('GET_GRAPH_INFO');

export function getGraphInfoRequest(graphId, params) {
  return GET_GRAPH_INFO.request(() => Api.getGraphInfo(graphId, params));
}

export const GET_SINGLE_GRAPH_PREVIEW = define('GET_SINGLE_GRAPH_PREVIEW');

export function getSingleGraphPreviewRequest(graphId, userId, token) {
  return GET_SINGLE_GRAPH_PREVIEW.request(() => Api.getSingleGraphWithAccessToken(graphId, userId, token));
}

export const GET_SINGLE_EMBED_GRAPH = define('GET_SINGLE_EMBED_GRAPH');

export function getSingleEmbedGraphRequest(graphId, token) {
  return GET_SINGLE_EMBED_GRAPH.request(() => Api.getSingleEmbedGraph(graphId, token));
}

export const CLEAR_SINGLE_GRAPH = 'CLEAR_SINGLE_GRAPH';

export function clearSingleGraph() {
  return {
    type: CLEAR_SINGLE_GRAPH,
    payload: {},
  };
}

export const UPDATE_SINGLE_GRAPH = 'UPDATE_SINGLE_GRAPH';

export function updateSingleGraph(graph, merge = false) {
  return {
    type: UPDATE_SINGLE_GRAPH,
    payload: {
      graph, merge,
    },
  };
}

export const SET_GRAPH_CUSTOM_FIELDS = 'SET_GRAPH_CUSTOM_FIELDS';

export function setGraphCustomFields(customFields) {
  return {
    type: SET_GRAPH_CUSTOM_FIELDS,
    payload: {
      customFields,
    },
  };
}

export const SET_NODE_CUSTOM_FIELD = 'SET_NODE_CUSTOM_FIELD';

export function setNodeCustomField(type, nodeId, customField, tabData, append = false) {
  return {
    type: SET_NODE_CUSTOM_FIELD,
    payload: {
      type, nodeId, customField, tabData, append,
    },
  };
}

export const GET_NODE_CUSTOM_FIELDS = define('GET_NODE_CUSTOM_FIELDS');

export function getNodeCustomFieldsRequest(graphId, nodeId, params) {
  return GET_NODE_CUSTOM_FIELDS.request(() => Api.getNodeCustomFields(graphId, nodeId, params));
}

export const ADD_NODE_CUSTOM_FIELD_KEY = 'ADD_NODE_CUSTOM_FIELD_KEY';

export function addNodeCustomFieldKey(type, key, subtitle) {
  return {
    type: ADD_NODE_CUSTOM_FIELD_KEY,
    payload: { type, key, subtitle },
  };
}

export const RENAME_NODE_CUSTOM_FIELD_KEY = 'RENAME_NODE_CUSTOM_FIELD_KEY';

export function renameNodeCustomFieldKey(type, oldName, name) {
  return {
    type: RENAME_NODE_CUSTOM_FIELD_KEY,
    payload: { type, oldName, name },
  };
}

export const REMOVE_NODE_CUSTOM_FIELD_KEY = 'REMOVE_NODE_CUSTOM_FIELD_KEY';

export function removeNodeCustomFieldKey(type, key, nodeId) {
  return {
    type: REMOVE_NODE_CUSTOM_FIELD_KEY,
    payload: { type, key, nodeId },
  };
}

export const REMOVE_NODE_FROM_CUSTOM_FIELD = 'REMOVE_NODE_FROM_CUSTOM_FIELD';

export function removeNodeFromCustom(nodeId) {
  return {
    type: REMOVE_NODE_FROM_CUSTOM_FIELD,
    payload: { nodeId },
  };
}

export const ACTIONS_COUNT = define('ACTIONS_COUNT');

export function getActionsCountRequest(id) {
  return ACTIONS_COUNT.request(() => Api.getActionsCount(id));
}

export const SET_ACTIVE_TAB = 'SET_ACTIVE_TAB';

export function setActiveTab(tabName) {
  return {
    type: SET_ACTIVE_TAB,
    payload: {
      tabName,
    },
  };
}

const UPDATE_GRAPH_POSITIONS = define('UPDATE_GRAPH_POSITIONS');

export function updateGraphPositionsRequest(graphId, nodes, labels) {
  return UPDATE_GRAPH_POSITIONS.request(() => Api.updateGraphPositions(graphId, nodes, labels));
}

export const ACTIVE_MOUSE_TRACKER = 'ACTIVE_MOUSE_TRACKER';

export function setActiveMouseTracker(tracker, userId) {
  return {
    type: ACTIVE_MOUSE_TRACKER,
    payload: {
      tracker, userId,
    },
  };
}

export const GET_SINGLE_GRAPH_QUERY = define('GET_SINGLE_GRAPH_QUERY');

export function getSingleGrapQueryhRequest(graphId, queryId) {
  return GET_SINGLE_GRAPH_QUERY.request(() => Api.getSingleGraphQuery(graphId, queryId));
}
