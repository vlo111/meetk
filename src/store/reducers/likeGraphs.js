import {
  GET_LIKE_GRAPHS_LIST,
  GET_LIKE_OR_DISLIKE,
} from '../actions/likeGraphs';

const initialState = {
  likeGraphsList: [],
  likeGraphsListStatus: '',
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_LIKE_GRAPHS_LIST.REQUEST:
      {
        return {
          ...state,
          likeGraphsList: [],
          likeGraphsListStatus: 'request',
        };
      }
    case GET_LIKE_GRAPHS_LIST.SUCCESS:
      {
        const {
          likeGraphs: likeGraphsList,
        } = action.payload.data;
        return {
          ...state,
          likeGraphsList,
          likeGraphsListStatus: 'success',
        };
      }
    default: {
      return state;
    }
  }
}
