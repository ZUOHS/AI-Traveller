import { createClient } from '@supabase/supabase-js';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let supabase = null;
let supabaseAdmin = null;

/**
 * 初始化 Supabase 客户端
 */
function initializeSupabase() {
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
}

// 初始启动时初始化
initializeSupabase();

/**
 * 重置并重新初始化 Supabase 客户端
 * 用于环境变量热重载后更新客户端
 */
export function resetSupabaseClient() {
  logger.info('🔄 重置 Supabase 客户端...');
  supabase = null;
  supabaseAdmin = null;
  initializeSupabase();
  return { supabase, supabaseAdmin };
}

export const memoryStore = {
  users: new Map(),
  trips: new Map(),
  itineraries: new Map(),
  itineraryItems: new Map(),
  expenses: new Map(),
  pendingOtps: new Map()
};

// 使用 getter 确保总是获取最新状态
export function getUseMockStore() {
  return !supabase || !supabaseAdmin;
}

// 为了兼容性保留
export const useMockStore = getUseMockStore();

// 使用 getter 导出，确保总是获取最新的客户端实例
export function getSupabase() {
  return supabase;
}

export function getSupabaseAdmin() {
  return supabaseAdmin;
}

// 为了兼容性，也导出变量（但建议使用 getter）
export { supabase, supabaseAdmin };
