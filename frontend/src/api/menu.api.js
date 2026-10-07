import api from '../utils/axios';

const API_URL = '/api/menu';

export const getMenuItems = async (categoryId) => {
  const params = categoryId ? { categoryId } : {};
  const { data } = await api.get(API_URL, { params });
  return data;
};

export const createMenuItem = async (menuData) => {
  const { data } = await api.post(API_URL, menuData);
  return data;
};

export const updateMenuItemAvailability = async (id, isAvailable) => {
  const { data } = await api.patch(`${API_URL}/${id}/availability`, { isAvailable });
  return data;
};
