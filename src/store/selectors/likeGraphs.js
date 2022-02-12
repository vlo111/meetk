import { createSelector } from 'reselect';

export const getLikeGraph = (state) => state.likeGraphs;

export const getLikeGraphsList = createSelector(
  getLikeGraph,
  (items) => items.likeGraphsList,
);
