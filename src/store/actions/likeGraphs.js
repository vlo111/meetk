import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const GET_LIKE_OR_DISLIKE = define('GET_LIKE_OR_DISLIKE');

export function getLikeOrDislikeRequest(graphId, liked) {
  return GET_LIKE_OR_DISLIKE.request(() => Api.getLikeOrDislike(graphId, liked));
}

export const GET_LIKE_GRAPHS_LIST = define('GET_LIKE_GRAPHS_LIST');

export function getLikeGraphsListRequest(graphId) {
  return GET_LIKE_GRAPHS_LIST.request(() => Api.getLikeGraphsList(graphId));
}
