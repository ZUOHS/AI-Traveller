import { apiClient } from './apiClient.js';

export const getTrips = async () => {
  const { data } = await apiClient.get('/trips');
  return data.data;
};

export const createTrip = async (payload) => {
  const { data } = await apiClient.post('/trips', payload);
  return data.data;
};

export const getTrip = async (tripId) => {
  const { data } = await apiClient.get(`/trips/${tripId}`);
  return data.data;
};

export const updateTrip = async (tripId, payload) => {
  const { data } = await apiClient.put(`/trips/${tripId}`, payload);
  return data.data;
};

export const deleteTrip = async (tripId) => {
  await apiClient.delete(`/trips/${tripId}`);
};

export const generateItinerary = async (tripId, payload) => {
  const { data } = await apiClient.post(`/trips/${tripId}/plan`, payload);
  return data.data;
};

export const fetchItinerary = async (tripId) => {
  const { data } = await apiClient.get(`/trips/${tripId}/plan`);
  return data.data;
};

export const generateBudget = async (tripId, payload) => {
  const { data } = await apiClient.post(`/trips/${tripId}/budget`, payload);
  return data.data;
};

export const fetchBudget = async (tripId) => {
  const { data } = await apiClient.get(`/trips/${tripId}/budget`);
  return data.data;
};

export const analyzeTripDescription = async (description) => {
  const { data } = await apiClient.post('/trips/analyze', { description });
  return data.data;
};
