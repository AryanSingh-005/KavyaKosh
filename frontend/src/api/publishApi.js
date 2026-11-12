import client from './client';

export const createPoem = async (data) => {
  const res = await client.post('/publish', data);
  return res.data;
};

export const updatePoem = async (id, data) => {
  const res = await client.put(`/publish/${id}`, data);
  return res.data;
};

export const getPoemDetail = async (id) => {
  const res = await client.get(`/publish/${id}`);
  return res.data;
};

export const deletePoem = async (id) => {
  const res = await client.delete(`/publish/${id}`);
  return res.data;
};

export const toggleLike = async (id) => {
  const res = await client.post(`/publish/${id}/like`, {});
  return res.data;
};

export const toggleSave = async (id) => {
  const res = await client.post(`/publish/${id}/save`, {});
  return res.data;
};

export const addComment = async (id, content) => {
  const res = await client.post(`/publish/${id}/comments`, { content });
  return res.data;
};

export const getComments = async (id) => {
  const res = await client.get(`/publish/${id}/comments`);
  return res.data;
};

export const requestReview = async (data) => {
  const res = await client.post('/publish/request-review', data);
  return res.data;
};

export const getMyPoems = async () => {
  const res = await client.get('/publish/my-poems');
  return res.data;
};

export const getMyReviewRequests = async () => {
  const res = await client.get('/publish/my-reviews');
  return res.data;
};
