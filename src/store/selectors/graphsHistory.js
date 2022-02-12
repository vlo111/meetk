import { createSelector } from 'reselect';

export const getGraphsHistory = (state) => state.graphsHistory;

export const getSingleNodeHistory = createSelector(
  getGraphsHistory,
  (items) => items.singleNodeHistory,
);
export const getSingleNodeHistoryList = createSelector(
  getGraphsHistory,
  (items) => items.singleNodeListHistory,
);

export const getSingleNodePositionCount = createSelector(
  getGraphsHistory,
  (items) => items.nodePositionCount,
);

export const getSingleNodeTabsViewCount = createSelector(
  getGraphsHistory,
  (items) => items.nodeTabsViewCount,
);

export const getSingleGraphHistory = createSelector(
  getGraphsHistory,
  (items) => items.singleGraphHistory,
);
