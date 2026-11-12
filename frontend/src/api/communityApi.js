import client from './client';

export const toggleFollow = async (username) => {
  const res = await client.post(`/community/follow/${username}`);
  return res.data;
};

export const getUserProfile = async (username) => {
  const res = await client.get(`/community/profile/${username}`);
  return res.data;
};

export const createDiscussion = async (data) => {
  const res = await client.post('/community/discussions', data);
  return res.data;
};

export const getDiscussions = async (category = 'ALL') => {
  const res = await client.get('/community/discussions', {
    params: { category },
  });
  return res.data;
};

export const getDiscussionDetail = async (id) => {
  const res = await client.get(`/community/discussions/${id}`);
  return res.data;
};

export const addDiscussionReply = async (id, content) => {
  const res = await client.post(`/community/discussions/${id}/replies`, { content });
  return res.data;
};

export const getDiscussionReplies = async (id) => {
  const res = await client.get(`/community/discussions/${id}/replies`);
  return res.data;
};
