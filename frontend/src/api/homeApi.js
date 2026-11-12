import client from './client';

export const fetchTrendingPoems = (limit = 8) =>
  client.get('/home/trending-poems', { params: { limit } }).then(r => r.data);

export const fetchFeaturedWriters = (limit = 6) =>
  client.get('/home/featured-writers', { params: { limit } }).then(r => r.data);

export const fetchActiveChallenges = () =>
  client.get('/home/active-challenges').then(r => r.data);

export const fetchMarketplacePreviews = (limit = 4) =>
  client.get('/home/marketplace-previews', { params: { limit } }).then(r => r.data);

export const fetchAnnouncement = () =>
  client.get('/home/announcement').then(r => r.data);

export const fetchFeatureFlags = () =>
  client.get('/home/feature-flags').then(r => r.data);

export const fetchDailyFeaturedPoem = () =>
  client.get('/home/featured-poem').then(r => r.data);
