import {
  CREATE_SHARE_GRAPH,
  DELETE_SHARE_GRAPH,
  LIST_SHARE_GRAPH,
  USER_SHARE_GRAPH,
  UPDATE_SHARE_GRAPH_STATUS,
  GRAPH_SHARED_USERS,
  SEARCH_GRAPH_LIST,
} from '../actions/shareGraphs';

const initialState = {
  shareGraphsList: [],
  userGraphs: [],
  page: 0,
  total: 0,
  totalPages: 0,
  graphUsers: {},
  shareGraphsListStatus: '',
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LIST_SHARE_GRAPH.REQUEST:
    case SEARCH_GRAPH_LIST.REQUEST:
    {
      return {
        ...state,
        shareGraphsList: [],
        page: 0,
        total: 0,
        totalPages: 0,
        shareGraphsListStatus: 'request',
      };
    }
    case LIST_SHARE_GRAPH.SUCCESS:
    case CREATE_SHARE_GRAPH.SUCCESS:
    case DELETE_SHARE_GRAPH.SUCCESS:
    case UPDATE_SHARE_GRAPH_STATUS.SUCCESS:
    case SEARCH_GRAPH_LIST.SUCCESS:
    {
      const {
        shareGraphs: shareGraphsList, page, total, totalPages,
      } = action.payload.data;
      return {
        ...state,
        shareGraphsList,
        shareGraphsListStatus: 'success',
        totalPages,
        total,
        page,
      };
    }
    case USER_SHARE_GRAPH.SUCCESS:
    {
      const {
        userGraphs,
      } = action.payload.data;
      return {
        ...state, userGraphs,
      };
    }
    case GRAPH_SHARED_USERS.SUCCESS:
    {
      return {
        ...state,
        graphUsers: {
          ...state.graphUsers,
          ...action.payload.data.result,
        },
      };
    }
    default: {
      return state;
    }
  }
}
