import api from '../utils/axios';

const API_URL = '/api/staff';

export const getStaff = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

export const createStaff = async (staffData) => {
  const { data } = await api.post(API_URL, staffData);
  return data;
};

export const updateStaff = async (id, staffData) => {
  const { data } = await api.put(`${API_URL}/${id}`, staffData);
  return data;
};

export const deleteStaff = async (id) => {
  const { data } = await api.delete(`${API_URL}/${id}`);
  return data;
};
