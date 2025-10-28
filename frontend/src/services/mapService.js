import { apiClient } from './apiClient.js';

export const searchPois = async (params) => {
  const { data } = await apiClient.get('/maps/pois', { params });
  return data.data;
};
