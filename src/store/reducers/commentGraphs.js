import {
  CREATE_COMMENT_GRAPH,
  GET_GRAPH_COMMENTS,
  SET_COMMENT_PARENT,
  DELETE_GRAPH_COMMENT,
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
      if (!graphComments.parentId) {
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
    case DELETE_GRAPH_COMMENT.SUCCESS: {
      const {
        id,
      } = action.payload.data;

      return {
        ...state,
        graphComments: state.graphComments.filter(
          (comment) => {
            comment.children = comment.children?.filter((reply) => +reply.id !== +id);
            return +comment.id !== +id;
          },
        ),
        graphCommentParent: {},
      };
    }
    default: {
      return state;
    }
  }
}
