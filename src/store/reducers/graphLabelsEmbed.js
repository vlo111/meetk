import {
  CREATE_COMMENT_GRAPH,
  GET_GRAPH_COMMENTS,
  SET_COMMENT_PARENT,
} from '../actions/commentGraphs';

const initialState = {
  graphComments: [],
  graphCommentParent: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_COMMENT_GRAPH.SUCCESS: {
      const {
        graphComments,
      } = action.payload.data;
      const comments = [...state.graphComments];

      if (graphComments.parentId) {
        const parent = comments.findIndex((comment) => comment.id === graphComments.parentId);

        const { children } = comments[parent];
        if (children) {
          children.push(graphComments);
        } else {
          comments[parent].children = [graphComments];
        }
      } else {
        comments.push(graphComments);
      }

      return {
        ...state,
        graphComments: comments,
      };
    }
    case SET_COMMENT_PARENT: {
      return {
        ...state,
        graphCommentParent: action.payload,
      };
    }
    case GET_GRAPH_COMMENTS.SUCCESS: {
      const {
        graphComments,
      } = action.payload.data;

      return {
        ...state, graphComments,
      };
    }
    default: {
      return state;
    }
  }
}
