import { GET_SHARE_GRAPH_LIST, GET_SHARED_WITH_USERS } from '../actions/share';

const initialState = {
  shareWithUsers: [],
  shareGraphsListStatus: '',
  shareGraphsList: [],
  shareGraphsListInfo: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_SHARED_WITH_USERS.REQUEST: {
      return {
        shareWithUsers: [],
        ...state,
      };
    }
    case GET_SHARED_WITH_USERS.SUCCESS: {
      const { users: shareWithUsers } = action.payload.data;
      return {
        ...state,
        shareWithUsers,
      };
    }
    case GET_SHARE_GRAPH_LIST.REQUEST: {
      return {
        ...state,
        shareGraphsListStatus: 'request',
        shareGraphsList: [],
        shareGraphsListInfo: {},
      };
    }
    case GET_SHARE_GRAPH_LIST.SUCCESS: {
      const { shareGraphs: shareGraphsList, ...shareGraphsListInfo } = action.payload.data;
      return {
        ...state,
        shareGraphsListStatus: 'success',
        shareGraphsList,
        shareGraphsListInfo,
      };
    }
    case GET_SHARE_GRAPH_LIST.FAIL: {
      return {
        ...state,
        shareGraphsListStatus: 'fail',
      };
    }
    default: {
      return state;
    }
  }
}
