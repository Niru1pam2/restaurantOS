import api from '../utils/axios';

const API_URL = '/api/categories';

export const getCategories = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post(API_URL, categoryData);
  return data;
};
