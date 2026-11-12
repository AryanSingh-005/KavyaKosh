import client from './client';

export const fetchNotifications = async () => {
  const response = await client.get('/notifications');
  return response.data;
};

export const fetchUnreadCount = async () => {
  const response = await client.get('/notifications/unread-count');
  return response.data.unreadCount || 0;
};

export const markNotificationAsRead = async (id) => {
  const response = await client.put(`/notifications/${id}/read`, {});
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await client.put('/notifications/read-all', {});
  return response.data;
};
