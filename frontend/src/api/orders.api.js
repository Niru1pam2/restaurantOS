import api from '../utils/axios';

const API_URL = '/api/orders';

export const getOrders = async (query = {}) => {
  const { data } = await api.get(API_URL, { params: query });
  return data;
};

export const createOrder = async (orderData) => {
  const { data } = await api.post(API_URL, orderData);
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.patch(`${API_URL}/${id}/status`, { status });
  return data;
};

export const completePayment = async (id, paymentData) => {
  const { data } = await api.post(`${API_URL}/${id}/pay`, paymentData);
  return data;
};
