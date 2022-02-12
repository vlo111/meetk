import {
  LIST_NOTIFICATIONS,
  ADD_NOTIFICATIONS, NOTIFICATIONS_UPDATE,
} from '../actions/notifications';

const initialState = {
  notifications: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LIST_NOTIFICATIONS.REQUEST:
    case NOTIFICATIONS_UPDATE.REQUEST:
    {
      return {
        ...state,
        notifications: [],
      };
    }
    case LIST_NOTIFICATIONS.SUCCESS:
    {
      return {
        ...state, notifications: action.payload.data,
      };
    }
    case ADD_NOTIFICATIONS: {
      return {
        notifications: [...state.notifications, action.payload],
      };
    }
    default: {
      return state;
    }
  }
}
