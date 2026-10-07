import api from '../utils/axios';

const API_URL = '/api/recipes';

export const getRecipes = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

export const createRecipe = async (recipeData) => {
  const { data } = await api.post(API_URL, recipeData);
  return data;
};

export const deleteRecipeItem = async (id) => {
  const { data } = await api.delete(`${API_URL}/${id}`);
  return data;
};
