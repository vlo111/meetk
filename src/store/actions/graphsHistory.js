import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const NODE_HISTORY = define('NODE_HISTORY');

export function getNodeHistoryRequest(graphId, nodeId) {
  return NODE_HISTORY.request(() => Api.getNodeHistory(graphId, nodeId));
}

export const GRAPH_HISTORY = define('GRAPH_HISTORY');

export function getGraphHistoryRequest(graphId) {
  return GRAPH_HISTORY.request(() => Api.getGraphHistory(graphId));
}

export const RESET_GRAPH_HISTORY = 'RESET_GRAPH_HISTORY';

export function resetGraphHistory() {
  return {
    type: RESET_GRAPH_HISTORY,
    payload: {},
  };
}
