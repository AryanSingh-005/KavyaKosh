import client from './client';

/**
 * Generate a new poem using AI Studio backend.
 *
 * @param {Object} data
 * @param {string} data.prompt
 * @param {string} [data.emotion]
 * @param {string} [data.language]
 * @param {string} [data.theme]
 * @param {string} [data.form]
 */
export const generatePoem = async (data) => {
  const response = await client.post('/ai/generate', data);
  return response.data;
};

/**
 * Rewrite / polish an existing poem using AI Studio backend.
 *
 * @param {Object} data
 * @param {string} data.originalText
 * @param {string} [data.instruction]
 * @param {string} [data.targetEmotion]
 * @param {string} [data.targetLanguage]
 * @param {string} [data.targetStyle]
 */
export const rewritePoem = async (data) => {
  const response = await client.post('/ai/rewrite', data);
  return response.data;
};

/**
 * Fetch generation history for the logged-in user.
 */
export const getAiHistory = async () => {
  const response = await client.get('/ai/history');
  return response.data;
};

/**
 * Delete a specific history item by ID.
 */
export const deleteAiHistoryItem = async (historyId) => {
  const response = await client.delete(`/ai/history/${historyId}`);
  return response.data;
};
