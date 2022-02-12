import { define } from '../../helpers/redux-request';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';

export const CREATE_NODES = define('CREATE_NODES');

export function createNodesRequest(graphId, nodes) {
  return CREATE_NODES.request(() => Api.createNodes(graphId, ChartUtils.objectAndProto(nodes)));
}

export const UPDATE_NODES = define('UPDATE_NODES');

export function updateNodesRequest(graphId, nodes) {
  return UPDATE_NODES.request(() => Api.updateNodes(graphId, ChartUtils.objectAndProto(nodes)));
}

export const DELETE_NODES = define('DELETE_NODES');

export function deleteNodesRequest(graphId, nodes) {
  return DELETE_NODES.request(() => Api.deleteNodes(graphId, nodes));
}

export const UPDATE_NODES_POSITION = define('UPDATE_NODES_POSITION');

export function updateNodesPositionRequest(graphId, nodes) {
  return UPDATE_NODES_POSITION.request(() => Api.updateNodePositions(graphId, nodes));
}

export const UPDATE_NODES_CUSTOM_FIELDS = define('UPDATE_NODES_CUSTOM_FIELDS');

export function updateNodesCustomFieldsRequest(graphId, nodes) {
  return UPDATE_NODES_CUSTOM_FIELDS.request(() => Api.updateNodeCustomFields(graphId, nodes), { graphId, nodes });
}

export const NODE_HISTORY = define('NODE_HISTORY');

export function getNodeHistoryRequest(graphId, nodeId) {
  return NODE_HISTORY.request(() => Api.getNodeHistory(graphId, nodeId));
}
