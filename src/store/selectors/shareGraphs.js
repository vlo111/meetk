import { createSelector } from 'reselect';

export const getShareGraph = (state) => state.shareGraphs;

export const shareGraphs = createSelector(
  getShareGraph,
  (items) => items.shareGraphsList,
);

export const userGraphs = createSelector(
  getShareGraph,
  (items) => items.userGraphs || [],
);

export const getGraphUsers = createSelector(
  getShareGraph,
  (items) => items.graphUsers,
);
