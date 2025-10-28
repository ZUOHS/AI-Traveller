import { apiClient } from './apiClient.js';
import { supabase } from '../lib/supabaseClient.js';
import { isSupabaseEnabled } from '../lib/config.js';

export const exchangeToken = async (accessToken) => {
  const { data } = await apiClient.post('/auth/token', { accessToken });
  return data.data;
};

export const fetchProfile = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data.data;
};

export const requestOtp = async ({ email, username }) => {
  const { data } = await apiClient.post('/auth/otp/send', {
    email,
    username
  });
  return data.data;
};

export const verifyOtp = async ({ email, token }) => {
  const { data } = await apiClient.post('/auth/otp/verify', {
    email,
    token
  });
  return data.data;
};

export const signOutSupabase = async () => {
  if (isSupabaseEnabled && supabase) {
    await supabase.auth.signOut();
  }
};
