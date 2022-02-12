import { define } from '../../helpers/redux-request';
import Api from '../../Api';
import ChartUtils from '../../helpers/ChartUtils';

export const CREATE_LINKS = define('CREATE_LINKS');

export function createLinksRequest(graphId, link) {
  return CREATE_LINKS.request(() => Api.createLinks(graphId, ChartUtils.objectAndProto(link)));
}

export const UPDATE_LINKS = define('UPDATE_LINKS');

export function updateLinksRequest(graphId, node) {
  return UPDATE_LINKS.request(() => Api.updateLinks(graphId, ChartUtils.objectAndProto(node)));
}

export const DELETE_LINKS = define('DELETE_LINKS');

export function deleteLinksRequest(graphId, links) {
  return DELETE_LINKS.request(() => Api.deleteLinks(graphId, links));
}
