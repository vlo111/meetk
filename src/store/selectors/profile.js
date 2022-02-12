import { createSelector } from 'reselect';

export const getProfileData = (state) => state.profile;

export const getProfile = createSelector(
  getProfileData,
  (items) => items.profile,
);
