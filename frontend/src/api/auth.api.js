import api from '../utils/axios';

const API_URL = '/api/auth';

export const registerUser = async (userData) => {
  const { data } = await api.post(`${API_URL}/register`, userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post(`${API_URL}/login`, credentials);
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post(`${API_URL}/logout`);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get(`${API_URL}/me`);
  return data;
};

export const getOwnerOnly = async () => {
  const { data } = await api.get(`${API_URL}/owner-only`);
  return data;
};

export const getKitchen = async () => {
  const { data } = await api.get(`${API_URL}/kitchen`);
  return data;
};
