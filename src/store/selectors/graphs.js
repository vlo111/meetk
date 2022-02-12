import { createSelector } from 'reselect';

export const getGraph = (state) => state.graphs;

export const getSingleGraph = createSelector(
  getGraph,
  (items) => items.singleGraph,
);

export const getActionsCount = createSelector(
  getGraph,
  (items) => items.actionsCount,
);

export const getList = createSelector(
  getGraph,
  (items) => items.graphsList,
);

export const getListInfo = createSelector(
  getGraph,
  (items) => items.graphsListInfo,
);

export const getSingleGraphOwner = createSelector(
  getGraph,
  (items) => items.singleGraph.userId,
);
export const getMouseMoveTracker = createSelector(
  getGraph,
  (items) => items.mouseMoveTracker,
);
export const getGraphsCount = createSelector(
  getGraph,
  (items) => items.allGraghsCount,
);
export const currentUserRole = createSelector(
  getGraph,
  (items) => items.singleGraph.currentUserRole,
);
export const getLinksPartial = createSelector(
  getGraph,
  (items) => items.singleGraph.linksPartial,
);
export const getNodesPartial = createSelector(
  getGraph,
  (items) => items.singleGraph.nodesPartial,
);
export const getPublicState = createSelector(
  getGraph,
  (items) => items.singleGraph.publicState,
);
export const getGraphInfo = createSelector(
  getGraph,
  (items) => items.graphInfo,
);
export const getTotalNodes = createSelector(
  getGraph,
  (items) => items.graphInfo.totalNodes,
);
export const getSingleGraphStatus = createSelector(
  getGraph,
  (items) => items.singleGraphStatus,
);

export const currentUserRolePermission = createSelector(
  getGraph,
  (items) => items.singleGraph.currentUserRole && ['admin', 'edit', 'edit_inside'].includes(items.singleGraph.currentUserRole),
);

export const getCustomField = createSelector(
  getGraph,
  (items) => items.nodeCustomFields,
);
