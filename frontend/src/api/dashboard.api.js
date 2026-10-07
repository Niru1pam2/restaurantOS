import api from '../utils/axios';

const API_URL = '/api/dashboard';

export const getDashboardSummary = async () => {
  const { data } = await api.get(`${API_URL}/summary`);
  return data;
};
