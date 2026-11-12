import client from './client';

export const getCompetitions = async () => {
  const res = await client.get('/competitions');
  return res.data;
};

export const getCompetitionDetail = async (id) => {
  const res = await client.get(`/competitions/${id}`);
  return res.data;
};

export const submitCompetitionEntry = async (data) => {
  const res = await client.post('/competitions/submit', data);
  return res.data;
};

export const voteOnSubmission = async (submissionId) => {
  const res = await client.post(`/competitions/submissions/${submissionId}/vote`, {});
  return res.data;
};
