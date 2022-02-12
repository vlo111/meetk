import {
  GET_PROFILE,
} from '../actions/profile';

const initialState = {
  profile: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_PROFILE.SUCCESS: {
      const { user } = action.payload.data;
      return {
        ...state,
        profile: user,
      };
    }
    default: {
      return state;
    }
  }
}
