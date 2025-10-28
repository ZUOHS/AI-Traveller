import axios from 'axios';

import { appConfig } from '../lib/config.js';
import { useSessionStore } from '../store/useSessionStore.js';

const baseURL = appConfig.apiBaseUrl && appConfig.apiBaseUrl !== ''
  ? appConfig.apiBaseUrl
  : '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useSessionStore.getState().clear();
    }
    return Promise.reject(error);
  }
);
