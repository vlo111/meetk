import { define } from '../../helpers/redux-request';
import Api from '../../Api';

export const LIST_NOTIFICATIONS = define('LIST_NOTIFICATIONS');

export function listNotificationsRequest() {
  return LIST_NOTIFICATIONS.request(() => Api.listNotifications());
}

export const NOTIFICATIONS_UPDATE = define('NOTIFICATIONS_UPDATE');

export function NotificationsUpdateRequest() {
  return NOTIFICATIONS_UPDATE.request(() => Api.notificationsUpdate());
}

export const ADD_NOTIFICATIONS = define('ADD_NOTIFICATIONS');

export function addNotification(notification) {
  return {
    type: ADD_NOTIFICATIONS,
    payload: notification,
  };
}
