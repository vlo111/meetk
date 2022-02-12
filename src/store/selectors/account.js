import { createSelector } from 'reselect';

export const getAccount = (state) => state.account;

export const getId = createSelector(
  getAccount,
  (items) => items.myAccount.id,
);

export const getUserSearch = createSelector(
  getAccount,
  (items) => items.userSearch,
);
