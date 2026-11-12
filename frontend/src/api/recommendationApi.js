import client from './client';

export const fetchPersonalizedRecommendations = async () => {
  const response = await client.get('/recommendations');
  return response.data;
};
