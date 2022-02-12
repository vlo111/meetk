import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const GET_PROFILE = define('GET_PROFILE');

export function getUserRequest(userId) {
  return GET_PROFILE.request(() => Api.getUser(userId));
}

export const SEARCH_USERS = define('SEARCH_USERS');

export function searchUsers(s, page = 1) {
  return SEARCH_USERS.request(() => Api.searchUsers(s, page));
}
