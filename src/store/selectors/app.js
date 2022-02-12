import { createSelector } from 'reselect';

export const getApp = (state) => state.app;

export const getOnlineUsers = createSelector(
  getApp,
  (items) => items.onlineUsers,
);
export const getMouseTracker = createSelector(
  getApp,
  (items) => items.mouseTracker,
);
export const getActiveButton = createSelector(
  getApp,
  (items) => items.activeButton,
);
