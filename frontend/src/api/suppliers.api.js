import api from '../utils/axios';

const API_URL = '/api/suppliers';

export const getSuppliers = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

export const createSupplier = async (supplierData) => {
  const { data } = await api.post(API_URL, supplierData);
  return data;
};
