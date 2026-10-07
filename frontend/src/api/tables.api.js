import api from '../utils/axios';

const API_URL = '/api/tables';

export const getTables = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

export const createTable = async (tableData) => {
  const { data } = await api.post(API_URL, tableData);
  return data;
};

export const updateTableStatus = async (id, status) => {
  const { data } = await api.patch(`${API_URL}/${id}/status`, { status });
  return data;
};

export const updateTable = async (id, tableData) => {
  const { data } = await api.put(`${API_URL}/${id}`, tableData);
  return data;
};

export const deleteTable = async (id) => {
  const { data } = await api.delete(`${API_URL}/${id}`);
  return data;
};

