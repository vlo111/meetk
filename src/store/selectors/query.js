import { createSelector } from 'reselect';

export const getQuery = (state) => state.graphs.query;

export const graphQueryLIst = createSelector(
  getQuery,
  (items) => items.queryList,
);
