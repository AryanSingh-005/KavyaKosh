import client from './client';

export const fetchUserProfile = async (username) => {
  const response = await client.get(`/profile/${encodeURIComponent(username)}`);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await client.put('/profile/update', profileData);
  return response.data;
};
