import api from '../utils/axios';

const API_URL = '/api/ingredients';

export const getIngredients = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

export const createIngredient = async (ingredientData) => {
  const { data } = await api.post(API_URL, ingredientData);
  return data;
};
