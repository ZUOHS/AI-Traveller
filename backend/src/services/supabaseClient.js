import { createClient } from '@supabase/supabase-js';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let supabase = null;
let supabaseAdmin = null;

if (env.supabaseUrl && env.supabaseAnonKey) {
  supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });
  logger.info('Supabase client initialised (anon key)');
} else {
  logger.warn('Supabase anon client not initialised. Falling back to in-memory store.');
}

if (env.supabaseUrl && env.supabaseServiceRoleKey) {
  supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false
    }
  });
  logger.info('Supabase service client initialised');
} else {
  logger.warn('Supabase service client not initialised. Admin operations will be mocked.');
}

export const memoryStore = {
  users: new Map(),
  trips: new Map(),
  itineraries: new Map(),
  itineraryItems: new Map(),
  expenses: new Map(),
  pendingOtps: new Map()
};

export const useMockStore = !supabase || !supabaseAdmin;

export { supabase, supabaseAdmin };
