import {
  SIGN_IN, GET_MY_ACCOUNT, OAUTH, GET_USER_BY_TEXT, UPDATE_MY_ACCOUNT,
} from '../actions/account';
import Account from '../../helpers/Account';

export const initialState = {
  status: '',
  token: Account.getToken(),
  myAccount: Account.get(),
  user: {},
  findUser: {},
  userSearch: [],
};
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SIGN_IN.REQUEST: {
      Account.delete();
      return state;
    }
    case OAUTH.SUCCESS:
    case SIGN_IN.SUCCESS: {
      const { token, user: myAccount } = action.payload.data;
      Account.set(myAccount);
      Account.setToken(token);
      return {
        ...state,
        token,
        myAccount,
      };
    }
    case UPDATE_MY_ACCOUNT.SUCCESS:
    case GET_MY_ACCOUNT.SUCCESS: {
      const { user: myAccount } = action.payload.data;
      Account.set(myAccount);
      return {
        ...state,
        myAccount,
      };
    }
    case GET_MY_ACCOUNT.FAIL: {
      const { status } = action.payload;
      if (status === 401 || status === 403) {
        Account.delete();
        window.location.reload();
      }
      return state;
    }
    case GET_USER_BY_TEXT.REQUEST:
    case GET_USER_BY_TEXT.FAIL: {
      return {
        ...state,
        userSearch: [],
        status: 'request',
      };
    }
    case GET_USER_BY_TEXT.SUCCESS: {
      const { data } = action.payload.data;
      return {
        ...state,
        userSearch: data,
        status: 'success',
      };
    }
    default: {
      return state;
    }
  }
}
