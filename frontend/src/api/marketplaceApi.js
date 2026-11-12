import client from './client';

export const getMarketplaceItems = async (params = {}) => {
  const res = await client.get('/marketplace/items', { params });
  return res.data;
};

export const getMarketplaceItemDetail = async (id) => {
  const res = await client.get(`/marketplace/items/${id}`);
  return res.data;
};

export const getSimilarMarketplaceItems = async (id) => {
  const res = await client.get(`/marketplace/items/${id}/similar`);
  return res.data;
};

export const toggleMarketplaceWishlist = async (itemId) => {
  const res = await client.post(`/marketplace/wishlist/${itemId}`, {});
  return res.data;
};

export const getWishlistIds = async () => {
  const res = await client.get('/marketplace/wishlist/ids');
  return res.data;
};

export const getWishlistItems = async () => {
  const res = await client.get('/marketplace/wishlist');
  return res.data;
};

export const addBookReview = async (id, data) => {
  const res = await client.post(`/marketplace/items/${id}/reviews`, data);
  return res.data;
};

export const getBookReviews = async (id) => {
  const res = await client.get(`/marketplace/items/${id}/reviews`);
  return res.data;
};

export const processStripeCheckout = async (data) => {
  const res = await client.post('/marketplace/checkout', data);
  return res.data;
};
