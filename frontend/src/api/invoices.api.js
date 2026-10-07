import api from '../utils/axios';

const API_URL = '/api/invoices';

export const processInvoice = async (formData) => {
  const { data } = await api.post(`${API_URL}/process`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getInvoices = async () => {
  const { data } = await api.get(API_URL);
  return data;
};

export const exportExpenseRegisterExcel = async () => {
  const response = await api.get(`${API_URL}/export-excel`, { responseType: 'blob' });
  return response.data;
};
