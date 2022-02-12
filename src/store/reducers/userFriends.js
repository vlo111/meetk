import {
  MY_FRIENDS, ADD_FRIEND, ACCEPT_FRIEND, REMOVE_FRIEND, GET_FRIENDS, ADD_MYFRIENDS,
} from '../actions/userFriends';

const initialState = {
  myFriends: [],
  friendsList: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case MY_FRIENDS.REQUEST:
    case ADD_FRIEND.REQUEST:
    case ACCEPT_FRIEND.REQUEST:
    case REMOVE_FRIEND.REQUEST:
    {
      return {
        ...state,
        myFriends: [],
      };
    }
    case MY_FRIENDS.SUCCESS:
    case ADD_FRIEND.SUCCESS:
    case ACCEPT_FRIEND.SUCCESS:
    case REMOVE_FRIEND.SUCCESS:
    {
      return {
        ...state, myFriends: action.payload.data.data,
      };
    }
    case ADD_MYFRIENDS:
    {
      return {
        ...state, myFriends: action.payload,
      };
    }
    case GET_FRIENDS.SUCCESS:
    {
      const {
        friendsList,
      } = action.payload.data;
      return {
        ...state,
        friendsList,
      };
    }
    default: {
      return state;
    }
  }
}
