import { apiClient } from './apiClient.js';

export const listExpenses = async (tripId) => {
  const { data } = await apiClient.get(`/trips/${tripId}/expenses`);
  return data.data;
};

export const createExpense = async (tripId, payload) => {
  const { data } = await apiClient.post(`/trips/${tripId}/expenses`, payload);
  return data.data;
};

export const updateExpense = async (tripId, expenseId, payload) => {
  const { data } = await apiClient.put(
    `/trips/${tripId}/expenses/${expenseId}`,
    payload
  );
  return data.data;
};

export const deleteExpense = async (tripId, expenseId) => {
  await apiClient.delete(`/trips/${tripId}/expenses/${expenseId}`);
};

export const analyzeExpenseDescription = async (tripId, description) => {
  const { data } = await apiClient.post(`/trips/${tripId}/expenses/analyze`, {
    description
  });
  return data.data;
};
