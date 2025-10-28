import { createClient } from '@supabase/supabase-js';
import { appConfig, isSupabaseEnabled } from './config.js';

let supabase = null;

if (isSupabaseEnabled) {
  supabase = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}

export { supabase };
