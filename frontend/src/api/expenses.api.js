import api from '../utils/axios';

const API_URL = '/api/expenses';

export const getExpenseCategories = async () => {
  const { data } = await api.get(`${API_URL}/categories`);
  return data;
};

export const createExpenseCategory = async (categoryData) => {
  const { data } = await api.post(`${API_URL}/categories`, categoryData);
  return data;
};

export const getExpenses = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

export const createExpense = async (expenseData) => {
  const { data } = await api.post(API_URL, expenseData);
  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await api.delete(`${API_URL}/${id}`);
  return data;
};
