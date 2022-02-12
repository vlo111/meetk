import { createSelector } from 'reselect';

export const getShare = (state) => state.share;

export const shareWithUsers = createSelector(
  getShare,
  (items) => items.shareWithUsers,
);

export const userGraphs = createSelector(
  getShare,
  (items) => items.shareWithUsers || [],
);

export const getGraphUsers = createSelector(
  getShare,
  (items) => items.shareWithUsers,
);

export const shareGraphListInfo = createSelector(
  getShare,
  (items) => items.shareGraphsListInfo,
);
