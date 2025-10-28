import { apiClient } from './apiClient.js';

export const transcribeAudioFile = async (file) => {
  const formData = new FormData();
  formData.append('audio', file);

  const { data } = await apiClient.post('/speech/recognize', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data.data.transcript;
};
