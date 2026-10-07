import api from '../utils/axios';

const API_URL = '/api/inventory';

export const getStockTransactions = async () => {
  const { data } = await api.get(`${API_URL}/transactions`);
  return data;
};

export const createStockTransaction = async (transactionData) => {
  const { data } = await api.post(`${API_URL}/transactions`, transactionData);
  return data;
};

export const getPurchaseOrders = async () => {
  const { data } = await api.get(`${API_URL}/purchase-orders`);
  return data;
};

export const createPurchaseOrder = async (poData) => {
  const { data } = await api.post(`${API_URL}/purchase-orders`, poData);
  return data;
};

export const updatePurchaseOrderStatus = async (id, status) => {
  const { data } = await api.patch(`${API_URL}/purchase-orders/${id}/status`, { status });
  return data;
};
