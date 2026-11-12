import client from './client';

export const getReviewQueue = async (status = 'ALL') => {
  const res = await client.get('/reviews/queue', {
    params: { status },
  });
  return res.data;
};

export const getReviewDetail = async (id) => {
  const res = await client.get(`/reviews/${id}`);
  return res.data;
};

export const triggerAiFirstPass = async (id) => {
  const res = await client.post(`/reviews/${id}/ai-analyze`, {});
  return res.data;
};

export const submitHumanReview = async (id, data) => {
  const res = await client.post(`/reviews/${id}/submit`, data);
  return res.data;
};
