import { createSelector } from 'reselect';

export const getUserFriends = (state) => state.userFriends;

export const getUserFriendsList = createSelector(
  getUserFriends,
  (items) => items.friendsList,
);

export const friendsList = createSelector(
  getUserFriends,
  (items) => items.myFriends,
);
