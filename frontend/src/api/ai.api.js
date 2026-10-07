import api from '../utils/axios';

const API_URL = '/api/ai';

export const predictShortages = async () => {
  const { data } = await api.get(`${API_URL}/predict-shortages`);
  return data;
};

export const getReorderRecommendations = async () => {
  const { data } = await api.get(`${API_URL}/reorder-recommendations`);
  return data;
};

export const suggestMenuPricing = async (targetMarginPercent = 65) => {
  const { data } = await api.post(`${API_URL}/suggest-pricing`, { targetMarginPercent });
  return data;
};

export const estimatePrepTime = async () => {
  const { data } = await api.get(`${API_URL}/estimate-prep-time`);
  return data;
};

export const analyzeWaste = async () => {
  const { data } = await api.get(`${API_URL}/waste-analysis`);
  return data;
};
