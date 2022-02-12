import { createSelector } from 'reselect';

export const getNotifications = (state) => state.notifications;

export const notificationsList = createSelector(
  getNotifications,
  (items) => items.notifications,
);
