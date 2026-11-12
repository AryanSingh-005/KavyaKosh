import client from './client';

export const getTierDefinitions = async () => {
  const res = await client.get('/premium/tiers');
  return res.data;
};

export const getMySubscription = async () => {
  const res = await client.get('/premium/status');
  return res.data;
};

export const subscribeToPlan = async (tier, paymentMethodId) => {
  const res = await client.post('/premium/subscribe', { tier, paymentMethodId });
  return res.data;
};

export const cancelSubscription = async () => {
  const res = await client.post('/premium/cancel', {});
  return res.data;
};
