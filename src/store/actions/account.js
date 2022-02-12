import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const SIGN_IN = define('SIGN_IN');

export function signInRequest(email, password) {
  return SIGN_IN.request(() => Api.singIn(email, password));
}

export const SIGN_UP = define('SIGN_UP');

export function signUpRequest(requestData) {
  return SIGN_UP.request(() => Api.singUp(requestData));
}

export const GET_MY_ACCOUNT = define('GET_MY_ACCOUNT');

export function getMyAccountRequest() {
  return GET_MY_ACCOUNT.request(() => Api.getMyAccount());
}

export const UPDATE_MY_ACCOUNT = define('UPDATE_MY_ACCOUNT');

export function updateMyAccountRequest(data) {
  return UPDATE_MY_ACCOUNT.request(() => Api.updateMyAccount(data));
}

export const UPDATE_MY_ACCOUNT_PASSWORD = define('UPDATE_MY_ACCOUNT_PASSWORD');

export function updateMyAccountPasswordRequest(data) {
  return UPDATE_MY_ACCOUNT_PASSWORD.request(() => Api.updateMyAccountPassword(data));
}

export const FORGOT_PASSWORD = define('FORGOT_PASSWORD');

export function forgotPasswordRequest(email, callback) {
  return FORGOT_PASSWORD.request(() => Api.forgotPassword(email, callback));
}

export const RESET_PASSWORD = define('RESET_PASSWORD');

export function resetPasswordRequest(token, password) {
  return RESET_PASSWORD.request(() => Api.resetPassword(token, password));
}

export const OAUTH = define('OAUTH');

export function oAuthRequest(type, params) {
  return OAUTH.request(() => Api.oAuth(type, params));
}

export const GET_USER_BY_TEXT = define('GET_USER_BY_TEXT');

export function getUsersByTextRequest(text) {
  return GET_USER_BY_TEXT.request(() => Api.getUsersByText(text), {}, true);
}
