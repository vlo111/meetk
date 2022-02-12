import reducer, { initialState } from '../../store/reducers/account';
import { UserData } from '../helpers/data/user';

/**
 * Account reducer, redux store
 * reducer updates from preliminary data
 */
describe('redux reducers of account', () => {
  it('should be initial state sign in request', () => {
    const action = {
      type: 'SIGN_IN_REQUEST',
    };

    expect(reducer(initialState, action)).toEqual({
      ...initialState,
    });
  });

  it('sign in success', () => {
    const action = {
      type: 'SIGN_IN_SUCCESS',
      payload: {
        data: {
          token: 'test',
          user: {
            id: 'test',
          },
        },
      },
    };

    expect(reducer(initialState, action)).toEqual({
      ...initialState,
      token: 'test',
      myAccount: { id: 'test' },
    });
  });

  it('OAuth success', () => {
    const action = {
      type: 'OAUTH_SUCCESS',
      payload: {
        data: {
          token: 'test',
          user: {
            id: 'test',
          },
        },
      },
    };

    expect(reducer(initialState, action)).toEqual({
      ...initialState,
      token: 'test',
      myAccount: { id: 'test' },
    });
  });

  it('update account success', () => {
    const action = {
      type: 'UPDATE_MY_ACCOUNT_SUCCESS',
      payload: {
        data: {
          user: {
            id: 'test',
            firstName: 'f_test',
            email: UserData.email,
          },
        },
      },
    };

    expect(reducer(initialState, action)).toEqual({
      ...initialState,
      myAccount: { id: 'test', firstName: 'f_test', email: UserData.email },
    });
  });

  it('get account success', () => {
    const action = {
      type: 'GET_MY_ACCOUNT_SUCCESS',
      payload: {
        data: {
          user: {
            id: 'test',
            firstName: 'f_test',
            lastName: 'l_test',
            email: UserData.email,
          },
        },
      },
    };

    expect(reducer(initialState, action)).toEqual({
      ...initialState,
      myAccount: action.payload.data.user,
    });
  });

  it('get account fail', () => {
    const action = {
      type: 'GET_MY_ACCOUNT_FAIL',
      payload: {
        data: {
          status: '401',
        },
      },
    };

    expect(reducer(initialState, action)).toEqual(initialState);

    action.payload.data.status = '403';

    expect(reducer(initialState, action)).toEqual(initialState);
  });

  it('get user by text success', () => {
    const action = {
      type: 'GET_USER_BY_TEXT_SUCCESS',
      payload: {
        ...initialState,
        data: {
          data: {
            search: 'test',
          },
        },
        status: 'success',
      },
    };

    expect(reducer(initialState, action)).toEqual({
      ...initialState,
      userSearch: action.payload.data.data,
      status: 'success',
    });
  });
});
