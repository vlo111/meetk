import {
  GET_DOCUMENTS_BY_TAG, GET_DOCUMENTS,
} from '../actions/document';

const initialState = {
  pictureSearch: [],
  documentSearch: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_DOCUMENTS_BY_TAG.REQUEST:
    case GET_DOCUMENTS_BY_TAG.FAIL: {
      return {
        ...state,
        documentSearch: [],
      };
    }
    case GET_DOCUMENTS_BY_TAG.SUCCESS: {
      const { documents } = action.payload.data;
      return {
        ...state,
        documentSearch: documents,
      };
    }
    case GET_DOCUMENTS.REQUEST:
    case GET_DOCUMENTS.FAIL: {
      return {
        ...state,
        documentSearch: [],
      };
    }
    case GET_DOCUMENTS.SUCCESS: {
      const { documents } = action.payload.data;
      return {
        ...state,
        documentSearch: documents,
      };
    }
    default: {
      return state;
    }
  }
}
